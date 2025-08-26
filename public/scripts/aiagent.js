//for shell_scripts
import { executehellooscript } from './shell_scripts_js/helloo.js';
import { executehello2script } from './shell_scripts_js/hello2.js';
import { executemakefolderscript } from './shell_scripts_js/makefolder.js';
import { executehelloscript } from './shell_scripts_js/hello.js';


//for ansible playbooks
import { executeAnsibleTestPlaybook } from './ansible_scripts_js/ansibleTestPlaybook.js';
import { executegetosdetailsPlaybook } from './ansible_scripts_js/getosdetails.js';



const chatContainer = document.getElementById('chat-container');
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const chatSendButton = document.querySelector('.chat-send-button');
const botMouth = document.getElementById('bot-mouth');
const muteToggleButton = document.querySelector('.mute-toggle-button');
let isMuted = false;

// Persistence keys
const AIA_HISTORY_KEY = 'aiagent_history_v1';
const AIA_AGENT_ID = 'aiagent';
const AIA_SESSION_ID = (()=>{ const key='aiagent_session_id'; let v=localStorage.getItem(key); if(!v){ v=Math.random().toString(36).slice(2); localStorage.setItem(key, v);} return v; })();

function saveAiHistory(){
    try {
        const messages = Array.from(chatBox.querySelectorAll('.message')).map(el => {
            const role = el.classList.contains('user') ? 'user' : 'bot';
            const content = el.querySelector('.message-content')?.innerHTML || '';
            return { role, content };
        });
        localStorage.setItem(AIA_HISTORY_KEY, JSON.stringify(messages.slice(-50)));
    } catch(_) {}
}

function renderAiHistory(){
    try {
        const raw = localStorage.getItem(AIA_HISTORY_KEY);
        if (!raw) return;
        const msgs = JSON.parse(raw);
        chatBox.innerHTML = '';
        for (const m of msgs) {
            const el = document.createElement('div');
            el.className = `message ${m.role === 'user' ? 'user' : 'bot'}`;
            const content = document.createElement('div');
            content.className = 'message-content';
            content.innerHTML = m.content || '';
            el.appendChild(content);
            chatBox.appendChild(el);
        }
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch(_) {}
}

let predefinedAnswers = {};
let spellCorrections = {};

fetch('/trainingData.json') // Correct path for the file in the public folder
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        predefinedAnswers = data.predefinedAnswers;
        spellCorrections = data.spellCorrections;
        console.log('Training data loaded:', data); // Debug log
        enableChatInput();
    })
    .catch(error => {
        console.error('Error loading training data:', error);
        chatInput.placeholder = "Failed to load data";
    });

let lastSuggestion = null;

function enableChatInput() {
    console.log('Enabling chat input'); // Debug log
    chatInput.disabled = false;
    chatSendButton.disabled = false;
    chatInput.placeholder = "Type a message...";
    chatInput.addEventListener('keypress', handleKeyPress);
    chatSendButton.addEventListener('click', sendMessage); // Ensure the send button calls sendMessage
    muteToggleButton.addEventListener('click', toggleMute); // Ensure the mute button calls toggleMute
    renderAiHistory();
    const newBtn = document.getElementById('aiagent-newchat');
    if (newBtn) newBtn.addEventListener('click', () => {
        try { localStorage.removeItem(AIA_HISTORY_KEY); } catch(_) {}
        chatBox.innerHTML = '';
        chatInput.value = '';
    fetch('/api/chat/history', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ agent: AIA_AGENT_ID, session: AIA_SESSION_ID }) }).catch(()=>{});
    });
}

function toggleMute() {
    isMuted = !isMuted;
    muteToggleButton.textContent = isMuted ? 'Unmute' : 'Mute'; // Change button text based on mute state
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    console.log('Send message called'); // Debug log
    let userMessage = chatInput.value.trim().toLowerCase();
    if (userMessage) {
        console.log('User message:', userMessage); // Debug log
        if (userMessage === 'cancel') {
            cancelOperation(addMessageWithAnimation);
            chatInput.value = '';
            return;
        }

        if (lastSuggestion && userMessage === "yes") {
            userMessage = lastSuggestion;
            lastSuggestion = null;
        } else {
            userMessage = correctSpelling(userMessage);
        }
        addMessageWithAnimation(userMessage, 'user');
        chatInput.value = '';
        respondToUser(userMessage); // Ensure this function is called to generate a response
    }
}

