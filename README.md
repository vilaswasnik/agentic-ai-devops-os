# Agentic AI DevOps OS

**Enterprise-Grade AI-Powered DevOps Automation Platform with Docker Support**

Agentic AI DevOps OS is a production-ready, containerized platform that revolutionizes DevOps operations through intelligent AI agents. Built for enterprises and DevOps teams who want to automate infrastructure management with AI-powered decision making, now with complete Docker containerization support.

## 🚀 **Key Features**

### 🤖 **Multi-Agent AI Architecture**
- **Ansible AI Agent** - Automated infrastructure deployment and configuration management
- **Shell Script AI Agent** - Intelligent system command execution and automation
- **Knowledge Base AI Agent** - RAG-powered documentation and best practices retrieval
- **Document Processing Agent** - Multi-format document analysis and embedding generation

### ☁️ **Enterprise Cloud Integration**
- **AWS Bedrock Integration** - Claude 3.5 Sonnet model for advanced AI capabilities
- **Secure Environment Variables** - All API keys managed through environment variables
- **Document Processing** - Multi-format support (PDF, DOC, DOCX, TXT, HTML, XML, MD)
- **Vector Embeddings** - Intelligent similarity search and context retrieval
- **Real-time AI Responses** - Sub-second query processing and command execution

### 🐳 **Container-First Architecture**
- **Docker Support** - Complete containerization with Dockerfile and Docker Compose
- **Multi-Stage Deployment** - Development and production configurations
- **Auto-Initialization** - Automatic Ansible and Node.js startup in containers
- **Environment Isolation** - Secure, reproducible deployments
- **Scalable Architecture** - Ready for orchestration and horizontal scaling

### 🖥️ **Professional Web Interface**
- **Desktop-style Interface** - Enterprise-grade user experience
- **Multiple Dashboards** - Specialized interfaces for each AI agent
- **Real-time Monitoring** - Live system status and operation tracking
- **Responsive Design** - Works seamlessly across devices

### 🔧 **DevOps Automation Ready**
- **15+ Ansible Playbooks** - Pre-built automation for common tasks
- **Shell Script Library** - Verified and tested system operations
- **Container Orchestration** - Docker and Docker Compose support
- **CI/CD Integration** - GitHub Actions and pipeline support

## 🏗️ **Architecture Overview**

### 🎯 **System Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Agentic AI DevOps OS                                 │
│                        Enterprise-Grade Architecture                           │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Frontend Layer                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  🖥️ Desktop Preview  │  🏠 Home Dashboard  │  ⚡ Ansible Lab  │  🖥️ Shell Matrix  │
│  📚 Knowledge Neural │  📄 Document Mgr   │  👨‍💼 Admin Panel │  🤖 AI Agent      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API Gateway                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  📡 Express.js Server (Node.js) - Port 3000                                   │
│  🔄 RESTful APIs  │  📨 WebSocket Support  │  🔒 Security Middleware          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            AI Agent Layer                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ⚡ Ansible Agent  │  🖥️ Shell Agent   │  📚 Knowledge Agent  │  🏗️ Future Agents │
│  (Playbook Exec)  │  (System Cmds)    │  (RAG System)       │  (Terraform...)   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Integration Layer                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ☁️ AWS Bedrock    │  🔧 Ansible Core  │  💾 Local Storage  │  📊 Embeddings    │
│  (Claude 3.5)     │  (2.16.3)         │  (Documents)       │  (Vector Search)   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 🧩 **Component Architecture**

