const Store = require('electron-store');

const store = new Store({
  name: 'laon-focus-credentials',
  encryptionKey: 'laon-focus-app-v1',
  schema: {
    notionToken: { type: 'string' },
    workspaceName: { type: 'string' },
    workspaceIcon: { type: 'string' },
    databaseId: { type: 'string' },
    databaseName: { type: 'string' },
  },
});

function getCredentials() {
  const token = store.get('notionToken');
  const databaseId = store.get('databaseId');
  return { token, databaseId };
}

function isAuthenticated() {
  const { token } = getCredentials();
  return !!token;
}

function isFullyConfigured() {
  const { token, databaseId } = getCredentials();
  return !!token && !!databaseId;
}

function saveToken(token, workspace) {
  store.set('notionToken', token);
  if (workspace?.name) store.set('workspaceName', workspace.name);
  if (workspace?.icon) store.set('workspaceIcon', workspace.icon);
}

function saveDatabase(databaseId, databaseName) {
  store.set('databaseId', databaseId);
  if (databaseName) store.set('databaseName', databaseName);
}

function getAuthStatus() {
  return {
    authenticated: isAuthenticated(),
    configured: isFullyConfigured(),
    workspaceName: store.get('workspaceName') || null,
    databaseName: store.get('databaseName') || null,
  };
}

function clearAll() {
  store.clear();
}

module.exports = {
  getCredentials,
  isAuthenticated,
  isFullyConfigured,
  saveToken,
  saveDatabase,
  getAuthStatus,
  clearAll,
};