function correctSpelling(message) {
    const words = message.split(' ');
    for (let i = 0; i < words.length; i++) {
        if (spellCorrections[words[i]]) {
            words[i] = spellCorrections[words[i]];
        }
    }
    return words.join(' ');
}

// New animation function to replace addMessage
function addMessageWithAnimation(message, sender, messageId = null) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    
    if (messageId) {
        messageElement.setAttribute('data-message-id', messageId);
    }
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    messageElement.appendChild(messageContent);
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    saveAiHistory();
    try {
        const raw = localStorage.getItem(AIA_HISTORY_KEY);
        const msgs = raw ? JSON.parse(raw) : [];
        fetch('/api/chat/history', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ agent: AIA_AGENT_ID, session: AIA_SESSION_ID, messages: msgs }) });
    } catch(_) {}
    
    // If it's a user message or a status message, show it immediately
    if (sender === 'user' || message === "Thinking..." || message === "Searching knowledge base...") {
        messageContent.innerHTML = message;
    saveAiHistory();
    return;
    }
    
    // For bot responses, do word-by-word animation
    if (sender === 'bot') {
        // Add typing class to show cursor
        messageContent.classList.add('typing');
        
        // Split message into words and punctuation
        const words = message.match(/[\w']+|[.,!?;:]|\n/g) || [];
        let wordIndex = 0;
        
        // Function to type each word with varying speed
        function typeNextWord() {
            if (wordIndex < words.length) {
                const word = words[wordIndex];
                
                // Add appropriate spacing
                if (wordIndex > 0 && !word.match(/[.,!?;:]/) && words[wordIndex-1] !== '\n') {
                    messageContent.innerHTML += ' ';
                }
                
                // Add the word
                messageContent.innerHTML += word;
                wordIndex++;
                
                // Scroll to bottom
                chatBox.scrollTop = chatBox.scrollHeight;
                
                // Dynamic delay based on word length and punctuation
                let delay = 40 + (word.length * 5); // Base delay + extra for longer words
                
                // Longer pause after sentence endings
                if (word.match(/[.!?]$/)) {
                    delay = 400;
                } 
                // Brief pause after commas
                else if (word.match(/[,;:]$/)) {
                    delay = 200;
                }
                // Longer pause for new lines (like in lists)
                else if (word === '\n') {
                    messageContent.innerHTML += '<br>';
                    delay = 300;
                }
                
                // Schedule next word
                setTimeout(typeNextWord, delay);
            } else {
                // Remove typing class when finished
                messageContent.classList.remove('typing');
                
                // After finishing typing, optionally speak the message
                if (!isMuted) {
                    speak(message);
                }
                saveAiHistory();
                try {
                    const raw = localStorage.getItem(AIA_HISTORY_KEY);
                    const msgs = raw ? JSON.parse(raw) : [];
                    fetch('/api/chat/history', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ agent: AIA_AGENT_ID, session: AIA_SESSION_ID, messages: msgs }) });
                } catch(_) {}
            }
        }
        
        // Start typing
        typeNextWord();
    }
}

// Keep the original addMessage as a fallback or for compatibility
function addMessage(message, sender) {
    // Just call the new animation function
    addMessageWithAnimation(message, sender);
}