#### **🎨 Frontend Components**
```
public/
├── 🖥️ desktop-preview.html    # Main enterprise dashboard
├── 🏠 home.html               # Central command center  
├── ⚡ ansible-lab.html        # Ansible automation interface
├── 🖥️ shell-matrix.html       # Shell command execution
├── 📚 knowledge-neural.html   # RAG knowledge base
├── 📄 document-manager.html   # Document upload/processing
├── scripts/                   # Client-side JavaScript
│   ├── aiagent.js            # AI agent interactions
│   ├── ansibleLab.js         # Ansible interface logic
│   ├── os.js                 # Operating system interface
│   └── llmService.js         # LLM communication layer
└── styles/                    # CSS styling
    ├── os-desktop.css        # Desktop interface styling
    ├── matrix.css            # Terminal/shell styling
    └── agent-interfaces.css  # Agent-specific styling
```

#### **⚙️ Backend Architecture**
```
server.js                      # 🚀 Main Express application
├── 📡 API Routes
│   ├── /api/chat             # AI conversation endpoint
│   ├── /api/ansible          # Ansible execution
│   ├── /api/shell            # Shell command execution
│   ├── /api/knowledge        # RAG knowledge search
│   └── /api/upload           # Document upload
├── 🤖 AI Integration
│   ├── AWS Bedrock Client    # Claude 3.5 Sonnet
│   ├── Embedding Generator   # Vector embeddings
│   └── Context Manager       # Conversation context
└── 🔧 Utility Functions
    ├── Ansible Executor      # Playbook management
    ├── Shell Command Runner  # System operations
    └── Document Processor    # File handling
```

#### **🗄️ Data Layer**
```
data/
├── conversations.json         # 💬 Chat history (runtime)
└── [runtime files]           # 📊 Temporary data

public/scripts/documents/
├── knowledgeBase.json        # 📚 Structured knowledge
├── knowledgeBase_embeddings.json # 🧠 Vector embeddings
└── [uploaded files]          # 📄 User documents

ansible/
├── *.yml playbooks          # ⚡ Automation scripts
├── inventory                # 📋 Host configurations
└── [ansible configs]        # 🔧 Ansible settings
```

### 🔄 **Data Flow Architecture**

#### **User Interaction Flow:**
```
1. 👤 User Input → 2. 🖥️ Frontend → 3. 📡 API Gateway → 4. 🤖 AI Agent → 5. 📤 Response
   │                                                      │
   └────────── 6. 📱 UI Update ←──────────────────────────┘
```

#### **AI Processing Pipeline:**
```
📝 User Query
    ↓
🧠 Intent Recognition (Claude 3.5)
    ↓
🎯 Agent Selection (Ansible/Shell/Knowledge)
    ↓
⚡ Agent Execution
    ├── Ansible: Playbook execution
    ├── Shell: System command
    └── Knowledge: RAG search
    ↓
📊 Result Processing
    ↓
💬 AI-Enhanced Response
    ↓
🖥️ Frontend Display
```

### 🔐 **Security Architecture**

#### **🛡️ Enterprise-Grade Security:**
- **🔒 Zero Credential Exposure** - All API keys managed through environment variables only
- **🛡️ AWS IAM Integration** - Cloud-native security with proper IAM roles
- **🚫 Input Validation** - Comprehensive sanitization to prevent injection attacks
- **📝 Comprehensive Audit Logging** - Track all operations and access patterns
- **🔐 HTTPS Ready** - Production encryption support with SSL/TLS
- **🐳 Container Security** - Isolated execution environments with Docker
- **📋 Security-First .gitignore** - Prevents accidental credential commits

#### **🔐 Data Protection:**
- **🏠 Local Storage Priority** - Sensitive data never leaves your controlled environment
- **🔗 Encrypted Communications** - All AWS Bedrock communications use secure channels
- **🚫 Zero Hardcoded Secrets** - No API keys, passwords, or credentials in source code
- **🔒 Environment Isolation** - Complete separation of development and production credentials
- **⚙️ Sandboxed Execution** - All system commands run in controlled environments
- **🔍 Secret Scanning Protection** - GitHub push protection prevents credential exposure

