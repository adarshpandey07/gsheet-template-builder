import { authenticate } from '../auth/setup.js';
import { SheetsHelper } from '../utils/sheets-helper.js';

// ─── Color Palette ──────────────────────────────────────────────────
const COLORS = {
  primary:    '#1B4332',  // Dark green
  secondary:  '#2D6A4F',  // Medium green
  accent:     '#40916C',  // Light green
  light:      '#B7E4C7',  // Pale green
  ultraLight: '#D8F3DC',  // Very pale green
  white:      '#FFFFFF',
  dark:       '#1A1A2E',  // Dark navy
  gray:       '#F8F9FA',  // Light gray bg
  medGray:    '#E9ECEF',  // Medium gray
  textDark:   '#212529',  // Dark text
  textMed:    '#495057',  // Medium text
  red:        '#E63946',  // Expense/over-budget
  orange:     '#F4A261',  // Warning
  gold:       '#E9C46A',  // Wants
  blue:       '#457B9D',  // Savings
};

const SHEET_IDS = {
  dashboard: 0,
  transactions: 1,
  categories: 2,
  settings: 3,
  monthlyLog: 4,
};

async function buildBudgetTracker() {
  console.log('\n🚀 Building 50/30/20 Budget Tracker Template...\n');

  const auth = await authenticate();
  const helper = new SheetsHelper(auth);

  // 1. Create spreadsheet with tabs
  await helper.createSpreadsheet('50/30/20 Budget Tracker | Monthly Planner', [
    '📊 Dashboard',
    '💳 Transactions',
    '📁 Categories',
    '⚙️ Settings',
    '📅 Monthly Log',
  ]);

  // 2. Build each tab
  await buildSettingsTab(helper);
  await buildCategoriesTab(helper);
  await buildTransactionsTab(helper);
  await buildMonthlyLogTab(helper);
  await buildDashboardTab(helper);

  // 3. Share with user and set public access
  await helper.shareWithUser('adarshpandey1949@gmail.com');
  await helper.setViewerAccess();

  console.log('\n✅ Budget Tracker template built successfully!');
  console.log(`\n🛒 Sell this template using the "Make a Copy" link above.`);
}

// ─── SETTINGS TAB ───────────────────────────────────────────────────

async function buildSettingsTab(helper) {
  console.log('   ⚙️  Building Settings tab...');
  const sid = SHEET_IDS.settings;

  // Data
  await helper.writeData("'⚙️ Settings'!A1:B15", [
    ['⚙️ BUDGET SETTINGS', ''],
    ['', ''],
    ['Monthly Income', 5000],
    ['Currency Symbol', '$'],
    ['', ''],
    ['50/30/20 ALLOCATION', ''],
    ['Needs (50%)', '=B3*0.5'],
    ['Wants (30%)', '=B3*0.3'],
    ['Savings (20%)', '=B3*0.2'],
    ['', ''],
    ['BUDGET PERIOD', ''],
    ['Current Month', '=TEXT(TODAY(),"MMMM")'],
    ['Current Year', '=YEAR(TODAY())'],
    ['Start Date', '=DATE(B13,MATCH(B12,{"January","February","March","April","May","June","July","August","September","October","November","December"},0),1)'],
    ['End Date', '=EOMONTH(B14,0)'],
  ]);

  // Formatting
  const requests = [
    helper.setTabColor(sid, COLORS.accent),
    helper.setColumnWidth(sid, 0, 1, 250),
    helper.setColumnWidth(sid, 1, 2, 200),
    helper.setRowHeight(sid, 0, 1, 50),
    // Title
    helper.mergeCells(sid, 0, 1, 0, 2),
    helper.formatRange(sid, 0, 1, 0, 2, {
      ...SheetsHelper.headerFormat(COLORS.primary, '#FFFFFF', 16),
    }),
    // Labels
    helper.formatRange(sid, 2, 15, 0, 1, SheetsHelper.cellFormat(COLORS.white, COLORS.textDark, 11, true)),
    // Values
    helper.formatRange(sid, 2, 15, 1, 2, SheetsHelper.cellFormat(COLORS.ultraLight, COLORS.textDark, 11)),
    // Section headers
    helper.formatRange(sid, 5, 6, 0, 2, SheetsHelper.headerFormat(COLORS.secondary, '#FFFFFF', 11)),
    helper.formatRange(sid, 10, 11, 0, 2, SheetsHelper.headerFormat(COLORS.secondary, '#FFFFFF', 11)),
    helper.mergeCells(sid, 5, 6, 0, 2),
    helper.mergeCells(sid, 10, 11, 0, 2),
    // Currency format
    helper.currencyFormat(sid, 2, 3, 1, 2),
    helper.currencyFormat(sid, 6, 9, 1, 2),
    // Borders
    helper.addBorders(sid, 0, 15, 0, 2, COLORS.medGray),
    helper.freezeRows(sid, 1),
  ];

  await helper.batchUpdate(requests);
}

