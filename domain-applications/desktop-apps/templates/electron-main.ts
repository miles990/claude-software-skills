/**
 * Electron Main Process Template
 * Usage: Copy to src/main/index.ts
 *
 * Features:
 * - Window management
 * - IPC communication
 * - System tray
 * - Auto-updater
 * - Security best practices
 */

import { app, BrowserWindow, ipcMain, Menu, Tray, shell, nativeTheme } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as fs from 'fs';

// ===========================================
// Configuration
// ===========================================

const isDev = !app.isPackaged;
const isMac = process.platform === 'darwin';

interface AppConfig {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
}

const config: AppConfig = {
  width: 1200,
  height: 800,
  minWidth: 800,
  minHeight: 600,
};

// ===========================================
// Window Management
// ===========================================

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: config.width,
    height: config.height,
    minWidth: config.minWidth,
    minHeight: config.minHeight,
    show: false, // Show when ready
    frame: true, // Set false for custom titlebar
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Load content
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Window events
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', (event) => {
    // Minimize to tray instead of closing (optional)
    if (tray && !app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

// ===========================================
// System Tray
// ===========================================

function createTray(): void {
  const iconPath = path.join(__dirname, '../assets/tray-icon.png');

  if (fs.existsSync(iconPath)) {
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show App', click: () => mainWindow?.show() },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() },
    ]);

    tray.setToolTip('My App');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      mainWindow?.isVisible() ? mainWindow.hide() : mainWindow?.show();
    });
  }
}

// ===========================================
// Application Menu
// ===========================================

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        { label: 'New', accelerator: 'CmdOrCtrl+N', click: () => sendToRenderer('menu:new') },
        { label: 'Open', accelerator: 'CmdOrCtrl+O', click: () => sendToRenderer('menu:open') },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => sendToRenderer('menu:save') },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [{ type: 'separator' as const }, { role: 'front' as const }]
          : [{ role: 'close' as const }]),
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://example.com/docs'),
        },
        {
          label: 'Report Issue',
          click: () => shell.openExternal('https://github.com/org/repo/issues'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ===========================================
// IPC Handlers
// ===========================================

function setupIPC(): void {
  // Get app info
  ipcMain.handle('app:info', () => ({
    name: app.name,
    version: app.getVersion(),
    platform: process.platform,
    isDev,
  }));

  // Get/set store value
  ipcMain.handle('store:get', (_event, key: string) => {
    // Implement with electron-store
    return null;
  });

  ipcMain.handle('store:set', (_event, key: string, value: unknown) => {
    // Implement with electron-store
    return true;
  });

  // File operations
  ipcMain.handle('fs:read', async (_event, filePath: string) => {
    return fs.promises.readFile(filePath, 'utf-8');
  });

  ipcMain.handle('fs:write', async (_event, filePath: string, content: string) => {
    await fs.promises.writeFile(filePath, content, 'utf-8');
    return true;
  });

  // Dialog operations
  ipcMain.handle('dialog:open', async (_event, options: Electron.OpenDialogOptions) => {
    const { dialog } = await import('electron');
    return dialog.showOpenDialog(mainWindow!, options);
  });

  ipcMain.handle('dialog:save', async (_event, options: Electron.SaveDialogOptions) => {
    const { dialog } = await import('electron');
    return dialog.showSaveDialog(mainWindow!, options);
  });

  // Theme
  ipcMain.handle('theme:get', () => nativeTheme.themeSource);

  ipcMain.handle('theme:set', (_event, mode: 'system' | 'light' | 'dark') => {
    nativeTheme.themeSource = mode;
    return mode;
  });
}

function sendToRenderer(channel: string, ...args: unknown[]): void {
  mainWindow?.webContents.send(channel, ...args);
}

// ===========================================
// Auto Updater
// ===========================================

function setupAutoUpdater(): void {
  if (isDev) return;

  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    sendToRenderer('update:available');
  });

  autoUpdater.on('update-downloaded', () => {
    sendToRenderer('update:downloaded');
  });

  ipcMain.handle('update:install', () => {
    autoUpdater.quitAndInstall();
  });
}

// ===========================================
// App Lifecycle
// ===========================================

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    createMenu();
    createTray();
    setupIPC();
    setupAutoUpdater();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('before-quit', () => {
  (app as any).isQuitting = true;
});

// Security: Disable navigation to external URLs
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, url) => {
    const parsed = new URL(url);
    if (parsed.origin !== 'http://localhost:5173' && !url.startsWith('file://')) {
      event.preventDefault();
    }
  });
});

export { mainWindow };
