import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = path.join(__dirname, '../../config');
const CREDENTIALS_PATH = path.join(CONFIG_DIR, 'credentials.json');
const TOKEN_PATH = path.join(CONFIG_DIR, 'token.json');

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
];

const PORT = 8085;

async function authenticate() {
  // Load OAuth client credentials
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ config/credentials.json not found.');
    process.exit(1);
  }

  const keys = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const key = keys.installed || keys.web;

  const oAuth2Client = new OAuth2Client(
    key.client_id,
    key.client_secret,
    `http://localhost:${PORT}`
  );

  // Use existing token if available
  if (fs.existsSync(TOKEN_PATH)) {
    const creds = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(creds);

    try {
      await oAuth2Client.getAccessToken();
      console.log('✅ Authenticated successfully.');
      return oAuth2Client;
    } catch {
      console.log('🔄 Token expired, re-authenticating...');
      fs.unlinkSync(TOKEN_PATH);
    }
  }

  // Get new token via browser flow
  return getNewToken(oAuth2Client);
}

function getNewToken(oAuth2Client) {
  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });

    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        const code = url.searchParams.get('code');
        if (!code) { res.writeHead(404); res.end(); return; }

        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h2>✅ Authentication successful!</h2><p>Close this tab and return to the terminal.</p>');
        console.log('✅ Authenticated successfully. Token saved.');

        server.close();
        resolve(oAuth2Client);
      } catch (err) {
        res.writeHead(500);
        res.end('Authentication failed: ' + err.message);
        server.close();
        reject(err);
      }
    });

    server.listen(PORT, () => {
      console.log('🔐 Opening browser for authentication...');
      open(authUrl);
    });
  });
}

export { authenticate };

// Run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  authenticate()
    .then(() => { console.log('🎉 Auth complete!'); process.exit(0); })
    .catch((err) => { console.error('❌ Failed:', err.message); process.exit(1); });
}
