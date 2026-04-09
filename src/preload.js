const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('laonAPI', {
  // Auth
  getAuthStatus: () => ipcRenderer.invoke('auth:status'),
  startAuth: () => ipcRenderer.invoke('auth:start'),
  logout: () => ipcRenderer.invoke('auth:logout'),

  // Database selection
  listDatabases: () => ipcRenderer.invoke('db:list'),
  selectDatabase: (databaseId, databaseName) =>
    ipcRenderer.invoke('db:select', { databaseId, databaseName }),

  // Todos
  getTodos: () => ipcRenderer.invoke('notion:getTodos'),
  updateStatus: (pageId, status) =>
    ipcRenderer.invoke('notion:updateStatus', { pageId, status }),
  openPage: (url) => ipcRenderer.invoke('notion:openPage', url),

  // Window
  toggleVisibility: () => ipcRenderer.invoke('window:toggleVisibility'),
  setIgnoreMouse: (ignore) => ipcRenderer.send('set-ignore-mouse', ignore),
  onWindowBlur: (callback) => {
    ipcRenderer.on('window-blur', callback);
    return () => ipcRenderer.removeListener('window-blur', callback);
  },
});
