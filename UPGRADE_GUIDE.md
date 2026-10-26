# Phase 1 Security Hardening - Upgrade Guide

## 🎯 Overview

This guide covers the Phase 1 security hardening changes implemented on May 10, 2026. These changes significantly improve the security posture of the Agentic AI DevOps OS platform.

## 🔒 What Changed

### Breaking Changes

#### 1. Authentication Now Required
**All sensitive endpoints now require JWT authentication.**

**Before:**
```javascript
fetch('/run-shellscript', {
  method: 'POST',
  body: JSON.stringify({ scriptPath: 'hello.sh' })
});
```

**After:**
```javascript
// First, login to get token
const loginResponse = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    username: 'admin', 
    password: 'your_password' 
  })
});
const { token } = await loginResponse.json();

// Then use token in subsequent requests
fetch('/run-shellscript', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ scriptPath: 'hello.sh' })
});
```

#### 2. Command Execution Restricted to Allowlists
Scripts and playbooks must be explicitly allowlisted to execute.

**Current Allowlists:**
- Shell Scripts: `hello.sh`, `hello2.sh`, `helloo.sh`, `makefolder.sh`
- Ansible Playbooks: `ansiblehelloworld.yml`, `getosdetails.yml`, `ansibletest.yml`, `install_ansible.yml`

**To add new scripts:** Edit `/middleware/secureExec.js`

#### 3. Password Storage Changed
Passwords are now hashed with bcrypt (not stored in plaintext).

**Migration:** Existing users need to reset passwords after upgrade.

#### 4. Rate Limiting Active
Endpoints have request limits:
- Global: 100 req/15min per IP
- Sensitive operations: 20 req/15min
- Login attempts: 5 req/15min

### New Features

#### 1. Role-Based Access Control (RBAC)
Three user roles:
- **admin**: Full access
- **operator**: Can execute scripts/playbooks
- **viewer**: Read-only (future)

#### 2. Enhanced Security Headers
Helmet.js adds security headers automatically.

#### 3. Stricter CORS
CORS now restricted to allowed origins (configurable).

## 📋 Migration Steps

### For Fresh Installations

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env and set:
# - JWT_SECRET (generate: openssl rand -base64 32)
# - ADMIN_PASSWORD (required - the server has no default password)
# - ALLOWED_ORIGINS (your domain)
```

3. **Start server:**
```bash
npm start
```

### For Existing Installations

1. **Backup data:**
```bash
cp -r data/ data.backup/
```

2. **Pull latest changes:**
```bash
git pull origin main
```

3. **Install new dependencies:**
```bash
npm install
```

4. **Update your .env file:**
```bash
# Add these new variables to your existing .env:

# Security Configuration
JWT_SECRET=your_secure_random_jwt_secret_minimum_32_characters_long
JWT_EXPIRES_IN=24h
ADMIN_PASSWORD=your-strong-admin-password  # CHANGE THIS!
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
NODE_ENV=development
```

5. **Update frontend code:**
   - Add login flow to get JWT token
   - Store token in localStorage/sessionStorage
   - Include `Authorization: Bearer <token>` header in all API calls

6. **Test authentication:**
```bash
# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-admin-password"}'

# Response: {"success":true,"token":"eyJhbGc...","user":{...}}

# Use token
export TOKEN="<your_token_from_above>"
curl -X POST http://localhost:3000/run-shellscript \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"scriptPath":"hello.sh"}'
```

7. **Run tests:**
```bash
npm test
```

## 🔧 Code Changes Required

### Frontend Changes

#### Update Login Page
```javascript
// Add token storage after successful login
async function login(username, password) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userRole', data.user.role);
    // Redirect to dashboard
    window.location.href = '/home.html';
  } else {
    alert(data.message);
  }
}
```

#### Create Auth Helper
```javascript
// public/scripts/auth.js
function getAuthToken() {
  return localStorage.getItem('authToken');
}

function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

function isAuthenticated() {
  return !!getAuthToken();
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  window.location.href = '/login.html';
}

