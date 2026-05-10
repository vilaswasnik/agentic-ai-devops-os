const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const LAB_USER = process.env.ANSIBLE_LAB_USER || 'test_user';
const LAB_PASS = process.env.ANSIBLE_LAB_PASS || 'test_user';
const { askLLM, getProviderInfo, switchProvider, askLLMStream, isAwsConfigured } = require('./public/scripts/llmService');
const predefinedAnswers = require('./public/trainingData.json').predefinedAnswers;
const fs = require('fs');
const { 
  authenticateToken, 
  requireAdmin, 
  requireOperator, 
  generateToken, 
  hashPassword, 
  comparePassword 
} = require('./middleware/auth');
const {
  executeShellScript,
  executeAnsiblePlaybook,
  executeAnsibleScript,
  getAllowedShellScripts,
  getAllowedPlaybooks
} = require('./middleware/secureExec');
require('dotenv').config();

// Optional: Levenshtein distance for fuzzy matching
function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function findClosestKey(input, keys) {
    let minDistance = Infinity;
    let closestKey = null;
    for (const key of keys) {
        const distance = levenshteinDistance(input, key);
        if (distance < minDistance) {
            minDistance = distance;
            closestKey = key;
        }
    }
    // Only return if it's reasonably close (tune threshold as needed)
    return minDistance <= 2 ? closestKey : null;
}

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for demo purposes
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - restrict in production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:8080'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiter for sensitive operations
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many requests, please try again later.'
});

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.'
});

app.use(globalLimiter);