#### **🛠️ Security Best Practices:**
- **✅ Environment Variables Only** - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` via `.env` files
- **✅ .gitignore Protection** - Comprehensive exclusions for secrets and sensitive files
- **✅ Container Isolation** - Docker provides process and filesystem isolation
- **✅ Principle of Least Privilege** - Minimal required permissions for all operations
- **✅ Regular Security Updates** - Automated dependency updates and security patches

### 📈 **Scalability Design**

#### **Horizontal Scaling:**
- **🐳 Docker Containers** - Containerized deployment
- **☁️ Cloud-Native** - Multi-platform deployment
- **📊 Stateless Design** - Easy replication
- **🔄 Load Balancer Ready** - Multiple instance support

#### **Performance Optimization:**
- **⚡ Async Processing** - Non-blocking operations
- **🧠 Smart Caching** - Embedding and response caching
- **📦 Efficient Storage** - Optimized document processing
- **🚀 Fast Startup** - Pre-loaded knowledge base

## 🏁 **Quick Start Guide**

### Prerequisites
- **Node.js 18+** and npm (Download from [nodejs.org](https://nodejs.org/))
- **Git** (Download from [git-scm.com](https://git-scm.com/))
- **AWS Account** (for AI integration - [aws.amazon.com](https://aws.amazon.com/))
- **Docker** (optional, for containerized deployment - [docker.com](https://docker.com/))

### 🚀 **Complete Setup Instructions**

#### Step 1: Clone and Install
```bash
# 1. Clone the repository
git clone https://github.com/vilaswasnik/agentic-ai-devops-os.git
cd agentic-ai-devops-os

# 2. Install dependencies
npm install

# 3. Install Ansible (for automation features)
# On Ubuntu/Debian:
sudo apt update && sudo apt install -y ansible

# On macOS:
brew install ansible

# On Windows (WSL recommended):
sudo apt install ansible
```

#### Step 2: Configure Environment
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your AWS credentials
nano .env
# OR
code .env
```

**Required .env Configuration:**
```bash
# AWS Configuration for Bedrock AI
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_actual_aws_access_key
AWS_SECRET_ACCESS_KEY=your_actual_aws_secret_key
LLM_PROVIDER=aws
PORT=3000
```

#### Step 3: Get AWS Credentials
1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **IAM** > **Users** > **Your User**
3. Click **Security Credentials** tab
4. Click **Create Access Key**
5. Copy the **Access Key ID** and **Secret Access Key**
6. Paste them into your `.env` file

**Important:** Enable **AWS Bedrock** in your AWS account:
- Go to **AWS Bedrock Console**
- Request access to **Claude 3.5 Sonnet** model
- Follow [AWS_BEDROCK_SETUP.md](AWS_BEDROCK_SETUP.md) for detailed steps

#### Step 4: Start the Application

**Option A: Standard Deployment**
```bash
# Start the server
npm start

# The server will start on http://localhost:3000
# You should see: "✅ Knowledge base embeddings loaded: 18 chunks available"
```

**Option B: Docker Deployment (Recommended)**
```bash
# Build the Docker image
docker build -t agentic-ai-devops-os .

# Run with Docker
docker run -d -p 3000:3000 \
  -e AWS_ACCESS_KEY_ID=your_aws_access_key \
  -e AWS_SECRET_ACCESS_KEY=your_aws_secret_key \
  -e AWS_REGION=us-east-1 \
  --name agentic-ai-devops-os \
  agentic-ai-devops-os

# Or use Docker Compose (easiest)
docker-compose up --build
```

**Option C: Development with Docker Compose**
```bash
# For development with hot reload
docker-compose -f docker-compose.dev.yml up --build
```

### 🐳 **Docker Container Features**

The Docker container includes:
- **✅ Node.js 20** - Latest stable runtime
- **✅ Ansible Core** - Pre-installed and configured
- **✅ Python 3** - For Ansible and system operations
- **✅ Auto-initialization** - Ansible and Node.js start automatically
- **✅ Environment isolation** - Secure credential management
- **✅ Volume mapping** - Persistent ansible and data directories

