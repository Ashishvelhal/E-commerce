const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const fs = require('fs');

// Enable WebGL and hardware acceleration for Three.js 3D Customizer
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');

let mainWindow = null;
let backendProcess = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const DEV_URL = 'http://localhost:5173';

// Set persistent local data storage path inside user's system AppData/config directory
const localDataPath = path.join(app.getPath('userData'), 'rasin_arts_local_data');
if (!fs.existsSync(localDataPath)) {
  fs.mkdirSync(localDataPath, { recursive: true });
}
process.env.DATA_DIR = localDataPath;

function startBackendServer() {
  if (isDev) return;

  try {
    let serverScript = path.join(__dirname, '../backend/dist/server.js');
    if (!fs.existsSync(serverScript) && process.resourcesPath) {
      const unpacked = path.join(process.resourcesPath, 'app.asar.unpacked/backend/dist/server.js');
      if (fs.existsSync(unpacked)) {
        serverScript = unpacked;
      }
    }

    if (fs.existsSync(serverScript)) {
      backendProcess = fork(serverScript, [], {
        env: {
          ...process.env,
          NODE_ENV: 'production',
          PORT: '5000',
          DATA_DIR: localDataPath,
        },
        silent: true,
      });

      backendProcess.on('error', (err) => {
        console.error('Backend process error:', err);
      });
    }
  } catch (err) {
    console.error('Failed to start embedded backend server:', err);
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#030712',
    title: 'Rasin Arts Luxury 3D Studio - Desktop Application',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    show: false, // Show when ready to prevent white flash
  });

  // Load URL
  if (isDev) {
    const loadDevServer = () => {
      mainWindow.loadURL(DEV_URL).catch(() => {
        console.log('Waiting for Vite frontend dev server at http://localhost:5173...');
        setTimeout(loadDevServer, 1500);
      });
    };
    loadDevServer();
  } else {
    // Production built dist
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }

  // Gracefully reveal & maximize window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
    mainWindow.focus();
  });

  // Intercept external links (WhatsApp, Maps, etc.) and open in system default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://wa.me') || url.startsWith('http') || url.startsWith('mailto')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  buildAppMenu();
}

function buildAppMenu() {
  const template = [
    {
      label: '🎨 Storefront',
      submenu: [
        {
          label: 'Home Gallery',
          accelerator: 'CmdOrCtrl+H',
          click: () => mainWindow && mainWindow.loadURL(`${DEV_URL}/`),
        },
        {
          label: '3D Live Customizer',
          accelerator: 'CmdOrCtrl+3',
          click: () => mainWindow && mainWindow.loadURL(`${DEV_URL}/customizer`),
        },
        {
          label: 'Browse Catalog',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow && mainWindow.loadURL(`${DEV_URL}/shop`),
        },
        {
          label: 'Corporate & Bulk Gifting',
          accelerator: 'CmdOrCtrl+B',
          click: () => mainWindow && mainWindow.loadURL(`${DEV_URL}/bulk-gifting`),
        },
        { type: 'separator' },
        {
          label: 'Track Orders & Tax Invoices',
          click: () => mainWindow && mainWindow.loadURL(`${DEV_URL}/orders`),
        },
      ],
    },
    {
      label: '👑 Admin Studio',
      submenu: [
        {
          label: 'Admin Dashboard',
          accelerator: 'CmdOrCtrl+D',
          click: () => mainWindow && mainWindow.loadURL(`${DEV_URL}/admin`),
        },
        {
          label: 'Customer Orders & Packing Slips',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow && mainWindow.loadURL(`${DEV_URL}/admin/orders`),
        },
        {
          label: 'B2B Bulk Inquiries & Leads',
          click: () => mainWindow && mainWindow.loadURL(`${DEV_URL}/admin/bulk-inquiries`),
        },
        {
          label: 'Products & 3D Catalog',
          click: () => mainWindow && mainWindow.loadURL(`${DEV_URL}/admin/products`),
        },
        {
          label: 'Warehouse Inventory',
          click: () => mainWindow && mainWindow.loadURL(`${DEV_URL}/admin/inventory`),
        },
        {
          label: 'Resin Mix Calculator',
          click: () => mainWindow && mainWindow.loadURL(`${DEV_URL}/admin/resin-calculator`),
        },
        { type: 'separator' },
        {
          label: 'Store & Tax Settings',
          click: () => mainWindow && mainWindow.loadURL(`${DEV_URL}/admin/settings`),
        },
      ],
    },
    {
      label: '🛠️ View',
      submenu: [
        { role: 'reload', accelerator: 'CmdOrCtrl+R' },
        { role: 'forceReload', accelerator: 'CmdOrCtrl+Shift+R' },
        { role: 'toggleDevTools', accelerator: 'F12' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'ℹ️ Help',
      submenu: [
        {
          label: 'Rasin Arts Official Website',
          click: () => shell.openExternal('http://localhost:5173'),
        },
        {
          label: 'About Rasin Arts Desktop Studio',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Rasin Arts Desktop Studio',
              message: 'Rasin Arts Luxury 3D Studio & Desktop Commerce',
              detail: 'Version 1.0.0\nBuilt with Electron, React, Three.js & Tailwind CSS\nHandcrafted Resin Art Platform',
              buttons: ['OK'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers for custom window buttons if needed
ipcMain.on('window-minimize', () => mainWindow && mainWindow.minimize());
ipcMain.on('window-maximize', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on('window-close', () => mainWindow && mainWindow.close());

app.whenReady().then(() => {
  startBackendServer();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    try {
      backendProcess.kill();
    } catch (e) {}
    backendProcess = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    try {
      backendProcess.kill();
    } catch (e) {}
    backendProcess = null;
  }
});