// ─── CATEGORIES TAB ─────────────────────────────────────────────────

async function buildCategoriesTab(helper) {
  console.log('   📁 Building Categories tab...');
  const sid = SHEET_IDS.categories;

  const headers = ['Category Name', 'Type', 'Monthly Budget', 'Description'];

  const data = [
    headers,
    ['🏠 Rent/Mortgage',   'Needs', 1500, 'Monthly housing payment'],
    ['🔌 Utilities',       'Needs', 200,  'Electric, water, gas, internet'],
    ['🛒 Groceries',       'Needs', 400,  'Food and household supplies'],
    ['🚗 Transportation',  'Needs', 150,  'Gas, public transit, car payment'],
    ['💊 Health Insurance', 'Needs', 250,  'Monthly insurance premium'],
    ['📱 Phone',           'Needs', 80,   'Mobile phone plan'],
    ['🍽️ Dining Out',      'Wants', 200,  'Restaurants and takeout'],
    ['🎬 Entertainment',   'Wants', 100,  'Movies, streaming, events'],
    ['🛍️ Shopping',        'Wants', 150,  'Clothing, accessories, electronics'],
    ['✈️ Travel',          'Wants', 200,  'Vacations and weekend trips'],
    ['💇 Personal Care',   'Wants', 80,   'Haircuts, gym, self-care'],
    ['🎁 Gifts',           'Wants', 50,   'Birthday, holiday gifts'],
    ['💰 Emergency Fund',  'Savings', 500, 'Rainy day fund contributions'],
    ['📈 Investments',     'Savings', 300, 'Stock, crypto, mutual funds'],
    ['🎓 Retirement',      'Savings', 200, '401k, IRA contributions'],
  ];

  await helper.writeData("'📁 Categories'!A1:D16", data);

  const requests = [
    helper.setTabColor(sid, COLORS.gold),
    helper.setColumnWidth(sid, 0, 1, 220),
    helper.setColumnWidth(sid, 1, 2, 120),
    helper.setColumnWidth(sid, 2, 3, 150),
    helper.setColumnWidth(sid, 3, 4, 300),
    helper.setRowHeight(sid, 0, 1, 40),
    // Header row
    helper.formatRange(sid, 0, 1, 0, 4, SheetsHelper.headerFormat(COLORS.primary, '#FFFFFF', 12)),
    // Data rows
    helper.formatRange(sid, 1, 16, 0, 4, SheetsHelper.cellFormat(COLORS.white, COLORS.textDark, 10)),
    // Alternate row colors
    ...Array.from({ length: 8 }, (_, i) =>
      helper.formatRange(sid, 1 + i * 2, 2 + i * 2, 0, 4, SheetsHelper.cellFormat(COLORS.ultraLight, COLORS.textDark, 10))
    ),
    // Type dropdown
    helper.addDropdown(sid, 1, 100, 1, 2, ['Needs', 'Wants', 'Savings']),
    // Currency format for budget column
    helper.currencyFormat(sid, 1, 16, 2, 3),
    // Borders
    helper.addBorders(sid, 0, 16, 0, 4, COLORS.medGray),
    // Conditional formatting for types
    helper.addConditionalFormat(sid, 1, 100, 1, 2, '=$B2="Needs"', COLORS.light),
    helper.addConditionalFormat(sid, 1, 100, 1, 2, '=$B2="Wants"', '#FFF3CD'),
    helper.addConditionalFormat(sid, 1, 100, 1, 2, '=$B2="Savings"', '#CCE5FF'),
    helper.freezeRows(sid, 1),
  ];

  await helper.batchUpdate(requests);
}

// ─── TRANSACTIONS TAB ───────────────────────────────────────────────

