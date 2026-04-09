// Notion API client wrapper (used in main process via electron.js)
// This file is kept as a reference for the API structure.
// The actual Notion calls are handled in electron.js via IPC.

const STATUS_MAP = {
  'Not started': 'Todo',
  'In progress': 'In Progress',
  Done: 'Done',
};

const REVERSE_STATUS_MAP = Object.fromEntries(
  Object.entries(STATUS_MAP).map(([k, v]) => [v, k])
);

module.exports = { STATUS_MAP, REVERSE_STATUS_MAP };
