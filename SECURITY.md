# Security Documentation

## 🔒 Security Overview

This document outlines the security measures implemented in the Agentic AI DevOps OS platform and best practices for secure deployment.

## ✅ Security Features Implemented

### 1. Authentication & Authorization

#### JWT-Based Authentication
- All sensitive endpoints require valid JWT tokens
- Tokens expire after 24 hours (configurable via `JWT_EXPIRES_IN`)
- Token includes user role for authorization checks

#### Role-Based Access Control (RBAC)
Three role levels:
- **Admin**: Full system access, can manage users and settings
- **Operator**: Can execute scripts and playbooks, manage documents
- **Viewer**: Read-only access (future implementation)

#### Password Security
- All passwords hashed using bcrypt (10 salt rounds)
- No plaintext password storage
- Secure password comparison using timing-safe algorithms

### 2. Command Execution Security

#### Allowlist-Based Execution
- All shell scripts and Ansible playbooks must be explicitly allowlisted
- Path traversal attacks prevented (`..` blocked)
- Uses `execFile` instead of `exec` to prevent shell injection

#### Allowed Shell Scripts
```javascript
['hello.sh', 'hello2.sh', 'helloo.sh', 'makefolder.sh']
```

#### Allowed Ansible Playbooks
```javascript
['ansiblehelloworld.yml', 'getosdetails.yml', 'ansibletest.yml', 'install_ansible.yml']
```

To add new scripts/playbooks, update `/middleware/secureExec.js`

### 3. API Security

#### Rate Limiting
- **Global Limiter**: 100 requests per 15 minutes per IP
- **Strict Limiter**: 20 requests per 15 minutes for sensitive operations
- **Auth Limiter**: 5 login attempts per 15 minutes

#### Security Headers (Helmet.js)
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (HTTPS)
- X-DNS-Prefetch-Control

#### CORS Protection
- Configurable allowed origins via `ALLOWED_ORIGINS` environment variable
- Credentials support enabled for authenticated requests
- Default allows only localhost in production

### 4. Input Validation

- Request body size limited to 10MB
- File upload size limited to 10MB
- Script/playbook names validated against regex patterns
- Path traversal prevention in all file operations

## 🔐 Required Environment Variables

### Critical Security Variables

```bash
# JWT Secret - MUST be changed in production
# Generate: openssl rand -base64 32
JWT_SECRET=your_secure_random_jwt_secret_minimum_32_characters_long

# Admin Password - Change immediately after first login
ADMIN_PASSWORD=your_secure_admin_password

# Allowed CORS Origins
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### Optional Security Variables

```bash
# JWT token expiration (default: 24h)
JWT_EXPIRES_IN=24h

# Environment (affects CORS strictness)
NODE_ENV=production
```

## 🚀 Secure Deployment Checklist

### Before Production Deployment

- [ ] Change `JWT_SECRET` to a strong random value (minimum 32 characters)
- [ ] Change `ADMIN_PASSWORD` from default
- [ ] Set `ALLOWED_ORIGINS` to your actual domain(s)
- [ ] Set `NODE_ENV=production`
- [ ] Review and update allowed scripts/playbooks list
- [ ] Enable HTTPS/TLS (use reverse proxy like nginx)
- [ ] Configure firewall rules (restrict to necessary ports)
- [ ] Set up log monitoring and alerting
- [ ] Regular security updates for dependencies: `npm audit fix`
- [ ] Review user roles and permissions
- [ ] Back up JWT_SECRET securely (users need reauth if changed)

### Generating Secure Secrets

```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate Admin Password
openssl rand -base64 24
```

## 🔑 Authentication Flow

### Login Process
1. User sends credentials to `/api/login`
2. Server validates credentials and checks password hash
3. If valid, server generates JWT token
4. Client stores token (localStorage/sessionStorage)
5. Client includes token in subsequent requests: `Authorization: Bearer <token>`

### Making Authenticated Requests

```javascript
// Example: Execute a shell script
const response = await fetch('/run-shellscript', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    scriptPath: 'hello.sh'
  })
});
```

## 🛡️ Protected Endpoints

### Admin Only
- `POST /api/llm/switch` - Switch LLM provider

### Operator or Admin
- `POST /run-script` - Execute scripts
- `POST /run-shellscript` - Execute shell scripts
- `POST /run-script-installansible` - Install Ansible
- `POST /run-ansible-helloworld` - Run Ansible Hello World
- `POST /run-playbook` - Execute Ansible playbooks
- `POST /api/lab/ansible/start` - Start Ansible lab
- `POST /api/lab/ansible/stop` - Stop Ansible lab
- `POST /api/lab/ansible/file` - Save playbook
- `DELETE /api/lab/ansible/file` - Delete playbook
- `POST /api/lab/ansible/rename` - Rename playbook
- `POST /api/lab/ansible/exec` - Execute lab command

### Authenticated Users
- All `/api/chat/history` endpoints
- All `/api/document-*` endpoints
- `GET /api/llm/status`
- `POST /api/llm/test`
- `POST /api/logoff`

### Public Endpoints
- `POST /api/login` - User login
- `POST /api/reset` - Password reset
- `GET /` - Static files
- `POST /chatbot` - Public chatbot (consider adding auth)
- `POST /rag-knowledgebase` - RAG queries (consider adding auth)

## 🚨 Security Monitoring

### What to Monitor
- Failed login attempts (possible brute force)
- Rate limit violations
- Unauthorized access attempts (401/403 responses)
- Command execution frequency and patterns
- Unusual file operations

### Recommended Tools
- Log aggregation: ELK Stack, Splunk, or Datadog
- Intrusion detection: Fail2ban, OSSEC
- Container security: Aqua Security, Sysdig
- Dependency scanning: Snyk, GitHub Dependabot

## 🔍 Security Audit History

### Phase 1 Security Hardening (May 10, 2026)
- ✅ Removed hardcoded credentials
- ✅ Implemented JWT authentication
- ✅ Added bcrypt password hashing
- ✅ Implemented RBAC with three roles
- ✅ Added command execution allowlists
- ✅ Implemented rate limiting
- ✅ Added helmet.js security headers
- ✅ Restricted CORS
- ✅ Added input validation
- ✅ Created security tests

### Known Limitations & Future Improvements

#### Current Limitations
- User data stored in memory (lost on restart)
- No session management (tokens valid until expiry)
- No password complexity requirements
- No multi-factor authentication (MFA)
- No audit logging to database

#### Planned Improvements (Future Phases)
- [ ] Phase 2: Move user data to PostgreSQL
- [ ] Phase 3: Add Redis for session/token management
- [ ] Phase 4: Implement comprehensive audit logging
- [ ] Phase 5: Add MFA support
- [ ] Phase 6: Implement password complexity requirements
- [ ] Phase 7: Add IP whitelisting
- [ ] Phase 8: Implement certificate-based authentication
- [ ] Phase 9: Add automated security scanning in CI/CD

## 📞 Reporting Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email security concerns to repository maintainer
3. Include detailed description and reproduction steps
4. Allow reasonable time for patch before disclosure

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Guide](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Last Updated**: May 10, 2026
**Security Review Cycle**: Quarterly
