const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const APP_NAME = 'Laon Assistant';
const plistPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'electron',
  'dist',
  'Electron.app',
  'Contents',
  'Info.plist'
);

if (!fs.existsSync(plistPath)) {
  console.log('[patch] Info.plist not found, skipping.');
  process.exit(0);
}

try {
  const current = execSync(
    `/usr/libexec/PlistBuddy -c "Print CFBundleName" "${plistPath}"`
  ).toString().trim();

  if (current === APP_NAME) {
    console.log(`[patch] Already patched to "${APP_NAME}".`);
    process.exit(0);
  }

  execSync(`/usr/libexec/PlistBuddy -c "Set CFBundleName ${APP_NAME}" "${plistPath}"`);
  execSync(`/usr/libexec/PlistBuddy -c "Set CFBundleDisplayName ${APP_NAME}" "${plistPath}"`);
  console.log(`[patch] Dock name patched to "${APP_NAME}".`);
} catch (err) {
  console.error('[patch] Failed:', err.message);
}
