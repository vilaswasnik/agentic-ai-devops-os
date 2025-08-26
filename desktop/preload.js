const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // OS-like functions for future use
  openAnsibleAgent: () => {
    // This could trigger a specific Ansible interface
    console.log('Opening Ansible AI Agent...');
  },
  
  openTerraformAgent: () => {
    // This could trigger a specific Terraform interface  
    console.log('Opening Terraform AI Agent...');
  },
  
  openShellAgent: () => {
    // This could trigger a specific Shell Script interface
    console.log('Opening Shell Script AI Agent...');
  },
  
  openKnowledgeBase: () => {
    // This could trigger the knowledge retrieval interface
    console.log('Opening Knowledge Base...');
  }
});