// Ensure static files are served from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Serve the aiagent HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve the admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// DEPRECATED: Legacy endpoint - kept for backward compatibility but with security
app.post('/run-script', authenticateToken, requireOperator, strictLimiter, async (req, res) => {
    const { scriptPath } = req.body;
    if (!scriptPath) {
        console.error('Script path is missing in the request.');
        return res.status(400).json({ error: 'Script path is required' });
    }
    
    // Block getOSDetailsLinux and only allow specific scripts
    if (scriptPath.includes('getOSDetailsLinux')) {
        return res.status(403).json({ error: 'This script is disabled.' });
    }

    try {
        const scriptName = path.basename(scriptPath);
        const baseDir = path.join(__dirname, 'public', 'scripts');
        const result = await executeShellScript(scriptName, baseDir, 5000);
        
        console.log(`✅ Script executed by ${req.user.username}: ${scriptName}`);
        res.json({ output: result.stdout });
    } catch (error) {
        console.error(`❌ Script execution failed: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});


// Execute shell scripts from shell_scripts folder (secured with allowlist)
app.post('/run-shellscript', authenticateToken, requireOperator, strictLimiter, async (req, res) => {
    const { scriptPath } = req.body;

    // Validate scriptPath
    if (!scriptPath) {
        console.error('Script path is missing in the request.');
        return res.status(400).json({ error: 'Script path is required' });
    }
    if (!scriptPath.endsWith('.sh')) {
        console.error('Invalid script type. Only .sh scripts are allowed.');
        return res.status(400).json({ error: 'Invalid script type' });
    }

    try {
        const scriptName = path.basename(scriptPath);
        const baseDir = path.join(__dirname, 'public', 'scripts', 'shell_scripts');
        const result = await executeShellScript(scriptName, baseDir, 5000);
        
        console.log(`✅ Shell script executed by ${req.user.username}: ${scriptName}`);
        res.json({ output: result.stdout });
    } catch (error) {
        console.error(`❌ Shell script execution failed: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// Get list of allowed shell scripts
app.get('/api/allowed-scripts', authenticateToken, (req, res) => {
    res.json({ scripts: getAllowedShellScripts() });
});



// Execute Ansible installation scripts (secured)
app.post('/run-script-installansible', authenticateToken, requireOperator, strictLimiter, async (req, res) => {
    const { scriptPath } = req.body;
    if (!scriptPath) {
        console.error('Script path is missing in the request.');
        return res.status(400).json({ error: 'Script path is required' });
    }

    try {
        const scriptName = path.basename(scriptPath);
        const baseDir = path.join(__dirname, 'ansible');
        const result = await executeAnsibleScript(scriptName, baseDir, 60000);
        
        console.log(`✅ Ansible script executed by ${req.user.username}: ${scriptName}`);
        res.json({ output: result.stdout });
    } catch (error) {
        console.error(`❌ Ansible script execution failed: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// Execute the Ansible Hello World playbook (secured)
app.post('/run-ansible-helloworld', authenticateToken, requireOperator, strictLimiter, async (req, res) => {
    try {
        const playbookName = 'ansiblehelloworld.yml';
        const inventoryName = 'inventory';
        const playbookDir = path.join(__dirname, 'public', 'scripts');
        const inventoryDir = path.join(__dirname, 'ansible');
        
        const result = await executeAnsiblePlaybook(
            playbookName, 
            inventoryName, 
            playbookDir, 
            inventoryDir,
            30000
        );
        
        console.log(`✅ Ansible Hello World executed by ${req.user.username}`);
        res.json({ output: result.stdout });
    } catch (error) {
        console.error(`❌ Ansible playbook execution failed: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// Execute an Ansible playbook (secured with allowlist)
app.post('/run-playbook', authenticateToken, requireOperator, strictLimiter, async (req, res) => {
    const { playbookPath, inventoryPath } = req.body;
    if (!playbookPath || !inventoryPath) {
        console.error('Playbook path or inventory path is missing in the request.');
        return res.status(400).json({ error: 'Playbook path and inventory path are required' });
    }

    try {
        const playbookName = path.basename(playbookPath);
        const inventoryName = path.basename(inventoryPath);
        const playbookDir = path.join(__dirname, 'ansible');
        const inventoryDir = path.join(__dirname, 'ansible');
        
        const result = await executeAnsiblePlaybook(
            playbookName,
            inventoryName,
            playbookDir,
            inventoryDir,
            60000
        );
        
        console.log(`✅ Ansible playbook executed by ${req.user.username}: ${playbookName}`);
        res.json({ output: result.stdout });
    } catch (error) {
        console.error(`❌ Ansible playbook execution failed: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// Get list of allowed playbooks
app.get('/api/allowed-playbooks', authenticateToken, (req, res) => {
    res.json({ playbooks: getAllowedPlaybooks() });
});

// Endpoint to handle chatbot messages
app.post('/chatbot', async (req, res) => {
    const { message } = req.body;
    const predefinedKeys = Object.keys(predefinedAnswers);
    const messageLower = message.toLowerCase();

    try {
        // STEP 1: Direct match in predefinedAnswers
        let matchedKey = null;
        
        // Check exact matches first
        for (const key of predefinedKeys) {
            if (messageLower === key.toLowerCase()) {
                matchedKey = key;
                break;
            }
        }
        
        // If no exact match, check fuzzy matches
        if (!matchedKey) {
            matchedKey = findClosestKey(messageLower, predefinedKeys);
        }
        
        // If we found a match in predefined answers, return it immediately
        if (matchedKey) {
            console.log(`Found predefined answer for: ${message} -> ${matchedKey}`);
            return res.json({ matchedKey });
        }
        
        // STEP 2: If no predefined match, try knowledge base embeddings
        console.log(`No predefined answer found for: ${message}, checking knowledge base...`);
        
        // Check if we have embeddings data
        if (embeddings && embeddings.length > 0) {
            // TODO: Implement embedding similarity search when AWS is configured
            // For now, we'll use simple keyword matching as fallback
        }
        
        // STEP 3: Use AWS LLM as final fallback to suggest the best matching command
        const prompt = `
You are an intelligent assistant that maps user requests to specific commands. You excel at understanding natural language variations, politeness markers, and informal speech.

Available Commands:
${predefinedKeys.map(key => `- ${key}`).join('\n')}

User Input: "${message}"

Common variations you should understand:
- Politeness: "please", "can you", "would you", "could you"
- Greetings: "hey", "hi", "hello" 
- Action words: "run", "execute", "start", "do"
- Casual language: "gonna", "wanna", "lemme"

Task: Analyze the user's intent and map it to the EXACT command key that best matches their request. 

Rules:
1. Ignore politeness markers (please, can you, etc.)
2. Focus on the core action/intent
3. Map variations to standard commands
4. If no good match exists, reply with "none"

Reply with ONLY the exact command key from the list above, or "none".
`;

        try {
            const aiResponse = await askLLM(prompt, {
                temperature: 0.3, // Lower temperature for more consistent matching
                max_tokens: 50    // Short response needed
            });
            let aiMatchedKey = aiResponse.trim().toLowerCase();
            if (aiMatchedKey === "none") aiMatchedKey = null;
            
            // Validate AI's response against our predefined keys
            if (aiMatchedKey && !predefinedAnswers[aiMatchedKey]) {
                aiMatchedKey = findClosestKey(aiMatchedKey, predefinedKeys);
            }
            
            console.log(`AWS LLM suggested: ${aiMatchedKey} for query: ${message}`);
            res.json({ matchedKey: aiMatchedKey });
        } catch (llmError) {
            console.log(`AWS LLM not available, no match found for: ${message}`);
            // If AWS LLM fails, return no match
            res.json({ matchedKey: null });
        }
        
    } catch (error) {
        console.error('Chatbot endpoint error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Secure user management with bcrypt hashed passwords
// NOTE: In production, move this to a database (PostgreSQL recommended)
const users = {}; // Will store: { username: { passwordHash, role, temp } }

// Initialize default admin user on startup (hash password once)
async function initializeDefaultUsers() {
  try {
    // Only create if no admin exists
    if (!users['admin']) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const adminHash = await hashPassword(adminPassword);
      users['admin'] = { 
        passwordHash: adminHash, 
        role: 'admin',
        temp: false 
      };
      console.log('✅ Default admin user initialized');
      if (!process.env.ADMIN_PASSWORD) {
        console.warn('⚠️  WARNING: Using default admin password. Set ADMIN_PASSWORD in .env for production!');
      }
    }
  } catch (error) {
    console.error('Failed to initialize users:', error.message);
  }
}

// Call initialization
initializeDefaultUsers();

// Helper to add a user
async function addUser(username, password, role = 'viewer', temp = true) {
  const passwordHash = await hashPassword(password);
  users[username] = { passwordHash, role, temp };
  return { username, role, temp };
}

// LLM Provider Management Endpoints
app.get('/api/llm/status', async (req, res) => {
    try {
        const providerInfo = getProviderInfo();
        const { checkAWSHealth } = require('./public/scripts/llmService');
        
        const status = {
            ...providerInfo,
            awsAvailable: await checkAWSHealth(),
            credentialsConfigured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
        };
        
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/llm/switch', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { provider } = req.body;
        if (!provider || !['aws'].includes(provider)) {
            return res.status(400).json({ error: 'Invalid provider. Currently only "aws" is supported' });
        }
        
        const newInfo = switchProvider(provider);
        res.json({ success: true, provider: newInfo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/llm/test', authenticateToken, async (req, res) => {
    try {
        const { message, provider } = req.body;
        const testPrompt = message || 'Hello! Please respond with a brief greeting.';
        
        const response = await askLLM(testPrompt, { provider });
        res.json({ success: true, response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login endpoint with JWT
app.post('/api/login', authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.json({ success: false, message: 'Username and password required' });
        }
        
        const user = users[username];
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        // Compare password with hash
        const isValid = await comparePassword(password, user.passwordHash);
        if (!isValid) {
            return res.json({ success: false, message: 'Incorrect password' });
        }
        
        if (user.temp) {
            return res.json({ 
                success: false, 
                resetRequired: true, 
                message: 'Password reset required' 
            });
        }
        
        // Generate JWT token
        const token = generateToken({ username, role: user.role });
        
        res.json({ 
            success: true, 
            token,
            user: {
                username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Password reset endpoint
app.post('/api/reset', authLimiter, async (req, res) => {
    try {
        const { username, password, newPassword } = req.body;
        
        if (!username || !password || !newPassword) {
            return res.json({ success: false, message: 'All fields required' });
        }
        
        const user = users[username];
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        // Verify current password
        const isValid = await comparePassword(password, user.passwordHash);
        if (!isValid) {
            return res.json({ success: false, message: 'Current password incorrect' });
        }
        
        // Hash and save new password
        const newHash = await hashPassword(newPassword);
        users[username].passwordHash = newHash;
        users[username].temp = false;
        
        res.json({ success: true, message: 'Password reset successful. Please login.' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ success: false, message: 'Password reset failed' });
    }
});

// ===== Chat History Persistence (file-backed) =====
const dataDir = path.join(__dirname, 'data');
const convoFile = path.join(dataDir, 'conversations.json');

function ensureDataStore() {
    try { if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true }); } catch (_) {}
    try { if (!fs.existsSync(convoFile)) fs.writeFileSync(convoFile, JSON.stringify({}), 'utf8'); } catch (_) {}
}

function loadConversations() {
    ensureDataStore();
    try {
        const raw = fs.readFileSync(convoFile, 'utf8');
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        console.error('Failed to read conversations:', e.message);
        return {};
    }
}

function saveConversations(obj) {
    try {
        fs.writeFileSync(convoFile, JSON.stringify(obj, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('Failed to write conversations:', e.message);
        return false;
    }
}

// Get history for an agent + session (requires authentication)
app.get('/api/chat/history', authenticateToken, (req, res) => {
    const agent = (req.query.agent || '').toString();
    const session = (req.query.session || '').toString();
    if (!agent || !session) return res.status(400).json({ error: 'Missing agent or session' });
    const store = loadConversations();
    const messages = (store[agent] && store[agent][session]) || [];
    res.json({ messages });
});

// Overwrite history for an agent + session (requires authentication)
app.post('/api/chat/history', authenticateToken, (req, res) => {
    const { agent, session, messages } = req.body || {};
    if (!agent || !session || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid payload' });
    const store = loadConversations();
    store[agent] = store[agent] || {};
    store[agent][session] = messages;
    if (!saveConversations(store)) return res.status(500).json({ error: 'Failed to persist' });
    res.json({ success: true });
});

// Delete history for an agent + session (requires authentication)
app.delete('/api/chat/history', authenticateToken, (req, res) => {
    const { agent, session } = req.body || {};
    if (!agent || !session) return res.status(400).json({ error: 'Invalid payload' });
    const store = loadConversations();
    if (store[agent]) {
        delete store[agent][session];
        if (Object.keys(store[agent]).length === 0) delete store[agent];
        if (!saveConversations(store)) return res.status(500).json({ error: 'Failed to persist' });
    }
    res.json({ success: true });
});

// Logoff endpoint
app.post('/api/logoff', authenticateToken, (req, res) => {
    // Clear session/cookie logic here
    res.json({ success: true });
});

// RAG Knowledge Base endpoint
const embeddingsPath = path.join(__dirname, 'public/scripts/documents/knowledgeBase_embeddings.json');
let embeddings = [];
if (fs.existsSync(embeddingsPath)) {
    try {
        embeddings = JSON.parse(fs.readFileSync(embeddingsPath, 'utf8'));
        console.log(`✅ Knowledge base embeddings loaded: ${embeddings.length} chunks available`);
    } catch (error) {
        console.error('❌ Error loading knowledge base embeddings:', error.message);
        embeddings = [];
    }
} else {
    console.log('⚠️ Knowledge base embeddings file not found at:', embeddingsPath);
}

app.post('/rag-knowledgebase', async (req, res) => {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Missing question' });

    try {
        console.log(`Processing knowledge base query: ${question}`);
        
        // STEP 1: Use embeddings data for sophisticated semantic search
        let bestMatches = [];
        
        if (embeddings && embeddings.length > 0) {
            console.log(`🔍 Searching through ${embeddings.length} knowledge base chunks for: "${question}"`);
            
            // Enhanced keyword matching with scoring
            const questionLower = question.toLowerCase();
            const questionWords = questionLower.split(/\s+/).filter(word => word.length > 2);
            
            for (const item of embeddings) {
                const textLower = item.text.toLowerCase();
                let score = 0;
                
                // Calculate relevance score based on multiple factors
                for (const word of questionWords) {
                    if (textLower.includes(word)) {
                        score += 1;
                        
                        // Boost score for exact word boundaries
                        const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
                        if (wordRegex.test(item.text)) {
                            score += 1;
                        }
                    }
                }
                
                // Extra boost for exact phrase matches
                if (textLower.includes(questionLower)) {
                    score += 3;
                }
                
                // Boost for topic-specific keywords
                const topicKeywords = {
                    'skills': ['skill', 'azure', 'ansible', 'docker', 'kubernetes'],
                    'experience': ['experience', 'professional', 'client', 'project'],
                    'certifications': ['certification', 'certified', 'exam'],
                    'education': ['education', 'degree', 'university'],
                    'technical': ['technical', 'technology', 'platform', 'tool']
                };
                
                for (const [topic, keywords] of Object.entries(topicKeywords)) {
                    if (keywords.some(keyword => questionLower.includes(keyword))) {
                        if (keywords.some(keyword => textLower.includes(keyword))) {
                            score += 2;
                        }
                    }
                }
                
                if (score > 0) {
                    bestMatches.push({ item, score });
                }
            }
            
            // Sort by score and take top matches
            bestMatches.sort((a, b) => b.score - a.score);
            console.log(`📊 Found ${bestMatches.length} relevant chunks. Top scores: ${bestMatches.slice(0, 3).map(m => m.score).join(', ')}`);
        }
        
        // STEP 2: Prepare context from best matches and uploaded documents
        let context = '';
        let documentContext = '';
        
        // Search in uploaded documents
        if (documentEmbeddings.length > 0) {
            const queryLower = question.toLowerCase();
            const matchingDocChunks = documentEmbeddings
                .filter(chunk => chunk.text.toLowerCase().includes(queryLower))
                .slice(0, 2) // Top 2 document matches
                .map(chunk => `From ${chunk.documentName}: ${chunk.text}`)
                .join('\n\n');
            
            if (matchingDocChunks) {
                documentContext = `\n\nFrom Uploaded Documents:\n${matchingDocChunks}`;
                console.log(`📄 Found relevant content in ${documentEmbeddings.filter(chunk => chunk.text.toLowerCase().includes(queryLower)).length} uploaded document chunks`);
            }
        }
        
        if (bestMatches.length > 0) {
            // Use the top 3 best matching chunks for richer context
            const topMatches = bestMatches.slice(0, 3);
            context = topMatches.map(match => match.item.text).join('\n\n---\n\n');
            
            console.log(`📝 Using ${topMatches.length} chunks for context. First chunk: ${topMatches[0].item.text.substring(0, 100)}...`);
        } else {
            // Fallback to hardcoded knowledge base for common topics
            const knowledgeBase = [
                {
                    topic: "ansible",
                    content: "Ansible is an automation platform. Common playbooks: getosdetails.yml, ansiblehelloworld.yml, ansibletest.yml. Use 'ansible-playbook -i inventory <playbook>' to execute. Examples: 'ansible-playbook -i inventory getosdetails.yml' for system information."
                },
                {
                    topic: "certifications",
                    content: "DevOps certifications include AWS DevOps Engineer Professional, Docker Certified Associate, Kubernetes Administrator (CKA), Certified Kubernetes Application Developer (CKAD), Jenkins Engineer, Terraform Associate, Ansible certifications, Red Hat certifications, and Azure DevOps Engineer Expert."
                },
                {
                    topic: "devsecops",
                    content: "DevSecOps responsibilities include: Security integration in CI/CD pipelines, vulnerability scanning and assessment, compliance monitoring and reporting, secure coding practices and code reviews, infrastructure security and configuration management."
                },
                {
                    topic: "docker",
                    content: "Docker is a containerization platform. Key commands: docker run, docker build, docker-compose up, docker ps, docker images. Used for application deployment, microservices architecture, and development environment consistency."
                },
                {
                    topic: "kubernetes",
                    content: "Kubernetes is a container orchestration platform. Key concepts: pods, services, deployments, namespaces, ingress, persistent volumes. Common commands: kubectl get pods, kubectl apply, kubectl describe."
                }
            ];

            const questionLower = question.toLowerCase();
            let relevantContent = [];

            knowledgeBase.forEach(item => {
                if (questionLower.includes(item.topic) || 
                    item.content.toLowerCase().includes(questionLower.split(' ').find(word => word.length > 3) || '')) {
                    relevantContent.push(item);
                }
            });

            context = relevantContent.map(item => item.content).join('\n\n');
        }
        
        // STEP 3: Generate response using available LLM
        if (context || documentContext) {
            console.log('💡 Found relevant knowledge base content, generating response');
            
            const fullContext = context + documentContext;
            const prompt = `You are a knowledgeable DevOps AI assistant. Based on the following information from my knowledge base and uploaded documents, please answer the user's question comprehensively and accurately.

Knowledge Base Information:
${fullContext}

User Question: ${question}

Instructions:
- Provide a detailed, helpful answer based on the knowledge base information
- Keep response to maximum 10 lines
- If the question is about technical skills, list them clearly
- If about experience, provide specific details about roles and responsibilities  
- If about tools or technologies, explain their purpose and usage
- Be professional but conversational
- Format lists and information clearly for readability
- Be concise but informative
- When referencing uploaded documents, mention the source

Answer:`;

            try {
                const answer = await askLLM(prompt, { 
                    temperature: 0.7,
                    max_tokens: 300 
                });
                
                console.log('✅ LLM generated response for knowledge base query');
                
                // Limit response to 10 lines maximum
                const limitedAnswer = answer.trim().split('\n').slice(0, 10).join('\n');
                return res.json({ answer: limitedAnswer });
            } catch (llmError) {
                console.log('⚠️ LLM not available, returning knowledge base content directly');
                // If LLM fails, return the context directly with better formatting
                const formattedContext = (context + documentContext)
                    .replace(/---/g, '\n\n')
                    .replace(/Component:/g, '\n**Component:**')
                    .replace(/Skill:/g, '\n**Skill:**')
                    .replace(/Experience:/g, '\n**Experience:**')
                    .replace(/Education:/g, '\n**Education:**')
                    .replace(/Certification:/g, '\n**Certification:**')
                    .replace(/From uploaded documents:/i, '\n**From Uploaded Documents:**');
                
                const fallbackAnswer = `Based on my knowledge base:\n\n${formattedContext}\n\n*Note: For more detailed responses, please ensure the AI service is properly configured.*`;
                return res.json({ answer: fallbackAnswer });
            }
        }
        
        // If no specific knowledge base match, provide general guidance
        console.log('No specific knowledge base match found, providing general guidance');
        const generalAnswer = `I can help you with information about:

• DevOps practices and tools (Ansible, Docker, Kubernetes)
• CI/CD pipelines and automation
• Cloud platforms (AWS, Azure)
• System administration and scripting
• Security and compliance (DevSecOps)
• Professional experience and certifications

Please ask a more specific question about any of these topics, and I'll search my knowledge base for detailed information.

Examples:
- "How do I run an Ansible playbook?"
- "What are Docker best practices?"
- "Tell me about DevOps certifications"
- "How do I set up CI/CD?"`;

        res.json({ answer: generalAnswer });

    } catch (error) {
        console.error('RAG knowledge base error:', error);
        res.status(500).json({ error: 'Failed to process knowledge base query. Please try again.' });
    }
});

// Document upload and processing endpoints
const multer = require('multer');
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Store uploaded documents
let uploadedDocuments = [];
let documentEmbeddings = [];

// Upload document endpoint (requires authentication)
app.post('/api/upload-document', authenticateToken, upload.single('document'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const document = {
            id: Date.now() + Math.random(),
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            content: req.file.buffer.toString('utf-8'),
            uploadDate: new Date().toISOString(),
            processed: false
        };

        uploadedDocuments.push(document);
        console.log(`📄 Document uploaded: ${document.originalName}`);
        
        res.json({
            success: true,
            documentId: document.id,
            message: `Document "${document.originalName}" uploaded successfully`
        });

    } catch (error) {
        console.error('Document upload error:', error);
        res.status(500).json({ error: 'Failed to upload document' });
    }
});

// Process document and generate embeddings (requires authentication)
app.post('/api/process-document', authenticateToken, async (req, res) => {
    try {
        const { documentId } = req.body;
        
        if (!documentId) {
            return res.status(400).json({ error: 'Document ID required' });
        }

        const document = uploadedDocuments.find(doc => doc.id == documentId);
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        console.log(`🔄 Processing document: ${document.originalName}`);

        // Chunk the document content
        const chunks = chunkText(document.content, 500); // 500 character chunks
        console.log(`📝 Created ${chunks.length} chunks from ${document.originalName}`);

        // For now, store without OpenAI embeddings (can be enhanced later)
        const processedChunks = chunks.map((chunk, index) => ({
            documentId: document.id,
            documentName: document.originalName,
            chunkIndex: index,
            text: chunk,
            embedding: null // Will be populated when OpenAI integration is added
        }));

        // Add to document embeddings
        documentEmbeddings.push(...processedChunks);
        
        // Mark document as processed
        document.processed = true;
        document.processedDate = new Date().toISOString();
        document.chunks = chunks.length;

        console.log(`✅ Document processed: ${document.originalName} (${chunks.length} chunks)`);

        res.json({
            success: true,
            message: `Document processed successfully`,
            chunks: chunks.length,
            documentName: document.originalName
        });

    } catch (error) {
        console.error('Document processing error:', error);
        res.status(500).json({ error: 'Failed to process document' });
    }
});

// Search in uploaded documents (requires authentication)
app.post('/api/search-documents', authenticateToken, async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Search query required' });
        }

        console.log(`🔍 Searching documents for: "${query}"`);

        // Simple keyword search in document chunks
        const queryLower = query.toLowerCase();
        const matchingChunks = documentEmbeddings
            .filter(chunk => chunk.text.toLowerCase().includes(queryLower))
            .slice(0, 5) // Top 5 matches
            .map(chunk => ({
                documentName: chunk.documentName,
                text: chunk.text,
                relevance: calculateRelevance(chunk.text, queryLower)
            }))
            .sort((a, b) => b.relevance - a.relevance);

        if (matchingChunks.length === 0) {
            return res.json({
                answer: "No relevant information found in uploaded documents. Please upload documents related to your query.",
                source: "uploaded_documents"
            });
        }

        // Combine matching chunks for context
        const context = matchingChunks
            .map(chunk => `From ${chunk.documentName}: ${chunk.text}`)
            .join('\n\n');

        // Generate response using LLM with document context
        const prompt = `Based on the following information from uploaded documents, please answer the user's question:

Document Content:
${context}

User Question: ${query}

Instructions:
- Provide a comprehensive answer based on the document content
- Keep response to maximum 10 lines
- Reference the source documents when relevant
- Be accurate and helpful

Answer:`;

        try {
            const answer = await askLLM(prompt, { 
                temperature: 0.7,
                max_tokens: 300 
            });
            
            // Limit to 10 lines
            const limitedAnswer = answer.trim().split('\n').slice(0, 10).join('\n');
            
            res.json({
                answer: limitedAnswer,
                source: "uploaded_documents",
                documents: matchingChunks.map(chunk => chunk.documentName)
            });

        } catch (llmError) {
            console.log('LLM not available, returning document excerpts');
            const fallbackAnswer = `Based on your uploaded documents:\n\n${context.substring(0, 800)}...`;
            res.json({
                answer: fallbackAnswer,
                source: "uploaded_documents",
                documents: matchingChunks.map(chunk => chunk.documentName)
            });
        }

    } catch (error) {
        console.error('Document search error:', error);
        res.status(500).json({ error: 'Failed to search documents' });
    }
});

// Get document statistics (requires authentication)
app.get('/api/document-stats', authenticateToken, (req, res) => {
    try {
        const totalDocuments = uploadedDocuments.length;
        const processedDocuments = uploadedDocuments.filter(doc => doc.processed).length;
        const totalChunks = documentEmbeddings.length;
        const totalSize = uploadedDocuments.reduce((sum, doc) => sum + doc.size, 0);

        res.json({
            totalDocuments,
            processedDocuments,
            totalChunks,
            totalSize,
            documents: uploadedDocuments.map(doc => ({
                id: doc.id,
                name: doc.originalName,
                size: doc.size,
                uploadDate: doc.uploadDate,
                processed: doc.processed,
                chunks: doc.chunks || 0
            }))
        });

    } catch (error) {
        console.error('Document stats error:', error);
        res.status(500).json({ error: 'Failed to get document statistics' });
    }
});

// Helper function to chunk text
function chunkText(text, maxChunkSize = 500) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (currentChunk.length + trimmedSentence.length > maxChunkSize) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = trimmedSentence;
            } else {
                // Handle very long sentences
                chunks.push(trimmedSentence.substring(0, maxChunkSize));
            }
        } else {
            currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks.filter(chunk => chunk.length > 10); // Filter out very short chunks
}

// Helper function to calculate text relevance
function calculateRelevance(text, query) {
    const textLower = text.toLowerCase();
    const queryWords = query.split(/\s+/).filter(word => word.length > 2);
    let score = 0;

    for (const word of queryWords) {
        const count = (textLower.match(new RegExp(word, 'g')) || []).length;
        score += count;
    }

    return score;
}
app.post('/agent-bot', async (req, res) => {
    const { question, options } = req.body || {};
    if (!question) return res.status(400).json({ error: 'Missing question' });

    // Offline fallback
    if (!isAwsConfigured()) {
        const fallback = `[offline LLM] AWS not configured. Echo summary: ${question.slice(0, 280)}`;
        return res.json({ answer: fallback, offline: true });
    }
    try {
        const answer = await askLLM(question, {
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.max_tokens ?? 400,
            model: options?.model
        });
        res.json({ answer: (answer || '').trim(), offline: false });
    } catch (error) {
        console.error('Agent Bot LLM error:', error.message);
        // Provide structured fallback
        res.status(500).json({ error: error.message || 'LLM error', offline: !isAwsConfigured() });
    }
});

// Agent Bot streaming via Server-Sent Events (SSE)
app.get('/agent-bot/stream', async (req, res) => {
    const question = req.query.q;
    const model = req.query.model || undefined;
    const temperature = req.query.temperature ? Number(req.query.temperature) : undefined;
    if (!question) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        return res.end('Missing q');
    }
    if (!isAwsConfigured()) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        const send = (data)=> res.write(`data: ${data}\n\n`);
        send(JSON.stringify({ token: '[offline] AWS credentials not set. Using echo mode.\n' }));
        send(JSON.stringify({ token: question.slice(0,200) }));
        send(JSON.stringify({ done: true, offline: true }));
        return res.end();
    }
    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders && res.flushHeaders();

    const send = (data) => res.write(`data: ${data}\n\n`);

    try {
        await askLLMStream(question, { model, temperature }, (token) => {
            send(JSON.stringify({ token }));
        });
        send(JSON.stringify({ done: true }));
        res.end();
    } catch (err) {
        console.error('SSE stream error:', err.message);
        send(JSON.stringify({ error: err.message }));
        send(JSON.stringify({ done: true }));
        res.end();
    }
});

// CentOS console endpoints removed per request.
// ===================== Ansible Lab (restored) =====================
// Lightweight containerized lab for editing & running playbooks from local ./ansible directory.
const ANSIBLE_LAB_IMAGE = process.env.ANSIBLE_LAB_IMAGE || 'quay.io/ansible/ansible-runner:latest';
const ANSIBLE_LAB_NAME = process.env.ANSIBLE_LAB_NAME || 'ansible-lab-agent';
const ansibleHostDir = path.join(__dirname, 'ansible');
let ansibleLabMeta = { id: null, startedAt: null };

function docker(cmd, timeout=60000){
    return new Promise((resolve, reject)=>{
        exec(cmd, { timeout }, (err, stdout, stderr)=>{
            if(err) return reject(new Error((stderr||'').trim() || err.message));
            resolve(stdout.trim());
        });
    });
}

async function ansibleStatus(){
    try {
        const ps = await docker(`docker ps -a --filter name=${ANSIBLE_LAB_NAME} --format '{{json .}}'`);
        if(!ps) return { running:false };
        const first = ps.split('\n').filter(Boolean)[0];
        if(!first) return { running:false };
        const meta = JSON.parse(first);
        const stateRaw = await docker(`docker inspect ${ANSIBLE_LAB_NAME} --format '{{json .State}}'`);
        const state = JSON.parse(stateRaw);
        const startedAt = state.StartedAt? new Date(state.StartedAt): null;
        if(startedAt && !ansibleLabMeta.startedAt) ansibleLabMeta.startedAt = startedAt;
        ansibleLabMeta.id = meta.ID;
        let createdAgo='';
        if(startedAt){ const mins = Math.floor((Date.now()-startedAt.getTime())/60000); createdAgo = mins<1? '<1m': mins+'m'; }
        return { running: state.Running, containerId: meta.ID, createdAgo };
    } catch(e){ return { running:false }; }
}

app.get('/api/lab/ansible/status', authenticateToken, async (req,res)=>{
    const st = await ansibleStatus();
    res.json(st);
});

app.post('/api/lab/ansible/start', authenticateToken, requireOperator, strictLimiter, async (req,res)=>{
    try {
        const st = await ansibleStatus();
        if(st.running) return res.json({ alreadyRunning:true, containerId: st.containerId });
        // Ensure host dir exists
        try { if(!fs.existsSync(ansibleHostDir)) fs.mkdirSync(ansibleHostDir, { recursive:true }); } catch(_){ }
        // Pull image (best effort)
        try { await docker(`docker pull ${ANSIBLE_LAB_IMAGE}`); } catch(_){ }
        const runCmd = [
            'docker run -d',
            '--name '+ANSIBLE_LAB_NAME,
            '--rm',
            `-v ${ansibleHostDir}:/workspace`,
            '-w /workspace',
            ANSIBLE_LAB_IMAGE,
            'sleep infinity'
        ].join(' ');
        const id = (await docker(runCmd, 90000)).trim();
        ansibleLabMeta = { id, startedAt: new Date() };
        // Best-effort ensure ansible present (some runner images may lack full ansible-playbook)
        docker(`docker exec ${ANSIBLE_LAB_NAME} bash -lc "which ansible-playbook || (pip install --no-cache-dir ansible || true)"`).catch(()=>{});
        res.json({ started:true, containerId: id });
    } catch(e){ res.status(500).json({ error: e.message }); }
});

app.post('/api/lab/ansible/stop', authenticateToken, requireOperator, async (req,res)=>{
    try {
        const st = await ansibleStatus();
        if(!st.running) return res.json({ alreadyStopped:true });
        await docker(`docker stop ${ANSIBLE_LAB_NAME}`);
        ansibleLabMeta = { id:null, startedAt:null };
        res.json({ stopped:true });
    } catch(e){ res.status(500).json({ error:e.message }); }
});

// List playbooks (yml/yaml) in host ansible directory root
app.get('/api/lab/ansible/playbooks', authenticateToken, async (req,res)=>{
    try {
        const files = fs.readdirSync(ansibleHostDir).filter(f=>/\.(yml|yaml)$/i.test(f));
        res.json({ output: files.join('\n'), cwd: ansibleHostDir });
    } catch(e){ res.status(500).json({ error:e.message }); }
});

// Fetch a single playbook
app.get('/api/lab/ansible/file', authenticateToken, (req,res)=>{
    const name = (req.query.name||'').toString();
    if(!/^[A-Za-z0-9._-]+\.(yml|yaml)$/.test(name)) return res.status(400).json({ error:'Bad name' });
    const fp = path.join(ansibleHostDir, name);
    if(!fs.existsSync(fp)) return res.status(404).json({ error:'Not found' });
    try { const content = fs.readFileSync(fp,'utf8'); res.json({ name, content, cwd: ansibleHostDir }); } catch(e){ res.status(500).json({ error:e.message }); }
});

// Save (create/update) a playbook
app.post('/api/lab/ansible/file', authenticateToken, requireOperator, (req,res)=>{
    const { name, content } = req.body||{};
    if(!name || !/^[A-Za-z0-9._-]+\.(yml|yaml)$/.test(name)) return res.status(400).json({ error:'Invalid name' });
    try { fs.writeFileSync(path.join(ansibleHostDir, name), content||'', 'utf8'); res.json({ saved:true, dir: ansibleHostDir }); } catch(e){ res.status(500).json({ error:e.message }); }
});

// Delete
app.delete('/api/lab/ansible/file', authenticateToken, requireOperator, (req,res)=>{
    const name = (req.query.name||'').toString();
    if(!/^[A-Za-z0-9._-]+\.(yml|yaml)$/.test(name)) return res.status(400).json({ error:'Bad name' });
    const fp = path.join(ansibleHostDir, name);
    if(!fs.existsSync(fp)) return res.status(404).json({ error:'Not found' });
    try { fs.unlinkSync(fp); res.json({ deleted:true }); } catch(e){ res.status(500).json({ error:e.message }); }
});

// Rename
app.post('/api/lab/ansible/rename', authenticateToken, requireOperator, (req,res)=>{
    const { oldName, newName } = req.body||{};
    if(!/^[A-Za-z0-9._-]+\.(yml|yaml)$/.test(oldName||'') || !/^[A-Za-z0-9._-]+\.(yml|yaml)$/.test(newName||'')) return res.status(400).json({ error:'Invalid names' });
    try {
        const oldPath = path.join(ansibleHostDir, oldName);
        const newPath = path.join(ansibleHostDir, newName);
        if(!fs.existsSync(oldPath)) return res.status(404).json({ error:'Old not found' });
        if(fs.existsSync(newPath)) return res.status(409).json({ error:'Target exists' });
        fs.renameSync(oldPath, newPath);
        res.json({ renamed:true });
    } catch(e){ res.status(500).json({ error:e.message }); }
});

// Execute arbitrary command (guarded) inside running container, working dir /workspace
app.post('/api/lab/ansible/exec', authenticateToken, requireOperator, strictLimiter, async (req,res)=>{
    try {
        const { cmd } = req.body||{};
        if(!cmd || typeof cmd !== 'string') return res.status(400).json({ error:'Missing cmd' });
        const st = await ansibleStatus();
        if(!st.running) return res.status(400).json({ error:'Lab not running' });
        // Basic safety: block docker inside container
        if(/docker\s/i.test(cmd)) return res.json({ stdout:'Command blocked', stderr:'', exitCode:0 });
        const safeCmd = cmd.replace(/'/g, "'\\''");
        let stdout='', stderr='';
        try {
            stdout = await docker(`docker exec ${ANSIBLE_LAB_NAME} bash -lc 'cd /workspace && ${safeCmd}'`, 180000);
        } catch(e){ stderr = e.message; }
        res.json({ stdout, stderr });
    } catch(e){ res.status(500).json({ error:e.message }); }
});

// Blockchain AI Agent removed.


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
