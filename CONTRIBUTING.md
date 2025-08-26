# Contributing to Agentic AI DevOps OS

Welcome to the **Agentic AI DevOps OS** project! We're excited to have you contribute to this enterprise-grade AI-powered DevOps automation platform.

## 🚀 **Quick Start for Contributors**

### **Prerequisites**
Before contributing, ensure you have:
- **Node.js 18+** and npm installed
- **Git** version control
- **AWS Account** with Bedrock access (for testing AI features)
- **Ansible** installed for automation testing
- **Basic knowledge** of JavaScript, HTML/CSS, and DevOps concepts

### **Development Setup**
```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/agentic-ai-devops-os.git
cd agentic-ai-devops-os

# 3. Add upstream remote
git remote add upstream https://github.com/vilaswasnik/agentic-ai-devops-os.git

# 4. Install dependencies
npm install

# 5. Copy environment template and configure
cp .env.example .env
# Edit .env with your AWS credentials

# 6. Start development server
npm run dev  # or npm start

# 7. Verify setup
curl http://localhost:3000
```

## 🎯 **How to Contribute**

### **1. Choose Your Contribution Type**

#### **🐛 Bug Fixes**
- Check [existing issues](https://github.com/vilaswasnik/agentic-ai-devops-os/issues)
- Reproduce the bug locally
- Create a branch: `git checkout -b fix/bug-description`
- Fix and test thoroughly
- Submit PR with detailed description

#### **✨ New Features**
- **High Priority Areas:**
  - Terraform AI Agent implementation
  - Kubernetes deployment automation
  - Multi-user authentication system
  - Mobile-responsive interfaces
  - Performance optimizations

#### **📚 Documentation**
- Update README.md with new features
- Create setup guides for different platforms
- Add API documentation
- Write troubleshooting guides

#### **🧪 Testing**
- Add unit tests for new features
- Create integration tests
- Test across different operating systems
- Validate security implementations

### **2. Development Workflow**

#### **Branch Strategy**
```bash
# Feature development
git checkout -b feature/terraform-integration

# Bug fixes
git checkout -b fix/ansible-playbook-error

# Documentation updates
git checkout -b docs/setup-guide-improvements

# Security fixes
git checkout -b security/credential-handling
```

#### **Commit Message Convention**
Use descriptive commit messages with emojis:
```bash
✨ feat: Add Terraform integration agent
🐛 fix: Resolve Ansible playbook execution error
📚 docs: Update installation guide for Windows users
🔒 security: Improve credential validation
⚡ perf: Optimize knowledge base search performance
🧪 test: Add unit tests for shell script execution
🎨 style: Improve responsive design for mobile devices
♻️ refactor: Restructure AI agent architecture
```

#### **Code Review Process**
1. **Self-Review**: Test your changes thoroughly
2. **Create PR**: Use the PR template (create one if needed)
3. **Automated Checks**: Ensure all CI/CD checks pass
4. **Maintainer Review**: Address feedback promptly
5. **Merge**: Maintainer will merge approved PRs

## 🛠️ **Development Guidelines**

### **Code Standards**
```javascript
// Use modern JavaScript (ES6+)
const processUserInput = async (input) => {
    try {
        // Proper error handling
        const result = await aiAgent.process(input);
        return result;
    } catch (error) {
        console.error('Error processing input:', error);
        throw new Error('Processing failed');
    }
};

// Use descriptive variable names
const ansiblePlaybookPath = '/ansible/playbooks/';
const awsBedrockModelId = 'anthropic.claude-3-haiku-20240307-v1:0';
```

### **Security Requirements**
- **Never commit credentials** or API keys
- **Validate all inputs** to prevent injection attacks
- **Use environment variables** for sensitive configuration
- **Implement proper error handling** without exposing system details
- **Follow OWASP security guidelines**

### **File Structure Guidelines**
```
# Adding new AI agents:
public/
├── agent-name.html           # Interface HTML
├── scripts/
│   └── agentName.js         # Client-side logic
└── styles/
    └── agent-name.css       # Styling

# Server-side additions:
server.js                    # Add API routes here
ansible/                     # Add playbooks and configs
scripts/                     # Add utility scripts
```

### **Testing Requirements**
Before submitting any PR:
```bash
# 1. Verify server starts without errors
npm start

# 2. Test all interfaces load correctly
# Visit each URL and verify functionality

# 3. Test Ansible integration
ansible-playbook ansible/getosdetails.yml -i ansible/inventory --check

# 4. Test shell scripts
bash public/scripts/shell_scripts/hello.sh

# 5. Verify no credentials are exposed
git log --oneline -n 5
grep -r "AKIA\|secret\|password" . --exclude-dir=node_modules
```

## 🌟 **Contribution Areas**

### **🚀 Current Priority Projects**
1. **Terraform Integration** - Create Infrastructure as Code agent
   - Skills needed: Terraform, HCL, Infrastructure automation
   - Impact: High - Core platform feature

2. **Kubernetes Orchestration** - Container deployment automation
   - Skills needed: K8s, Docker, Container orchestration
   - Impact: High - Production deployment capability

3. **Authentication System** - Multi-user support
   - Skills needed: Auth systems, JWT, RBAC
   - Impact: High - Enterprise readiness

### **🎨 Enhancement Opportunities**
1. **Mobile Interface** - Responsive design improvements
2. **Performance Optimization** - Caching and load balancing
3. **Plugin Architecture** - Extensible agent system
4. **Monitoring Dashboard** - System health and metrics
5. **CI/CD Integration** - GitHub Actions automation

### **📚 Documentation Needs**
1. **Video Tutorials** - Setup and usage demonstrations
2. **API Documentation** - Complete endpoint reference
3. **Deployment Guides** - Cloud provider specific instructions
4. **Troubleshooting** - Common issues and solutions

## 📞 **Getting Help**

### **Communication Channels**
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Email** - Contact maintainer for urgent issues

### **Development Support**
- **Code Questions** - Create an issue with `question` label
- **Feature Discussions** - Use GitHub Discussions
- **Security Issues** - Contact maintainer directly

## 📋 **Pull Request Template**

When creating a PR, include:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Security enhancement

## Testing
- [ ] Local testing completed
- [ ] All interfaces verified
- [ ] No credentials exposed
- [ ] Documentation updated

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] No breaking changes
- [ ] Backward compatibility maintained
```

## 🎖️ **Recognition**

Contributors will be:
- **Acknowledged** in the project README
- **Listed** in the contributors section
- **Credited** in release notes for significant contributions
- **Invited** to become maintainers for outstanding contributions

## 📄 **License Agreement**

By contributing to this project, you agree that your contributions will be licensed under the same **MIT License** that covers the project.

---

**Thank you for contributing to Agentic AI DevOps OS!** 🚀

*Together, we're building the future of AI-powered DevOps automation.*
