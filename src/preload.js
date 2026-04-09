const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('laonAPI', {
  getTodos: () => ipcRenderer.invoke('notion:getTodos'),
  updateStatus: (pageId, status) =>
    ipcRenderer.invoke('notion:updateStatus', { pageId, status }),
  openPage: (url) => ipcRenderer.invoke('notion:openPage', url),
  toggleVisibility: () => ipcRenderer.invoke('window:toggleVisibility'),
  setIgnoreMouse: (ignore) => ipcRenderer.send('set-ignore-mouse', ignore),
  onWindowBlur: (callback) => {
    ipcRenderer.on('window-blur', callback);
    return () => ipcRenderer.removeListener('window-blur', callback);
  },
});
