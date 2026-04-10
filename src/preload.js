const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('laonAPI', {
  // Auth
  getAuthStatus: () => ipcRenderer.invoke('auth:status'),
  startAuth: () => ipcRenderer.invoke('auth:start'),
  cancelAuth: () => ipcRenderer.invoke('auth:cancel'),
  logout: () => ipcRenderer.invoke('auth:logout'),

  // Database
  autoSetupDatabase: () => ipcRenderer.invoke('db:autoSetup'),

  // Todos
  getTodos: () => ipcRenderer.invoke('notion:getTodos'),
  updateStatus: (pageId, status) =>
    ipcRenderer.invoke('notion:updateStatus', { pageId, status }),
  openPage: (url) => ipcRenderer.invoke('notion:openPage', url),

  // Dialog
  showAlert: (message) => ipcRenderer.invoke('dialog:alert', message),

  // Window
  toggleVisibility: () => ipcRenderer.invoke('window:toggleVisibility'),
  setIgnoreMouse: (ignore) => ipcRenderer.send('set-ignore-mouse', ignore),
  onWindowBlur: (callback) => {
    ipcRenderer.on('window-blur', callback);
    return () => ipcRenderer.removeListener('window-blur', callback);
  },
});