**Container Health Check:**
```bash
# Check if container is running
docker ps

# View container logs
docker logs agentic-ai-devops-os

# Test container functionality
docker exec -it agentic-ai-devops-os ./test-container.sh
```

#### Step 5: Access the Interface
Open your browser and navigate to:
- **🖥️ Main Desktop:** http://localhost:3000/desktop-preview.html
- **🏠 Home Dashboard:** http://localhost:3000/home.html
- **⚡ Ansible Lab:** http://localhost:3000/ansible-lab.html
- **📚 Knowledge Base:** http://localhost:3000/knowledge-neural.html

### 📚 **Complete Documentation**

For comprehensive setup instructions:
- **📋 [Complete Setup Guide](SETUP_GUIDE.md)** - Detailed platform-specific instructions
- **🤝 [Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **🔧 [AWS Bedrock Setup](AWS_BEDROCK_SETUP.md)** - Cloud AI configuration
- **🖥️ [Desktop Interface Preview](DESKTOP_INTERFACE_PREVIEW.md)** - Interface documentation

### 🎯 **Available Interfaces**
| Interface | URL | Purpose |
|-----------|-----|---------|
| **🖥️ Desktop Preview** | `/desktop-preview.html` | Main enterprise dashboard |
| **🏠 Home Dashboard** | `/home.html` | Central command center |
| **⚡ Ansible Lab** | `/ansible-lab.html` | Playbook execution and automation |
| **🖥️ Shell Matrix** | `/shell-matrix.html` | Command line operations |
| **📚 Knowledge Neural** | `/knowledge-neural.html` | RAG document search |
| **📄 Document Manager** | `/document-manager.html` | File upload and processing |
| **👨‍💼 Admin Panel** | `/admin.html` | System administration |

## 🤝 **Contributing to Agentic AI DevOps OS**

We welcome contributions! Here's how to get started:

### 🎯 **For New Contributors**

#### 1. **Development Setup**
```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/agentic-ai-devops-os.git
cd agentic-ai-devops-os

# Add upstream remote
git remote add upstream https://github.com/vilaswasnik/agentic-ai-devops-os.git

# Install dependencies
npm install

# Create development branch
git checkout -b feature/your-feature-name
```

#### 2. **Development Environment**
```bash
# Start development server with auto-reload
npm run dev

# Run tests (if available)
npm test

# Check code style
npm run lint
```

#### 3. **Project Structure Understanding**
```
agentic-ai-devops-os/
├── server.js                 # Main Express server
├── public/                   # Web interfaces
│   ├── desktop-preview.html  # Main desktop interface
│   ├── ansible-lab.html      # Ansible automation interface
│   ├── shell-matrix.html     # Shell script interface
│   ├── knowledge-neural.html # RAG knowledge base
│   └── scripts/              # Client-side JavaScript
├── ansible/                  # Ansible playbooks and configs
├── data/                     # Runtime data (conversations, etc.)
└── scripts/                  # Server-side utilities
```

### 🛠️ **Areas for Contribution**

#### **🚀 High Priority:**
1. **Terraform Integration** - Implement Infrastructure as Code agent
2. **Advanced Cloud Deployment** - Multi-platform deployment automation
3. **Authentication System** - Multi-user login and RBAC
4. **API Documentation** - Swagger/OpenAPI specification
5. **Mobile Interface** - Responsive design improvements

#### **🎨 Medium Priority:**
1. **Custom LLM Integration** - Support for local models (Ollama, etc.)
2. **Monitoring Dashboard** - System health and metrics
3. **Plugin System** - Extensible agent architecture
4. **CI/CD Pipelines** - GitHub Actions automation
5. **Performance Optimization** - Caching and load balancing

#### **📚 Documentation & Testing:**
1. **Unit Tests** - Test coverage for core functionality
2. **Integration Tests** - End-to-end testing
3. **API Documentation** - Complete endpoint documentation
4. **Video Tutorials** - Setup and usage guides
5. **Translation** - Multi-language support

### 📋 **Contribution Process**

#### **Step-by-Step Guide:**
1. **Choose an Issue** - Check [GitHub Issues](https://github.com/vilaswasnik/agentic-ai-devops-os/issues)
2. **Discuss First** - Comment on the issue to avoid duplicated work
3. **Create Branch** - `git checkout -b feature/issue-description`
4. **Develop & Test** - Follow coding standards and test your changes
5. **Update Documentation** - Update relevant .md files
6. **Commit Changes** - Use conventional commit messages
7. **Push & PR** - Create a Pull Request with detailed description

#### **Commit Message Format:**
```bash
# Feature additions
git commit -m "✨ Add Terraform integration agent"

# Bug fixes  
git commit -m "🐛 Fix Ansible playbook execution error"

# Documentation
git commit -m "📚 Update installation guide"

# Security
git commit -m "🔒 Improve credential handling"

# Performance
git commit -m "⚡ Optimize knowledge base search"
```

### 🔧 **Development Guidelines**

#### **Code Standards:**
- **JavaScript ES6+** - Use modern JavaScript features
- **Node.js Best Practices** - Follow Express.js conventions
- **Security First** - Never commit credentials or sensitive data
- **Error Handling** - Implement proper try-catch blocks
- **Logging** - Use console.log for development, structured logging for production

#### **File Organization:**
- **New Agents** - Add to `public/` with corresponding `.html` and `.js`
- **Server Routes** - Add API endpoints to `server.js`
- **Documentation** - Update README.md and create specific guides
- **Tests** - Add to `tests/` directory (create if needed)

#### **Testing Requirements:**
```bash
# Before submitting PR, ensure:
1. npm start works without errors
2. All interfaces load correctly
3. Ansible playbooks execute successfully
4. No security vulnerabilities introduced
5. Documentation is updated
```

## 📚 **Advanced Features**

### Document Processing & RAG
- **Upload Documents** via Document Manager interface
- **Automatic Embedding Generation** for uploaded content
- **Intelligent Search** with context-aware responses
- **Multi-format Support** - Process various document types seamlessly

### Ansible Automation
- **15+ Pre-built Playbooks** ready for deployment
- **Inventory Management** with localhost and remote host support
- **Real-time Execution** with live output display
- **Error Handling** and debugging capabilities

### Shell Script Execution
- **Verified Script Library** with tested operations
- **File System Management** and process monitoring
- **Interactive Terminal** interface for advanced users
- **Background Process** support for long-running tasks

## 🐳 **Deployment Options**

### Docker Deployment
```bash
# Build the container
docker build -t agentic-ai-devops-os .

# Run with environment variables
docker run -p 3000:3000 \
  -e AWS_ACCESS_KEY_ID=your_key \
  -e AWS_SECRET_ACCESS_KEY=your_secret \
  -e AWS_REGION=us-east-1 \
  agentic-ai-devops-os
```

### Cloud Deployment
- **AWS ECS** - Container service deployment
- **Azure Container Instances** - Simple cloud deployment
- **Google Cloud Run** - Serverless container platform
- **DigitalOcean App Platform** - Platform-as-a-Service deployment
- **GitHub Pages** - Static hosting for frontend *(in development)*

## 🛠️ **Development Status**

### ✅ **Production Ready Components**
- ✅ Express.js web server with multi-interface support
- ✅ AWS Bedrock Claude 3.5 integration and testing
- ✅ RAG knowledge base with 18+ document chunks
- ✅ Ansible Core 2.16.3 with 15+ operational playbooks
- ✅ Shell script execution engine with verified scripts
- ✅ Document processing pipeline for multiple formats
- ✅ Real-time web interfaces and monitoring dashboards
- ✅ Docker containerization and deployment preparation

### 🚧 **Enhancement Roadmap**
- 🔄 Advanced cloud deployment automation
- 🔄 Terraform AI agent implementation
- 🔄 Enhanced security and multi-user authentication
- 🔄 Performance optimization and caching
- 🔄 API gateway and RESTful endpoints
- 🔄 Mobile-responsive interface improvements
- 🔄 Monitoring and alerting dashboard
- 🔄 CI/CD pipeline automation

## 🤝 **Contributing**

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Development Setup
```bash
# Install development dependencies
npm install

# Start development server with hot reload
npm run dev

# Run tests
npm test
```

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 **Maintainer**

**Vilas Wasnik**
- GitHub: [@vilaswasnik](https://github.com/vilaswasnik)
- Project: [agentic-ai-devops-os](https://github.com/vilaswasnik/agentic-ai-devops-os)

## 📚 **Documentation**

For comprehensive documentation, see:
- [Desktop Interface Preview](DESKTOP_INTERFACE_PREVIEW.md) - Complete interface guide
- [AWS Bedrock Setup](AWS_BEDROCK_SETUP.md) - Cloud AI configuration
- [System Flow Documentation](SYSTEM_FLOW_DOCUMENTATION.md) - Architecture overview
- [DevOps OS Plan](DEVOPS_OS_PLAN.md) - Development roadmap

---

## 🎯 **Project Vision & Roadmap**

### ✅ **Completed Milestones**
1. ✅ **AI Integration** - AWS Bedrock Claude 3.5 operational
2. ✅ **Multi-Agent Architecture** - 4 specialized AI agents developed
3. ✅ **Web Interface** - 7+ professional dashboards created
4. ✅ **DevOps Automation** - Ansible and shell script integration
5. ✅ **Knowledge Base** - RAG system with document processing
6. ✅ **Container Support** - Docker deployment ready
7. ✅ **Production Testing** - All components verified and operational

### 🚀 **Next Phase Development**
1. 🔄 **Advanced Cloud Deployment** - Multi-platform container orchestration
2. 🔄 **Enterprise Security** - Multi-user authentication and RBAC
3. 🔄 **API Ecosystem** - RESTful services and third-party integrations
4. 🔄 **Custom LLM Training** - Domain-specific model development
5. 🔄 **Advanced Analytics** - Performance monitoring and insights
6. 🔄 **Mobile Applications** - Native iOS/Android interfaces
7. 🔄 **Marketplace Integration** - Plugin and extension ecosystem

### 🌟 **Advanced Capabilities Planned**
- **Custom LLM Model Development** - Natural language processing for DevOps
- **Vector Embedding Optimization** - Enhanced document similarity search
- **Web Scraping Integration** - Automatic knowledge base expansion
- **Ansible AWX Integration** - Enterprise automation platform connectivity
- **Login/Authentication System** - Secure multi-user environment
- **Real-time Collaboration** - Team-based DevOps operations
- **Compliance Automation** - Security and governance workflows

## 📋 **Recent Updates & Changes**

### 🆕 **Version 2.0.0 - September 2025**
- **🐳 Complete Docker Containerization** - Full Docker and Docker Compose support
- **🔒 Enhanced Security** - Zero credential exposure, comprehensive .gitignore protection
- **🚀 Auto-initialization** - Containers start with both Ansible and Node.js automatically
- **🗑️ Component Cleanup** - Removed blockchain and CentOS runner components for focus
- **📦 Improved Build Process** - Streamlined deployment with container-first approach
- **🛡️ Security Hardening** - All API keys moved to environment variables only

### 🔄 **Breaking Changes**
- **Removed Components:**
  - Blockchain Agent (unused component removed for clarity)
  - CentOS Runner (consolidated into main shell interface)
- **Enhanced Components:**
  - Docker deployment now recommended method
  - All credentials must use environment variables
  - Ansible configurations centralized in container startup

---

**Status: PRODUCTION READY ✅**
*Last Updated: September 15, 2025 - Docker containerization complete, security enhanced*



