# Complete Setup Guide - Agentic AI DevOps OS

This guide provides detailed setup instructions for different operating systems and environments.

## 📋 **Prerequisites Checklist**

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] Git installed and configured
- [ ] AWS Account with Bedrock access
- [ ] Text editor (VS Code recommended)
- [ ] Terminal/Command Prompt access

## 🖥️ **Platform-Specific Setup**

### **Windows Setup**

#### **Option 1: Using WSL (Recommended)**
```powershell
# 1. Install WSL and Ubuntu
wsl --install
# Restart computer when prompted

# 2. Open Ubuntu terminal and update
sudo apt update && sudo apt upgrade -y

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install Git and Ansible
sudo apt install -y git ansible

# 5. Verify installations
node --version
npm --version
git --version
ansible --version
```

#### **Option 2: Native Windows**
```powershell
# 1. Install Node.js from https://nodejs.org/
# Download and run the Windows installer

# 2. Install Git from https://git-scm.com/
# Download and run the Windows installer

# 3. Install Ansible (via pip)
pip install ansible

# 4. Open PowerShell as Administrator and verify
node --version
npm --version
git --version
ansible --version
```

### **macOS Setup**
```bash
# 1. Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Node.js, Git, and Ansible
brew install node git ansible

# 3. Verify installations
node --version
npm --version
git --version
ansible --version
```

### **Ubuntu/Debian Setup**
```bash
# 1. Update package manager
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install Git and Ansible
sudo apt install -y git ansible

# 4. Verify installations
node --version
npm --version
git --version
ansible --version
```

### **CentOS/RHEL/Fedora Setup**
```bash
# For CentOS/RHEL
sudo yum update -y
sudo yum install -y epel-release
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git ansible

# For Fedora
sudo dnf update -y
sudo dnf install -y nodejs npm git ansible

# Verify installations
node --version
npm --version
git --version
ansible --version
```

## 🚀 **Application Setup**

### **Step 1: Clone Repository**
```bash
# Clone the repository
git clone https://github.com/vilaswasnik/agentic-ai-devops-os.git
cd agentic-ai-devops-os

# Verify project structure
ls -la
```

### **Step 2: Install Dependencies**
```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

### **Step 3: Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your preferred editor
nano .env
# OR
code .env
# OR
vim .env
```

**Required Environment Variables:**
```bash
# AWS Configuration (Required for AI features)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_actual_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_actual_aws_secret_access_key_here

# Application Configuration
LLM_PROVIDER=aws
PORT=3000

# Optional: For development
NODE_ENV=development
```

### **Step 4: AWS Bedrock Setup**

#### **Get AWS Credentials:**
1. **Sign in to AWS Console**: https://console.aws.amazon.com/
2. **Navigate to IAM**:
   - Go to **Services** > **IAM**
   - Click **Users** > **Your Username**
   - Click **Security Credentials** tab
   - Click **Create Access Key**
   - Download or copy the credentials

#### **Enable AWS Bedrock:**
1. **Go to Bedrock Console**: https://console.aws.amazon.com/bedrock/
2. **Request Model Access**:
   - Click **Model Access** in left sidebar
   - Find **Anthropic Claude 3 Haiku** and **Claude 3.5 Sonnet**
   - Click **Request Access** for each model
   - Wait for approval (usually immediate)

#### **Test AWS Connection:**
```bash
# Test AWS credentials
aws configure list
# OR install AWS CLI if needed:
pip install awscli
aws configure
```

### **Step 5: Start the Application**
```bash
# Start the server
npm start

# You should see output like:
# ✅ Knowledge base embeddings loaded: 18 chunks available
# Server running at http://localhost:3000
```

### **Step 6: Verify Installation**
Open your browser and test these URLs:

1. **Main Desktop Interface**: http://localhost:3000/desktop-preview.html
2. **Home Dashboard**: http://localhost:3000/home.html
3. **Ansible Lab**: http://localhost:3000/ansible-lab.html
4. **Shell Matrix**: http://localhost:3000/shell-matrix.html
5. **Knowledge Base**: http://localhost:3000/knowledge-neural.html

## 🧪 **Testing Your Setup**

### **Quick Verification Tests**
```bash
# 1. Test server health
curl http://localhost:3000

# 2. Test Ansible functionality
ansible --version
ansible-playbook ansible/getosdetails.yml -i ansible/inventory --check

# 3. Test shell scripts
bash public/scripts/shell_scripts/hello.sh

# 4. Check permissions
chmod +x public/scripts/shell_scripts/*.sh
```

### **AI Integration Test**
1. Open: http://localhost:3000/knowledge-neural.html
2. Type: "What is DevOps?"
3. Verify AI response from AWS Bedrock

## 🔧 **Troubleshooting**

### **Common Issues and Solutions**

#### **Port Already in Use**
```bash
# Check what's using port 3000
lsof -i :3000
# OR
netstat -tulpn | grep 3000

# Solution: Change port in .env
echo "PORT=3001" >> .env
```

#### **AWS Bedrock Access Denied**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify Bedrock model access in AWS Console
# Ensure you've requested access to Claude models
```

#### **Ansible Not Found**
```bash
# Ubuntu/Debian
sudo apt install ansible

# macOS
brew install ansible

# Windows (PowerShell as Admin)
pip install ansible
```

#### **Permission Denied on Scripts**
```bash
# Make scripts executable
chmod +x public/scripts/shell_scripts/*.sh
chmod +x ansible/*.sh
```

#### **Node.js Version Issues**
```bash
# Check Node.js version
node --version

# Should be 18+ for best compatibility
# Update if needed from https://nodejs.org/
```

### **Getting Help**

If you encounter issues:

1. **Check the logs**: Look at the terminal output when running `npm start`
2. **GitHub Issues**: Search existing issues or create a new one
3. **Documentation**: Review [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md)
4. **Contact Maintainer**: For urgent issues

## 📦 **Docker Setup (Alternative)**

For a containerized environment:

```bash
# Build the Docker image
docker build -t agentic-ai-devops-os .

# Run with environment variables
docker run -p 3000:3000 \
  -e AWS_ACCESS_KEY_ID=your_key \
  -e AWS_SECRET_ACCESS_KEY=your_secret \
  -e AWS_REGION=us-east-1 \
  agentic-ai-devops-os

# Access the application
open http://localhost:3000/desktop-preview.html
```

## 🎯 **Next Steps**

After successful setup:

1. **Explore the Interface**: Try all the different agent interfaces
2. **Upload Documents**: Use the document manager to add your own knowledge
3. **Create Ansible Playbooks**: Add your automation scripts
4. **Contribute**: Check [CONTRIBUTING.md](CONTRIBUTING.md) for ways to help
5. **Deploy**: Consider production deployment options

## 🔒 **Security Best Practices**

- **Never commit `.env` file** to version control
- **Use strong AWS IAM policies** with minimal required permissions
- **Regularly rotate** AWS access keys
- **Keep dependencies updated**: Run `npm audit` regularly
- **Use HTTPS** in production environments

---

**Setup Complete!** 🎉 

You now have a fully functional **Agentic AI DevOps OS** running locally. 

For questions or issues, please refer to [CONTRIBUTING.md](CONTRIBUTING.md) or create an issue on GitHub.
