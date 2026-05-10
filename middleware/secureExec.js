// Secure command execution with allowlists
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

// Allowlisted shell scripts that can be executed
const ALLOWED_SHELL_SCRIPTS = [
  'hello.sh',
  'hello2.sh',
  'helloo.sh',
  'makefolder.sh'
];

// Allowlisted Ansible playbooks
const ALLOWED_PLAYBOOKS = [
  'ansiblehelloworld.yml',
  'getosdetails.yml',
  'ansibletest.yml',
  'install_ansible.yml'
];

// Allowlisted Ansible setup scripts
const ALLOWED_ANSIBLE_SCRIPTS = [
  'install_ansible.sh',
  'setup.sh'
];

/**
 * Execute a shell script with validation
 * @param {string} scriptName - Name of the script (must be in allowlist)
 * @param {string} baseDir - Base directory for scripts
 * @param {number} timeout - Execution timeout in milliseconds
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
function executeShellScript(scriptName, baseDir, timeout = 5000) {
  return new Promise((resolve, reject) => {
    // Validate script name against allowlist
    if (!ALLOWED_SHELL_SCRIPTS.includes(scriptName)) {
      return reject(new Error(`Script not allowed: ${scriptName}. Allowed scripts: ${ALLOWED_SHELL_SCRIPTS.join(', ')}`));
    }

    // Validate script name format (no path traversal)
    if (scriptName.includes('..') || scriptName.includes('/') || scriptName.includes('\\')) {
      return reject(new Error('Invalid script name: path traversal detected'));
    }

    const scriptPath = path.join(baseDir, scriptName);

    // Verify script exists
    if (!fs.existsSync(scriptPath)) {
      return reject(new Error(`Script not found: ${scriptName}`));
    }

    // Use execFile instead of exec for better security (no shell interpretation)
    execFile('sh', [scriptPath], { timeout }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Script execution failed: ${stderr || error.message}`));
      }
      resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
}

/**
 * Execute an Ansible playbook with validation
 * @param {string} playbookName - Name of the playbook
 * @param {string} inventoryName - Name of the inventory file
 * @param {string} playbookDir - Playbook directory
 * @param {string} inventoryDir - Inventory directory
 * @param {number} timeout - Execution timeout
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
function executeAnsiblePlaybook(playbookName, inventoryName, playbookDir, inventoryDir, timeout = 30000) {
  return new Promise((resolve, reject) => {
    // Validate playbook against allowlist
    if (!ALLOWED_PLAYBOOKS.includes(playbookName)) {
      return reject(new Error(`Playbook not allowed: ${playbookName}. Allowed: ${ALLOWED_PLAYBOOKS.join(', ')}`));
    }

    // Validate names (no path traversal)
    if (playbookName.includes('..') || inventoryName.includes('..')) {
      return reject(new Error('Invalid file name: path traversal detected'));
    }

    const playbookPath = path.join(playbookDir, playbookName);
    const inventoryPath = path.join(inventoryDir, inventoryName);

    // Verify files exist
    if (!fs.existsSync(playbookPath)) {
      return reject(new Error(`Playbook not found: ${playbookName}`));
    }
    if (!fs.existsSync(inventoryPath)) {
      return reject(new Error(`Inventory not found: ${inventoryName}`));
    }

    // Execute with ansible-playbook
    execFile('ansible-playbook', ['-i', inventoryPath, playbookPath], { timeout }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Playbook execution failed: ${stderr || error.message}`));
      }
      resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
}

/**
 * Execute an Ansible setup script with validation
 * @param {string} scriptName - Name of the script
 * @param {string} baseDir - Base directory
 * @param {number} timeout - Execution timeout
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
function executeAnsibleScript(scriptName, baseDir, timeout = 60000) {
  return new Promise((resolve, reject) => {
    // Validate against allowlist
    if (!ALLOWED_ANSIBLE_SCRIPTS.includes(scriptName)) {
      return reject(new Error(`Ansible script not allowed: ${scriptName}`));
    }

    // Validate name
    if (scriptName.includes('..') || scriptName.includes('/') || scriptName.includes('\\')) {
      return reject(new Error('Invalid script name: path traversal detected'));
    }

    const scriptPath = path.join(baseDir, scriptName);

    if (!fs.existsSync(scriptPath)) {
      return reject(new Error(`Script not found: ${scriptName}`));
    }

    execFile('sh', [scriptPath], { timeout }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Script execution failed: ${stderr || error.message}`));
      }
      resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
}

/**
 * Get list of allowed shell scripts
 */
function getAllowedShellScripts() {
  return [...ALLOWED_SHELL_SCRIPTS];
}

/**
 * Get list of allowed playbooks
 */
function getAllowedPlaybooks() {
  return [...ALLOWED_PLAYBOOKS];
}

/**
 * Get list of allowed Ansible scripts
 */
function getAllowedAnsibleScripts() {
  return [...ALLOWED_ANSIBLE_SCRIPTS];
}

module.exports = {
  executeShellScript,
  executeAnsiblePlaybook,
  executeAnsibleScript,
  getAllowedShellScripts,
  getAllowedPlaybooks,
  getAllowedAnsibleScripts,
  ALLOWED_SHELL_SCRIPTS,
  ALLOWED_PLAYBOOKS,
  ALLOWED_ANSIBLE_SCRIPTS
};
