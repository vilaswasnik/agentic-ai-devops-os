// Tests for secure command execution
const {
  getAllowedShellScripts,
  getAllowedPlaybooks,
  ALLOWED_SHELL_SCRIPTS,
  ALLOWED_PLAYBOOKS
} = require('../middleware/secureExec');

describe('Secure Execution Allowlists', () => {
  describe('getAllowedShellScripts', () => {
    it('should return array of allowed scripts', () => {
      const scripts = getAllowedShellScripts();
      expect(Array.isArray(scripts)).toBe(true);
      expect(scripts.length).toBeGreaterThan(0);
    });

    it('should include expected shell scripts', () => {
      const scripts = getAllowedShellScripts();
      expect(scripts).toContain('hello.sh');
      expect(scripts).toContain('hello2.sh');
    });

    it('should return a copy not reference', () => {
      const scripts1 = getAllowedShellScripts();
      const scripts2 = getAllowedShellScripts();
      expect(scripts1).toEqual(scripts2);
      expect(scripts1).not.toBe(scripts2);
    });
  });

  describe('getAllowedPlaybooks', () => {
    it('should return array of allowed playbooks', () => {
      const playbooks = getAllowedPlaybooks();
      expect(Array.isArray(playbooks)).toBe(true);
      expect(playbooks.length).toBeGreaterThan(0);
    });

    it('should include expected playbooks', () => {
      const playbooks = getAllowedPlaybooks();
      expect(playbooks).toContain('ansiblehelloworld.yml');
    });
  });

  describe('Allowlist Constants', () => {
    it('should export ALLOWED_SHELL_SCRIPTS constant', () => {
      expect(ALLOWED_SHELL_SCRIPTS).toBeDefined();
      expect(Array.isArray(ALLOWED_SHELL_SCRIPTS)).toBe(true);
    });

    it('should export ALLOWED_PLAYBOOKS constant', () => {
      expect(ALLOWED_PLAYBOOKS).toBeDefined();
      expect(Array.isArray(ALLOWED_PLAYBOOKS)).toBe(true);
    });
  });
});
