// Authentication and Authorization Middleware
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// JWT secret: set JWT_SECRET in your .env. There is no built-in default -
// if it is not set, a random per-boot secret is generated instead, which
// means existing tokens stop working when the server restarts.
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn('JWT_SECRET is not set - generating a random per-boot secret. Set JWT_SECRET in .env for stable sessions.');
  return crypto.randomBytes(32).toString('hex');
})();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Verify JWT token middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// Role-based access control middleware
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions.',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
}

// Admin-only access
const requireAdmin = requireRole('admin');

// Admin or operator access (for running commands/playbooks)
const requireOperator = requireRole('admin', 'operator');

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      username: user.username, 
      role: user.role,
      isAdmin: user.role === 'admin'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Hash password
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Compare password
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireOperator,
  generateToken,
  hashPassword,
  comparePassword,
  JWT_SECRET
};
