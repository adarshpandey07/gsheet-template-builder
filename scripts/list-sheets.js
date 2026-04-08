import { authenticate } from '../src/auth/setup.js';
import { google } from 'googleapis';

async function listSheets() {
  console.log('\n📋 Fetching your Google Sheets...\n');

  const auth = await authenticate();
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    fields: 'files(id, name, createdTime, webViewLink)',
    orderBy: 'createdTime desc',
    pageSize: 20,
  });

  const files = res.data.files;
  if (!files || files.length === 0) {
    console.log('  No spreadsheets found.');
    return;
  }

  console.log(`  Found ${files.length} spreadsheet(s):\n`);
  files.forEach((file, i) => {
    const date = new Date(file.createdTime).toLocaleDateString();
    console.log(`  ${i + 1}. ${file.name}`);
    console.log(`     Created: ${date}`);
    console.log(`     Link: ${file.webViewLink}`);
    console.log(`     Copy: https://docs.google.com/spreadsheets/d/${file.id}/copy`);
    console.log('');
  });
}

listSheets().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