async function buildTransactionsTab(helper) {
  console.log('   💳 Building Transactions tab...');
  const sid = SHEET_IDS.transactions;

  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Payment Method', 'Notes'];

  // Sample transactions for demonstration
  const sampleData = [
    headers,
    ['=TODAY()-25', 'Monthly Rent', '🏠 Rent/Mortgage', 'Needs', 1500, 'Bank Transfer', 'April rent'],
    ['=TODAY()-23', 'Grocery Run', '🛒 Groceries', 'Needs', 85.50, 'Debit Card', 'Weekly groceries'],
    ['=TODAY()-20', 'Electric Bill', '🔌 Utilities', 'Needs', 95, 'Auto-Pay', ''],
    ['=TODAY()-18', 'Dinner with friends', '🍽️ Dining Out', 'Wants', 45, 'Credit Card', 'Pizza night'],
    ['=TODAY()-15', 'Netflix + Spotify', '🎬 Entertainment', 'Wants', 25.99, 'Credit Card', 'Monthly subs'],
    ['=TODAY()-12', 'Gas Station', '🚗 Transportation', 'Needs', 55, 'Debit Card', ''],
    ['=TODAY()-10', 'Emergency Fund', '💰 Emergency Fund', 'Savings', 500, 'Bank Transfer', 'Monthly deposit'],
    ['=TODAY()-8',  'New Shoes', '🛍️ Shopping', 'Wants', 89.99, 'Credit Card', 'Running shoes'],
    ['=TODAY()-5',  'Index Fund', '📈 Investments', 'Savings', 300, 'Brokerage', 'Monthly DCA'],
    ['=TODAY()-3',  'Groceries', '🛒 Groceries', 'Needs', 62.30, 'Debit Card', ''],
    ['=TODAY()-1',  'Coffee Shop', '🍽️ Dining Out', 'Wants', 12.50, 'Cash', ''],
  ];

  await helper.writeData("'💳 Transactions'!A1:G12", sampleData);

  // Category names for dropdown (references Categories tab)
  const categoryNames = [
    '🏠 Rent/Mortgage', '🔌 Utilities', '🛒 Groceries', '🚗 Transportation',
    '💊 Health Insurance', '📱 Phone', '🍽️ Dining Out', '🎬 Entertainment',
    '🛍️ Shopping', '✈️ Travel', '💇 Personal Care', '🎁 Gifts',
    '💰 Emergency Fund', '📈 Investments', '🎓 Retirement',
  ];

  const requests = [
    helper.setTabColor(sid, COLORS.secondary),
    helper.setColumnWidth(sid, 0, 1, 130), // Date
    helper.setColumnWidth(sid, 1, 2, 250), // Description
    helper.setColumnWidth(sid, 2, 3, 200), // Category
    helper.setColumnWidth(sid, 3, 4, 100), // Type
    helper.setColumnWidth(sid, 4, 5, 130), // Amount
    helper.setColumnWidth(sid, 5, 6, 160), // Payment Method
    helper.setColumnWidth(sid, 6, 7, 200), // Notes
    helper.setRowHeight(sid, 0, 1, 45),
    // Header formatting
    helper.formatRange(sid, 0, 1, 0, 7, SheetsHelper.headerFormat(COLORS.primary, '#FFFFFF', 12)),
    // Data formatting
    helper.formatRange(sid, 1, 500, 0, 7, SheetsHelper.cellFormat(COLORS.white, COLORS.textDark, 10)),
    // Date format
    helper.numberFormat(sid, 1, 500, 0, 1, 'MMM DD, YYYY'),
    // Currency format
    helper.currencyFormat(sid, 1, 500, 4, 5),
    // Dropdowns
    helper.addDropdown(sid, 1, 500, 2, 3, categoryNames),
    helper.addDropdown(sid, 1, 500, 3, 4, ['Needs', 'Wants', 'Savings']),
    helper.addDropdown(sid, 1, 500, 5, 6, ['Cash', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Auto-Pay', 'Brokerage', 'Other']),
    // Alternating row colors
    helper.addConditionalFormat(sid, 1, 500, 0, 7, '=ISEVEN(ROW())', COLORS.gray),
    // Type-based row highlighting
    helper.addConditionalFormat(sid, 1, 500, 3, 4, '=$D2="Needs"', COLORS.ultraLight),
    helper.addConditionalFormat(sid, 1, 500, 3, 4, '=$D2="Wants"', '#FFF3CD'),
    helper.addConditionalFormat(sid, 1, 500, 3, 4, '=$D2="Savings"', '#CCE5FF'),
    // Borders
    helper.addBorders(sid, 0, 12, 0, 7, COLORS.medGray),
    helper.freezeRows(sid, 1),
  ];

  await helper.batchUpdate(requests);
}

// ─── MONTHLY LOG TAB ────────────────────────────────────────────────

async function buildMonthlyLogTab(helper) {
  console.log('   📅 Building Monthly Log tab...');
  const sid = SHEET_IDS.monthlyLog;

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];

  const headers = ['Month', 'Income', 'Needs Spent', 'Wants Spent', 'Savings', 'Total Spent', 'Remaining', 'Savings Rate'];

  const data = [headers];
  for (let i = 0; i < 12; i++) {
    const row = i + 2; // Excel row number
    data.push([
      months[i],
      `='⚙️ Settings'!B3`,  // Income from settings
      `=SUMPRODUCT(('💳 Transactions'!D$2:D$500="Needs")*('💳 Transactions'!E$2:E$500)*(MONTH('💳 Transactions'!A$2:A$500)=${i + 1}))`,
      `=SUMPRODUCT(('💳 Transactions'!D$2:D$500="Wants")*('💳 Transactions'!E$2:E$500)*(MONTH('💳 Transactions'!A$2:A$500)=${i + 1}))`,
      `=SUMPRODUCT(('💳 Transactions'!D$2:D$500="Savings")*('💳 Transactions'!E$2:E$500)*(MONTH('💳 Transactions'!A$2:A$500)=${i + 1}))`,
      `=C${row}+D${row}+E${row}`,  // Total Spent
      `=B${row}-F${row}`,           // Remaining
      `=IF(B${row}>0,E${row}/B${row},0)`,  // Savings Rate
    ]);
  }

  // Totals row
  data.push([
    'TOTAL',
    '=SUM(B2:B13)', '=SUM(C2:C13)', '=SUM(D2:D13)', '=SUM(E2:E13)',
    '=SUM(F2:F13)', '=SUM(G2:G13)', '=IF(B14>0,E14/B14,0)',
  ]);

  await helper.writeData("'📅 Monthly Log'!A1:H14", data);

  const requests = [
    helper.setTabColor(sid, COLORS.blue),
    helper.setColumnWidth(sid, 0, 1, 130),
    helper.setColumnWidth(sid, 1, 8, 140),
    helper.setRowHeight(sid, 0, 1, 45),
    // Header
    helper.formatRange(sid, 0, 1, 0, 8, SheetsHelper.headerFormat(COLORS.primary, '#FFFFFF', 11)),
    // Data
    helper.formatRange(sid, 1, 13, 0, 8, SheetsHelper.cellFormat(COLORS.white, COLORS.textDark, 10)),
    // Totals row
    helper.formatRange(sid, 13, 14, 0, 8, SheetsHelper.headerFormat(COLORS.dark, '#FFFFFF', 11)),
    // Currency
    helper.currencyFormat(sid, 1, 14, 1, 7),
    // Percent
    helper.percentFormat(sid, 1, 14, 7, 8),
    // Alternating
    ...Array.from({ length: 6 }, (_, i) =>
      helper.formatRange(sid, 1 + i * 2, 2 + i * 2, 0, 8, SheetsHelper.cellFormat(COLORS.ultraLight, COLORS.textDark, 10))
    ),
    // Borders
    helper.addBorders(sid, 0, 14, 0, 8, COLORS.medGray),
    helper.freezeRows(sid, 1),
  ];

  await helper.batchUpdate(requests);
}

// ─── DASHBOARD TAB ──────────────────────────────────────────────────

async function buildDashboardTab(helper) {
  console.log('   📊 Building Dashboard tab...');
  const sid = SHEET_IDS.dashboard;

  // Dashboard summary data
  await helper.writeData("'📊 Dashboard'!A1:H30", [
    ['📊 50/30/20 BUDGET DASHBOARD', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    // ─── Summary Cards Row ───
    ['MONTHLY INCOME', '', 'TOTAL SPENT', '', 'REMAINING', '', 'SAVINGS RATE', ''],
    [`='⚙️ Settings'!B3`, '',
     `=SUMIF('💳 Transactions'!D:D,"Needs",'💳 Transactions'!E:E)+SUMIF('💳 Transactions'!D:D,"Wants",'💳 Transactions'!E:E)+SUMIF('💳 Transactions'!D:D,"Savings",'💳 Transactions'!E:E)`, '',
     `=A4-C4`, '',
     `=IF(A4>0,SUMIF('💳 Transactions'!D:D,"Savings",'💳 Transactions'!E:E)/A4,0)`, ''],
    ['', '', '', '', '', '', '', ''],
    // ─── 50/30/20 Breakdown ───
    ['CATEGORY', 'BUDGET', 'SPENT', '% USED', 'REMAINING', 'STATUS', '', ''],
    ['🟢 Needs (50%)',
     `='⚙️ Settings'!B7`,
     `=SUMIF('💳 Transactions'!D:D,"Needs",'💳 Transactions'!E:E)`,
     `=IF(B7>0,C7/B7,0)`,
     `=B7-C7`,
     `=IF(D7>1,"⚠️ OVER","✅ OK")`, '', ''],
    ['🟡 Wants (30%)',
     `='⚙️ Settings'!B8`,
     `=SUMIF('💳 Transactions'!D:D,"Wants",'💳 Transactions'!E:E)`,
     `=IF(B8>0,C8/B8,0)`,
     `=B8-C8`,
     `=IF(D8>1,"⚠️ OVER","✅ OK")`, '', ''],
    ['🔵 Savings (20%)',
     `='⚙️ Settings'!B9`,
     `=SUMIF('💳 Transactions'!D:D,"Savings",'💳 Transactions'!E:E)`,
     `=IF(B9>0,C9/B9,0)`,
     `=B9-C9`,
     `=IF(D9<1,"⚠️ LOW","✅ OK")`, '', ''],
    ['', '', '', '', '', '', '', ''],
    ['TOTAL',
     `=SUM(B7:B9)`,
     `=SUM(C7:C9)`,
     `=IF(B11>0,C11/B11,0)`,
     `=SUM(E7:E9)`,
     '', '', ''],
    ['', '', '', '', '', '', '', ''],
    // ─── Charts will go here (rows 13+) ───
    ['BUDGET vs ACTUAL', '', '', '', '', 'SPENDING BREAKDOWN', '', ''],
    // Rows 14-30 left empty for chart overlay
  ]);

  // ─── Top Categories section ───
  await helper.writeData("'📊 Dashboard'!A25:C30", [
    ['TOP SPENDING CATEGORIES', '', ''],
    ['Category', 'Amount', '% of Total'],
    [`=IFERROR(INDEX('📁 Categories'!A:A,MATCH(LARGE(COUNTIF('💳 Transactions'!C:C,'📁 Categories'!A$2:A$16),1),COUNTIF('💳 Transactions'!C:C,'📁 Categories'!A$2:A$16),0)+1),"—")`,
     `=IFERROR(SUMIF('💳 Transactions'!C:C,A27,'💳 Transactions'!E:E),0)`,
     `=IF(C4>0,B27/C4,0)`],
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ]);

  const requests = [
    helper.setTabColor(sid, COLORS.primary),
    // Column widths
    helper.setColumnWidth(sid, 0, 1, 200),
    helper.setColumnWidth(sid, 1, 2, 140),
    helper.setColumnWidth(sid, 2, 3, 200),
    helper.setColumnWidth(sid, 3, 4, 140),
    helper.setColumnWidth(sid, 4, 5, 200),
    helper.setColumnWidth(sid, 5, 6, 140),
    helper.setColumnWidth(sid, 6, 7, 200),
    helper.setColumnWidth(sid, 7, 8, 140),
    // Title row
    helper.setRowHeight(sid, 0, 1, 60),
    helper.mergeCells(sid, 0, 1, 0, 8),
    helper.formatRange(sid, 0, 1, 0, 8, {
      backgroundColor: SheetsHelper.hexToColor(COLORS.primary),
      textFormat: {
        foregroundColor: SheetsHelper.hexToColor('#FFFFFF'),
        fontSize: 20,
        bold: true,
        fontFamily: 'Montserrat',
      },
      horizontalAlignment: 'CENTER',
      verticalAlignment: 'MIDDLE',
    }),
    // Summary card labels (row 3)
    helper.setRowHeight(sid, 2, 3, 30),
    ...[0, 2, 4, 6].map(col => helper.mergeCells(sid, 2, 3, col, col + 2)),
    helper.formatRange(sid, 2, 3, 0, 8, SheetsHelper.headerFormat(COLORS.secondary, '#FFFFFF', 10)),
    // Summary card values (row 4)
    helper.setRowHeight(sid, 3, 4, 50),
    ...[0, 2, 4, 6].map(col => helper.mergeCells(sid, 3, 4, col, col + 2)),
    helper.formatRange(sid, 3, 4, 0, 8, {
      backgroundColor: SheetsHelper.hexToColor(COLORS.ultraLight),
      textFormat: {
        foregroundColor: SheetsHelper.hexToColor(COLORS.primary),
        fontSize: 22,
        bold: true,
        fontFamily: 'Montserrat',
      },
      horizontalAlignment: 'CENTER',
      verticalAlignment: 'MIDDLE',
    }),
    // Currency format for summary values
    helper.currencyFormat(sid, 3, 4, 0, 1),
    helper.currencyFormat(sid, 3, 4, 2, 3),
    helper.currencyFormat(sid, 3, 4, 4, 5),
    helper.percentFormat(sid, 3, 4, 6, 7),
    // 50/30/20 Breakdown header
    helper.setRowHeight(sid, 5, 6, 40),
    helper.formatRange(sid, 5, 6, 0, 6, SheetsHelper.headerFormat(COLORS.dark, '#FFFFFF', 11)),
    // Breakdown data rows
    helper.formatRange(sid, 6, 10, 0, 6, SheetsHelper.cellFormat(COLORS.white, COLORS.textDark, 11)),
    helper.formatRange(sid, 6, 7, 0, 6, SheetsHelper.cellFormat(COLORS.ultraLight, COLORS.textDark, 11, true)),
    helper.formatRange(sid, 7, 8, 0, 6, SheetsHelper.cellFormat('#FFFDE7', COLORS.textDark, 11, true)),
    helper.formatRange(sid, 8, 9, 0, 6, SheetsHelper.cellFormat('#E3F2FD', COLORS.textDark, 11, true)),
    // Totals row
    helper.formatRange(sid, 10, 11, 0, 6, SheetsHelper.headerFormat(COLORS.primary, '#FFFFFF', 11)),
    // Currency format for breakdown
    helper.currencyFormat(sid, 6, 11, 1, 3),
    helper.currencyFormat(sid, 6, 11, 4, 5),
    // Percent format
    helper.percentFormat(sid, 6, 11, 3, 4),
    // Borders for breakdown section
    helper.addBorders(sid, 5, 11, 0, 6, COLORS.medGray),
    // Chart section headers
    helper.setRowHeight(sid, 12, 13, 35),
    helper.mergeCells(sid, 12, 13, 0, 4),
    helper.mergeCells(sid, 12, 13, 5, 8),
    helper.formatRange(sid, 12, 13, 0, 8, SheetsHelper.headerFormat(COLORS.secondary, '#FFFFFF', 12)),
    // Top categories header
    helper.formatRange(sid, 24, 25, 0, 3, SheetsHelper.headerFormat(COLORS.dark, '#FFFFFF', 12)),
    helper.mergeCells(sid, 24, 25, 0, 3),
    helper.formatRange(sid, 25, 26, 0, 3, SheetsHelper.headerFormat(COLORS.secondary, '#FFFFFF', 10)),
    // Donut chart — Spending Breakdown (Needs vs Wants vs Savings)
    helper.addPieChart(
      sid, 'Spending by Category',
      sid,
      { startRowIndex: 6, endRowIndex: 9, startColumnIndex: 0, endColumnIndex: 1 },
      { startRowIndex: 6, endRowIndex: 9, startColumnIndex: 2, endColumnIndex: 3 },
      13, 5, 500, 350
    ),
    // Bar chart — Budget vs Actual
    helper.addBarChart(
      sid, 'Budget vs Actual',
      sid,
      { startRowIndex: 5, endRowIndex: 9, startColumnIndex: 0, endColumnIndex: 1 },
      [
        { source: { startRowIndex: 5, endRowIndex: 9, startColumnIndex: 1, endColumnIndex: 2 }, color: COLORS.accent },
        { source: { startRowIndex: 5, endRowIndex: 9, startColumnIndex: 2, endColumnIndex: 3 }, color: COLORS.red },
      ],
      13, 0, 500, 350
    ),
    // Freeze title
    helper.freezeRows(sid, 2),
  ];

  await helper.batchUpdate(requests);
}

// ─── Run ────────────────────────────────────────────────────────────

buildBudgetTracker().catch((err) => {
  console.error('❌ Build failed:', err.message);
  if (err.errors) console.error(JSON.stringify(err.errors, null, 2));
  process.exit(1);
});
