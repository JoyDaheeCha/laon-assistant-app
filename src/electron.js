const { app, BrowserWindow, ipcMain, screen, Tray, nativeImage, shell } = require('electron');
const path = require('path');
require('dotenv').config();

const { Client } = require('@notionhq/client');
const { startOAuthFlow } = require('./auth/notionOAuth');
const credentialStore = require('./auth/store');

function getNotionClient() {
  const { token } = credentialStore.getCredentials();
  if (!token) return null;
  return new Client({ auth: token });
}

function getDatabaseId() {
  return credentialStore.getCredentials().databaseId;
}

let mainWindow = null;
let tray = null;

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = display.workAreaSize;
  const { y: workAreaY } = display.workArea;

  const winWidth = 480;
  const winHeight = 800;

  mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: 0,
    y: workAreaY + screenHeight - winHeight,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    roundedCorners: false,
    icon: path.join(__dirname, '..', 'public', 'laon_icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Force exact position after window is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.setPosition(0, workAreaY + screenHeight - winHeight);
  });

  // Click-through: transparent areas pass clicks to desktop
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
  }

  mainWindow.on('blur', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window-blur');
    }
  });

  // Log position for debugging
  mainWindow.webContents.on('did-finish-load', () => {
    const pos = mainWindow.getPosition();
    const size = mainWindow.getSize();
    console.log(`Window position: x=${pos[0]}, y=${pos[1]}, w=${size[0]}, h=${size[1]}`);
    console.log(`WorkArea: y=${workAreaY}, h=${screenHeight}`);
    console.log(`Expected bottom: ${workAreaY + screenHeight}, window bottom: ${pos[1] + size[1]}`);
  });
}

// --- Notion IPC Handlers ---

// --- Auth IPC Handlers ---

ipcMain.handle('auth:status', () => {
  return credentialStore.getAuthStatus();
});

ipcMain.handle('auth:start', async () => {
  try {
    const tokenData = await startOAuthFlow();
    return { success: true, workspaceName: tokenData.workspace_name };
  } catch (error) {
    console.error('OAuth error:', error.message);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:logout', () => {
  credentialStore.clearAll();
  return { success: true };
});

ipcMain.handle('db:list', async () => {
  const notion = getNotionClient();
  if (!notion) return { success: false, error: 'Not authenticated' };

  try {
    const response = await notion.search({
      filter: { value: 'database', property: 'object' },
      sort: { direction: 'descending', timestamp: 'last_edited_time' },
    });
    const databases = response.results.map((db) => ({
      id: db.id,
      title: db.title?.[0]?.plain_text || 'Untitled',
      icon: db.icon?.emoji || '📋',
    }));
    return { success: true, databases };
  } catch (error) {
    console.error('DB list error:', error.message);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:select', (_event, { databaseId, databaseName }) => {
  credentialStore.saveDatabase(databaseId, databaseName);
  return { success: true };
});

// --- Notion IPC Handlers ---

ipcMain.handle('notion:getTodos', async () => {
  const notion = getNotionClient();
  const databaseId = getDatabaseId();
  if (!notion || !databaseId) return [];

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        { property: 'Priority', direction: 'ascending' },
      ],
    });

    return response.results.map((page) => ({
      id: page.id,
      title: page.properties.Name?.title?.[0]?.plain_text || 'Untitled',
      status: page.properties.Status?.status?.name || 'Not started',
      priority: page.properties.Priority?.select?.name || 'None',
      dueDate: page.properties['Due Date']?.date?.start || null,
      url: page.url,
      tags: page.properties.Tags?.multi_select?.map((t) => t.name) || [],
    }));
  } catch (error) {
    console.error('Notion getTodos error:', error.message);
    return [];
  }
});

ipcMain.handle('notion:updateStatus', async (_event, { pageId, status }) => {
  const notion = getNotionClient();
  if (!notion) return { success: false, error: 'Not authenticated' };

  try {
    await notion.pages.update({
      page_id: pageId,
      properties: {
        Status: { status: { name: status } },
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Notion updateStatus error:', error.message);
    return { success: false, error: error.message };
  }
});

// Click-through toggle from renderer
ipcMain.on('set-ignore-mouse', (_event, ignore) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (ignore) {
      mainWindow.setIgnoreMouseEvents(true, { forward: true });
    } else {
      mainWindow.setIgnoreMouseEvents(false);
    }
  }
});

ipcMain.handle('notion:openPage', (_event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('window:toggleVisibility', () => {
  if (mainWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  }
});

// --- App Lifecycle ---

app.whenReady().then(() => {
  // macOS Dock icon
  const iconPath = path.join(__dirname, '..', 'public', 'laon_icon.png');
  const dockIcon = nativeImage.createFromPath(iconPath);
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(dockIcon);
  }
  createWindow();
});

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
