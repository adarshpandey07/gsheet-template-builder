# 📊 Google Sheet Template Builder

Automated tool to create professional, sell-ready Google Sheets templates via the Google Sheets API. Build polished spreadsheets and sell them as digital products on Etsy, Gumroad, etc.

## Templates Included

| Template | Command | Description |
|----------|---------|-------------|
| 50/30/20 Budget Tracker | `npm run build:budget` | 5-tab budget dashboard with charts, categories, transaction tracking |
| Small Business Bookkeeping | `npm run build:bookkeeping` | P&L dashboard, income/expense tracking, tax deduction tracker |

## Quick Start

### 1. Google Cloud Setup (one-time)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "Sheet Template Builder")
3. Enable these APIs:
   - **Google Sheets API**
   - **Google Drive API**
4. Configure OAuth Consent Screen:
   - User Type: **External**
   - App name: "Sheet Builder"
   - Add scopes: `spreadsheets`, `drive.file`
   - Add your email as a **Test User**
5. Create Credentials:
   - Type: **OAuth 2.0 Client ID**
   - Application type: **Desktop App**
   - Download the JSON → save as `config/credentials.json`

### 2. Install & Authenticate

```bash
npm install
npm run auth    # Opens browser for Google login
```

### 3. Build a Template

```bash
npm run build:budget       # Creates 50/30/20 Budget Tracker
npm run build:bookkeeping  # Creates Business Bookkeeping Sheet
```

### 4. Sell It

1. Open the generated Google Sheet link
2. Review and customize colors/branding
3. Set sharing to "Anyone with the link can view"
4. Copy the `/copy` link (printed in terminal)
5. List on Etsy/Gumroad with the copy link as the deliverable

## Project Structure

```
gsheet-template-builder/
├── config/
│   ├── credentials.json    # Google OAuth credentials (gitignored)
│   └── token.json          # Auth token (auto-generated, gitignored)
├── src/
│   ├── auth/
│   │   └── setup.js        # OAuth2 authentication flow
│   ├── templates/
│   │   ├── budget-tracker.js   # 50/30/20 Budget Tracker builder
│   │   └── bookkeeping.js      # Small Business Bookkeeping builder
│   ├── utils/
│   │   └── sheets-helper.js    # Reusable Sheets API helpers
│   └── index.js            # CLI menu
├── scripts/
│   └── list-sheets.js      # List your Google Sheets
└── package.json
```

## Adding New Templates

1. Create a new file in `src/templates/`
2. Import `authenticate` and `SheetsHelper`
3. Define your color palette, sheet structure, formulas, and charts
4. Add an npm script to `package.json`

## Tips for Selling

- Use the `/copy` link so buyers get their own copy
- Create mockups showing the spreadsheet on a laptop/iPad screen
- Target niches with < 2,000 competing listings on Etsy
- Price between $10-$20 for basic templates, $25-$50 for complex ones
- Include 3-5 listing images (mockups + actual screenshots)
