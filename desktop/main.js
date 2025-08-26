const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Keep a global reference of the window object
let mainWindow;
let serverProcess;

function createWindow() {
  // Create the browser window with OS-like appearance
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, 'assets', 'icon.png'), // We'll create this
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Custom menu for Agentic AI DevOps OS
  const menu = Menu.buildFromTemplate([
    {
      label: 'Agentic AI DevOps OS',
      submenu: [
        {
          label: 'Ansible AI Agent',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              document.querySelector('input[type="text"]').value = 'run ansible test playbook';
              document.querySelector('button').click();
            `);
          }
        },
        {
          label: 'Shell Script AI Agent',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              document.querySelector('input[type="text"]').value = 'execute hello.sh';
              document.querySelector('button').click();
            `);
          }
        },
        {
          label: 'Knowledge Retrieval',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              window.location.hash = '#knowledge';
            `);
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Ansible Playbooks',
          submenu: [
            {
              label: 'Get OS Details',
              click: () => {
                mainWindow.webContents.executeJavaScript(`
                  document.querySelector('input[type="text"]').value = 'run getosdetails playbook';
                  document.querySelector('button').click();
                `);
              }
            },
            {
              label: 'Test Playbook',
              click: () => {
                mainWindow.webContents.executeJavaScript(`
                  document.querySelector('input[type="text"]').value = 'run ansible test playbook';
                  document.querySelector('button').click();
                `);
              }
            }
          ]
        },
        {
          label: 'System Scripts',
          submenu: [
            {
              label: 'Hello Script',
              click: () => {
                mainWindow.webContents.executeJavaScript(`
                  document.querySelector('input[type="text"]').value = 'execute hello.sh';
                  document.querySelector('button').click();
                `);
              }
            },
            {
              label: 'Create Folder',
              click: () => {
                mainWindow.webContents.executeJavaScript(`
                  document.querySelector('input[type="text"]').value = 'execute makefolder.sh';
                  document.querySelector('button').click();
                `);
              }
            }
          ]
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Agentic AI DevOps OS',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              alert('Agentic AI DevOps OS\\nAI-Powered Infrastructure Management\\nBuilt with AWS Bedrock & Ansible');
            `);
          }
        },
        {
          label: 'Show Commands',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              document.querySelector('input[type="text"]').value = 'help';
              document.querySelector('button').click();
            `);
          }
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);

  // Start the Node.js server
  startServer();

  // Load the app - wait for server to be ready
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000');
  }, 2000);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on the input field when ready
    mainWindow.webContents.executeJavaScript(`
      setTimeout(() => {
        const input = document.querySelector('input[type="text"]');
        if (input) input.focus();
      }, 1000);
    `);
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (serverProcess) {
      serverProcess.kill();
    }
  });
}

function startServer() {
  // Start the Express server
  serverProcess = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  
  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
  });
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// IPC handlers for future OS-like features
ipcMain.handle('get-system-info', async () => {
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version
  };
});
