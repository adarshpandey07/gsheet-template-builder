/**
 * One-time auth setup script.
 * Uses Google Cloud SDK's OAuth client to get Sheets + Drive tokens.
 * This avoids needing to manually create OAuth credentials in Cloud Console.
 */
import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = path.join(__dirname, '../config');
const TOKEN_PATH = path.join(CONFIG_DIR, 'token.json');

// Google Cloud SDK's own OAuth client — works for desktop/installed apps
const GCLOUD_CLIENT_ID = '764086051850-6qr4p6gpi6hn506pt8ejuq83di341hur.apps.googleusercontent.com';
const GCLOUD_CLIENT_SECRET = 'd-FL95Q19q7MQmFpd7hHD0Ty';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
];

const PORT = 8085;

async function setup() {
  if (fs.existsSync(TOKEN_PATH)) {
    console.log('✅ Token already exists at config/token.json');
    console.log('   Delete it and re-run if you want to re-authenticate.\n');
    process.exit(0);
  }

  const client = new OAuth2Client(
    GCLOUD_CLIENT_ID,
    GCLOUD_CLIENT_SECRET,
    `http://localhost:${PORT}`
  );

  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        if (url.pathname !== '/') {
          res.writeHead(404);
          res.end();
          return;
        }

        const code = url.searchParams.get('code');
        if (!code) {
          res.end('No authorization code received.');
          return;
        }

        const { tokens } = await client.getToken(code);

        const savedCreds = {
          client_id: GCLOUD_CLIENT_ID,
          client_secret: GCLOUD_CLIENT_SECRET,
          refresh_token: tokens.refresh_token,
          token_type: 'authorized_user',
        };

        fs.writeFileSync(TOKEN_PATH, JSON.stringify(savedCreds, null, 2));

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h2>✅ Authentication successful!</h2><p>You can close this tab and return to the terminal.</p>');

        console.log('\n✅ Authentication successful!');
        console.log('   Token saved to config/token.json\n');

        server.close();
        resolve();
      } catch (err) {
        res.writeHead(500);
        res.end('Authentication failed: ' + err.message);
        server.close();
        reject(err);
      }
    });

    server.listen(PORT, () => {
      console.log('\n🔐 Opening browser for Google Sheets + Drive authentication...');
      console.log(`\n   If browser doesn't open, visit:\n   ${authUrl}\n`);
      open(authUrl);
    });
  });
}

setup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
  });