async function respondToUser(userMessage) {
    // Generate unique ID for this message thread
    const messageId = Date.now();
    
    // 1. Check predefined answers
    if (predefinedAnswers[userMessage]) {
        addMessageWithAnimation(predefinedAnswers[userMessage], 'bot');
        // If you want to trigger scripts/playbooks, add your logic here
        if (userMessage === "run ansible test playbook") {
            executeAnsibleTestPlaybook(addMessageWithAnimation);
        } else if (userMessage === "run getosdetails playbook") {
            executegetosdetailsPlaybook(addMessageWithAnimation);
        } else if (userMessage === "install ansible") {
            executeinstallansible(addMessageWithAnimation);
        } else if (userMessage === "execute hello2.sh") {
            executehello2script(addMessageWithAnimation);
        } else if (userMessage === "execute makefolder.sh") {
            executemakefolderscript(addMessageWithAnimation);
        } else if (userMessage === "execute helloo.sh") {
            executehellooscript(addMessageWithAnimation);
        } else if (userMessage === "execute hello.sh") {
            executehelloscript(addMessageWithAnimation);
        }
        return;
    }

    // 2. Try /chatbot for command matching
    addMessageWithAnimation("Thinking...", 'bot', messageId);
    try {
        const chatbotResponse = await fetch('/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });
        const chatbotData = await chatbotResponse.json();
        
        // Remove the thinking message
        const thinkingMsg = document.querySelector(`[data-message-id="${messageId}"]`);
        if (thinkingMsg) thinkingMsg.remove();
        
        if (chatbotData.matchedKey && predefinedAnswers[chatbotData.matchedKey]) {
            // Recursively handle matched command
            respondToUser(chatbotData.matchedKey);
            return;
        }
    } catch (error) {
        // Continue to RAG if there's an error
        const thinkingMsg = document.querySelector(`[data-message-id="${messageId}"]`);
        if (thinkingMsg) thinkingMsg.remove();
    }

    // 3. Try RAG knowledge base
    addMessageWithAnimation("Searching knowledge base...", 'bot', messageId);
    try {
        const ragResponse = await fetch('/rag-knowledgebase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: userMessage })
        });
        const ragData = await ragResponse.json();
        
        // Remove the searching message
        const searchingMsg = document.querySelector(`[data-message-id="${messageId}"]`);
        if (searchingMsg) searchingMsg.remove();
        
        if (ragData.answer) {
            // Format lists with line breaks (improved regex)
            let formattedAnswer = ragData.answer;
            
            // Better list detection for numbered lists
            formattedAnswer = formattedAnswer.replace(/(\d+\.\s+[^\.\n]+)/g, '$1\n');
            
            // Also handle bullet points
            formattedAnswer = formattedAnswer.replace(/(\•\s+[^\.\n]+)/g, '$1\n');
            
            addMessageWithAnimation(formattedAnswer, 'bot');
            return;
        }
    } catch (err) {
        // Remove the searching message if there was an error
        const searchingMsg = document.querySelector(`[data-message-id="${messageId}"]`);
        if (searchingMsg) searchingMsg.remove();
    }

    // 4. Fallback
    addMessageWithAnimation("Sorry, I couldn't get a response from AI.", 'bot');
}

function speak(text) {
    if ('speechSynthesis' in window && !isMuted) {
        const utterance = new SpeechSynthesisUtterance(stripHtml(text));
        speechSynthesis.speak(utterance);
        animateMouth();
    } else {
        console.error('Speech Synthesis not supported in this browser or is muted.');
    }
}

function stripHtml(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}

function animateMouth() {
    botMouth.style.display = 'block';
    botMouth.style.animation = 'talk 0.5s infinite';
    setTimeout(() => {
        botMouth.style.animation = 'none';
        botMouth.style.display = 'none';
    }, 2000); // Remove mouth animation after 2 seconds
}

function executeinstallansible(addMessageCallback) {
    // Use the passed callback function (which should be addMessageWithAnimation)
    addMessageCallback("installing ansible...", 'bot');
    fetch('/run-script-installansible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptPath: 'ansible.sh' })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            addMessageCallback(`Error executing script: ${data.error}`, 'bot');
        } else {
            addMessageCallback(`Script executed successfully: ${data.output}`, 'bot');
        }
    })
    .catch(error => {
        console.error('Error executing script:', error);
        addMessageCallback(`Error: ${error.message}`, 'bot');
    });
}

function cancelOperation(addMessageCallback) {
    // This is a placeholder - replace with your actual cancel logic
    addMessageCallback("Operation cancelled.", 'bot');
}

const logoffButton = document.getElementById('logoff-button');
if (logoffButton) {
    logoffButton.addEventListener('click', async () => {
        await fetch('/api/logoff', { method: 'POST' });
        window.location.href = '/login.html';
    });
}
