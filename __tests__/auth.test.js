// Basic tests for authentication middleware
const { hashPassword, comparePassword, generateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

describe('Authentication Functions', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should validate correct password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hash = await hashPassword(password);
      const isValid = await comparePassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const user = { username: 'testuser', role: 'admin' };
      const token = generateToken(user);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should encode user data in token', () => {
      const user = { username: 'testuser', role: 'admin' };
      const token = generateToken(user);
      const decoded = jwt.decode(token);
      expect(decoded.username).toBe('testuser');
      expect(decoded.role).toBe('admin');
      expect(decoded.isAdmin).toBe(true);
    });

    it('should create token with expiration', () => {
      const user = { username: 'testuser', role: 'operator' };
      const token = generateToken(user);
      const decoded = jwt.decode(token);
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });
});
