const http = require('http');
const { shell } = require('electron');
const { saveToken } = require('./store');

const NOTION_AUTH_URL = 'https://api.notion.com/v1/oauth/authorize';
const NOTION_TOKEN_URL = 'https://api.notion.com/v1/oauth/token';
const CALLBACK_PORT = 19847;
const REDIRECT_URI = `http://localhost:${CALLBACK_PORT}/notion/callback`;

function getOAuthConfig() {
  const clientId = process.env.NOTION_OAUTH_CLIENT_ID;
  const clientSecret = process.env.NOTION_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('NOTION_OAUTH_CLIENT_ID and NOTION_OAUTH_CLIENT_SECRET must be set');
  }
  return { clientId, clientSecret };
}

function startOAuthFlow() {
  const { clientId } = getOAuthConfig();

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (!req.url.startsWith('/notion/callback')) {
        res.writeHead(404);
        res.end();
        return;
      }

      const url = new URL(req.url, `http://localhost:${CALLBACK_PORT}`);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error || !code) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(buildResultPage(false, '연결이 취소되었습니다.'));
        server.close();
        reject(new Error(error || 'No authorization code received'));
        return;
      }

      try {
        const tokenData = await exchangeCodeForToken(code);
        saveToken(tokenData.access_token, {
          name: tokenData.workspace_name,
          icon: tokenData.workspace_icon,
        });

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(buildResultPage(true, `${tokenData.workspace_name} 워크스페이스에 연결되었습니다!`));
        server.close();
        resolve(tokenData);
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(buildResultPage(false, '토큰 교환에 실패했습니다.'));
        server.close();
        reject(err);
      }
    });

    server.listen(CALLBACK_PORT, () => {
      const authUrl = `${NOTION_AUTH_URL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&owner=user`;
      shell.openExternal(authUrl);
    });

    server.on('error', (err) => {
      reject(new Error(`OAuth callback server failed: ${err.message}`));
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('OAuth flow timed out'));
    }, 5 * 60 * 1000);
  });
}

async function exchangeCodeForToken(code) {
  const { clientId, clientSecret } = getOAuthConfig();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(NOTION_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

function buildResultPage(success, message) {
  const emoji = success ? '🎉' : '😿';
  const color = success ? '#4CAF50' : '#f44336';
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Laon Focus</title></head>
<body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#1a1a2e;color:#fff;">
  <div style="text-align:center">
    <div style="font-size:64px">${emoji}</div>
    <h2 style="color:${color}">${message}</h2>
    <p style="color:#888">이 창을 닫고 앱으로 돌아가주세요.</p>
  </div>
</body>
</html>`;
}

module.exports = { startOAuthFlow, REDIRECT_URI };