// Check auth on page load
if (!isAuthenticated() && !window.location.pathname.includes('login.html')) {
  window.location.href = '/login.html';
}
```

#### Update All API Calls
```javascript
// Before
fetch('/run-shellscript', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scriptPath: 'hello.sh' })
});

// After
fetch('/run-shellscript', {
  method: 'POST',
  headers: getAuthHeaders(), // Use auth helper
  body: JSON.stringify({ scriptPath: 'hello.sh' })
})
.then(async response => {
  if (response.status === 401 || response.status === 403) {
    logout(); // Token expired or invalid
    return;
  }
  return response.json();
});
```

### Adding New Scripts/Playbooks

To allow execution of new scripts, edit `/middleware/secureExec.js`:

```javascript
// Add to ALLOWED_SHELL_SCRIPTS array
const ALLOWED_SHELL_SCRIPTS = [
  'hello.sh',
  'hello2.sh',
  'helloo.sh',
  'makefolder.sh',
  'mynewscript.sh'  // Add your script
];

// Add to ALLOWED_PLAYBOOKS array
const ALLOWED_PLAYBOOKS = [
  'ansiblehelloworld.yml',
  'getosdetails.yml',
  'ansibletest.yml',
  'install_ansible.yml',
  'mynewplaybook.yml'  // Add your playbook
];
```

### User Management

#### Create New User (Admin Only)
```javascript
// In server.js, add endpoint:
app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  const { username, password, role } = req.body;
  
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'All fields required' });
  }
  
  if (users[username]) {
    return res.status(409).json({ error: 'User already exists' });
  }
  
  try {
    const user = await addUser(username, password, role, true);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Linter
```bash
npm run lint
```

### Manual API Testing
```bash
# 1. Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-admin-password"}'

# Save the token from response
export TOKEN="your_token_here"

# 2. Test protected endpoint
curl -X POST http://localhost:3000/run-shellscript \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"scriptPath":"hello.sh"}'

# 3. Test without token (should fail with 401)
curl -X POST http://localhost:3000/run-shellscript \
  -H "Content-Type: application/json" \
  -d '{"scriptPath":"hello.sh"}'

# 4. Test rate limiting (run this 6 times quickly)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong"}'
done
# Should return 429 Too Many Requests on 6th attempt

# 5. Get allowed scripts list
curl http://localhost:3000/api/allowed-scripts \
  -H "Authorization: Bearer $TOKEN"
```

## 🐛 Troubleshooting

### "Access denied. No token provided"
**Solution:** Include `Authorization: Bearer <token>` header in request.

### "Invalid or expired token"
**Solution:** Token expired (24h default). Login again to get new token.

### "Script not allowed"
**Solution:** Add script to allowlist in `/middleware/secureExec.js`.

### "Too many requests"
**Solution:** Rate limit hit. Wait 15 minutes or adjust limits in `server.js`.

### "Not allowed by CORS"
**Solution:** Add your origin to `ALLOWED_ORIGINS` in `.env`.

### Tests failing
**Solution:** Run `npm install` to ensure all dependencies installed.

## 📊 Performance Impact

- Authentication adds ~5-10ms per request (JWT verification)
- Rate limiting adds ~1-2ms per request (in-memory counter)
- Security headers add <1ms per response
- Overall impact: Negligible for most use cases

## 🔄 Rollback Procedure

If issues arise, rollback steps:

```bash
# 1. Checkout previous version
git checkout <previous_commit_hash>

# 2. Restore old dependencies
npm install

# 3. Restore data backup
rm -rf data/
cp -r data.backup/ data/

# 4. Restart server
npm start
```

## 📞 Support

For questions or issues:
- Check [SECURITY.md](SECURITY.md) for detailed security docs
- Review [README.md](README.md) for updated setup instructions
- Open GitHub issue for bugs or feature requests

---

**Upgrade Completed:** May 10, 2026  
**Next Phase:** Database migration and audit logging
