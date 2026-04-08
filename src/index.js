import { authenticate } from './auth/setup.js';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   📊 Google Sheet Template Builder               ║');
  console.log('║   Build & sell professional spreadsheet templates ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  console.log('  Available templates:\n');
  console.log('  1. 💰 50/30/20 Budget Tracker');
  console.log('  2. 📒 Small Business Bookkeeping');
  console.log('  3. 🔐 Setup Google Auth');
  console.log('  4. 📋 List My Sheets');
  console.log('  0. ❌ Exit\n');

  const choice = await ask('  Choose an option (0-4): ');

  switch (choice.trim()) {
    case '1':
      rl.close();
      const { default: budget } = await import('./templates/budget-tracker.js');
      break;
    case '2':
      rl.close();
      const { default: bookkeeping } = await import('./templates/bookkeeping.js');
      break;
    case '3':
      rl.close();
      await authenticate();
      console.log('\n🎉 Auth setup complete!');
      break;
    case '4':
      rl.close();
      const { default: list } = await import('../scripts/list-sheets.js');
      break;
    case '0':
      console.log('\n  Bye! 👋\n');
      rl.close();
      process.exit(0);
    default:
      console.log('\n  ❌ Invalid option. Try again.\n');
      rl.close();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  rl.close();
  process.exit(1);
});
