import { authenticate } from '../auth/setup.js';
import { SheetsHelper } from '../utils/sheets-helper.js';

// ─── Color Palette (Professional Blue) ──────────────────────────────
const COLORS = {
  primary:    '#0D1B2A',  // Deep navy
  secondary:  '#1B3A5C',  // Navy blue
  accent:     '#415A77',  // Slate blue
  highlight:  '#778DA9',  // Light slate
  light:      '#D4E4F7',  // Pale blue
  ultraLight: '#EDF2FB',  // Very pale blue
  white:      '#FFFFFF',
  gray:       '#F8F9FA',
  medGray:    '#DEE2E6',
  textDark:   '#212529',
  green:      '#198754',  // Income
  red:        '#DC3545',  // Expense
  gold:       '#FFC107',  // Warning
};

const SHEET_IDS = {
  dashboard: 0,
  income: 1,
  expenses: 2,
  categories: 3,
  settings: 4,
};

async function buildBookkeeping() {
  console.log('\n🚀 Building Small Business Bookkeeping Template...\n');

  const auth = await authenticate();
  const helper = new SheetsHelper(auth);

  await helper.createSpreadsheet('Small Business Bookkeeping | Income & Expense Tracker', [
    '📊 P&L Dashboard',
    '💵 Income',
    '💸 Expenses',
    '📁 Categories',
    '⚙️ Settings',
  ]);

  await buildSettingsTab(helper);
  await buildCategoriesTab(helper);
  await buildIncomeTab(helper);
  await buildExpensesTab(helper);
  await buildDashboardTab(helper);

  await helper.shareWithUser('adarshpandey1949@gmail.com');
  await helper.setViewerAccess();

  console.log('\n✅ Bookkeeping template built successfully!');
  console.log(`\n🛒 Sell this template using the "Make a Copy" link above.`);
}

// ─── SETTINGS TAB ───────────────────────────────────────────────────

async function buildSettingsTab(helper) {
  console.log('   ⚙️  Building Settings tab...');
  const sid = SHEET_IDS.settings;

  await helper.writeData("'⚙️ Settings'!A1:B10", [
    ['⚙️ BUSINESS SETTINGS', ''],
    ['', ''],
    ['Business Name', 'My Business LLC'],
    ['Fiscal Year Start', '=DATE(YEAR(TODAY()),1,1)'],
    ['Currency', '$'],
    ['Tax Rate (%)', 25],
    ['', ''],
    ['QUICK STATS', ''],
    ['Total Income YTD', `=SUM('💵 Income'!D2:D1000)`],
    ['Total Expenses YTD', `=SUM('💸 Expenses'!D2:D1000)`],
  ]);

  const requests = [
    helper.setTabColor(sid, COLORS.accent),
    helper.setColumnWidth(sid, 0, 1, 220),
    helper.setColumnWidth(sid, 1, 2, 250),
    helper.setRowHeight(sid, 0, 1, 50),
    helper.mergeCells(sid, 0, 1, 0, 2),
    helper.formatRange(sid, 0, 1, 0, 2, SheetsHelper.headerFormat(COLORS.primary, '#FFFFFF', 16)),
    helper.formatRange(sid, 2, 10, 0, 1, SheetsHelper.cellFormat(COLORS.white, COLORS.textDark, 11, true)),
    helper.formatRange(sid, 2, 10, 1, 2, SheetsHelper.cellFormat(COLORS.ultraLight, COLORS.textDark, 11)),
    helper.formatRange(sid, 7, 8, 0, 2, SheetsHelper.headerFormat(COLORS.secondary, '#FFFFFF', 11)),
    helper.mergeCells(sid, 7, 8, 0, 2),
    helper.currencyFormat(sid, 8, 10, 1, 2),
    helper.addBorders(sid, 0, 10, 0, 2, COLORS.medGray),
    helper.freezeRows(sid, 1),
  ];

  await helper.batchUpdate(requests);
}

// ─── CATEGORIES TAB ─────────────────────────────────────────────────

async function buildCategoriesTab(helper) {
  console.log('   📁 Building Categories tab...');
  const sid = SHEET_IDS.categories;

  await helper.writeData("'📁 Categories'!A1:C20", [
    ['Category', 'Type', 'Tax Deductible'],
    // Income categories
    ['Product Sales', 'Income', 'No'],
    ['Service Revenue', 'Income', 'No'],
    ['Consulting', 'Income', 'No'],
    ['Affiliate Income', 'Income', 'No'],
    ['Other Income', 'Income', 'No'],
    // Expense categories
    ['Office Supplies', 'Expense', 'Yes'],
    ['Software & Tools', 'Expense', 'Yes'],
    ['Marketing & Ads', 'Expense', 'Yes'],
    ['Travel', 'Expense', 'Yes'],
    ['Meals & Entertainment', 'Expense', 'Partial'],
    ['Rent & Utilities', 'Expense', 'Yes'],
    ['Insurance', 'Expense', 'Yes'],
    ['Professional Services', 'Expense', 'Yes'],
    ['Phone & Internet', 'Expense', 'Yes'],
    ['Bank Fees', 'Expense', 'Yes'],
    ['Shipping & Postage', 'Expense', 'Yes'],
    ['Payroll', 'Expense', 'Yes'],
    ['Equipment', 'Expense', 'Yes'],
    ['Miscellaneous', 'Expense', 'No'],
  ]);

  const requests = [
    helper.setTabColor(sid, COLORS.gold),
    helper.setColumnWidth(sid, 0, 1, 220),
    helper.setColumnWidth(sid, 1, 2, 120),
    helper.setColumnWidth(sid, 2, 3, 150),
    helper.setRowHeight(sid, 0, 1, 40),
    helper.formatRange(sid, 0, 1, 0, 3, SheetsHelper.headerFormat(COLORS.primary, '#FFFFFF', 12)),
    helper.formatRange(sid, 1, 20, 0, 3, SheetsHelper.cellFormat(COLORS.white, COLORS.textDark, 10)),
    helper.addDropdown(sid, 1, 100, 1, 2, ['Income', 'Expense']),
    helper.addDropdown(sid, 1, 100, 2, 3, ['Yes', 'No', 'Partial']),
    helper.addConditionalFormat(sid, 1, 100, 1, 2, '=$B2="Income"', '#D4EDDA'),
    helper.addConditionalFormat(sid, 1, 100, 1, 2, '=$B2="Expense"', '#F8D7DA'),
    helper.addBorders(sid, 0, 20, 0, 3, COLORS.medGray),
    helper.freezeRows(sid, 1),
  ];

  await helper.batchUpdate(requests);
}

// ─── INCOME TAB ─────────────────────────────────────────────────────

async function buildIncomeTab(helper) {
  console.log('   💵 Building Income tab...');
  const sid = SHEET_IDS.income;

  const incomeCategories = ['Product Sales', 'Service Revenue', 'Consulting', 'Affiliate Income', 'Other Income'];

  await helper.writeData("'💵 Income'!A1:F10", [
    ['Date', 'Description', 'Category', 'Amount', 'Client/Source', 'Invoice #'],
    ['=TODAY()-30', 'Website redesign project', 'Service Revenue', 2500, 'ABC Corp', 'INV-001'],
    ['=TODAY()-25', 'Monthly consulting', 'Consulting', 1500, 'XYZ Ltd', 'INV-002'],
    ['=TODAY()-20', 'Product bundle sale', 'Product Sales', 350, 'Etsy Store', ''],
    ['=TODAY()-15', 'Affiliate commission', 'Affiliate Income', 125, 'Amazon Associates', ''],
    ['=TODAY()-10', 'Template pack sale', 'Product Sales', 89, 'Gumroad', ''],
    ['=TODAY()-5', 'SEO audit report', 'Service Revenue', 800, 'Local Bakery', 'INV-003'],
    ['=TODAY()-2', 'Strategy session', 'Consulting', 500, 'Startup Inc', 'INV-004'],
  ]);

  const requests = [
    helper.setTabColor(sid, COLORS.green),
    helper.setColumnWidth(sid, 0, 1, 130),
    helper.setColumnWidth(sid, 1, 2, 280),
    helper.setColumnWidth(sid, 2, 3, 180),
    helper.setColumnWidth(sid, 3, 4, 140),
    helper.setColumnWidth(sid, 4, 5, 200),
    helper.setColumnWidth(sid, 5, 6, 120),
    helper.setRowHeight(sid, 0, 1, 45),
    helper.formatRange(sid, 0, 1, 0, 6, SheetsHelper.headerFormat(COLORS.primary, '#FFFFFF', 12)),
    helper.formatRange(sid, 1, 500, 0, 6, SheetsHelper.cellFormat(COLORS.white, COLORS.textDark, 10)),
    helper.numberFormat(sid, 1, 500, 0, 1, 'MMM DD, YYYY'),
    helper.currencyFormat(sid, 1, 500, 3, 4),
    helper.addDropdown(sid, 1, 500, 2, 3, incomeCategories),
    helper.addConditionalFormat(sid, 1, 500, 0, 6, '=ISEVEN(ROW())', COLORS.ultraLight),
    helper.addBorders(sid, 0, 8, 0, 6, COLORS.medGray),
    helper.freezeRows(sid, 1),
  ];

  await helper.batchUpdate(requests);
}

// ─── EXPENSES TAB ───────────────────────────────────────────────────

async function buildExpensesTab(helper) {
  console.log('   💸 Building Expenses tab...');
  const sid = SHEET_IDS.expenses;

  const expenseCategories = [
    'Office Supplies', 'Software & Tools', 'Marketing & Ads', 'Travel',
    'Meals & Entertainment', 'Rent & Utilities', 'Insurance', 'Professional Services',
    'Phone & Internet', 'Bank Fees', 'Shipping & Postage', 'Payroll', 'Equipment', 'Miscellaneous',
  ];

  await helper.writeData("'💸 Expenses'!A1:G12", [
    ['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Receipt?', 'Tax Deductible'],
    ['=TODAY()-28', 'Canva Pro Annual', 'Software & Tools', 120, 'Credit Card', 'Yes', 'Yes'],
    ['=TODAY()-25', 'Google Ads campaign', 'Marketing & Ads', 250, 'Credit Card', 'Yes', 'Yes'],
    ['=TODAY()-22', 'Printer paper & ink', 'Office Supplies', 45, 'Debit Card', 'Yes', 'Yes'],
    ['=TODAY()-20', 'Client lunch meeting', 'Meals & Entertainment', 65, 'Credit Card', 'Yes', 'Partial'],
    ['=TODAY()-18', 'Zoom subscription', 'Software & Tools', 15, 'Credit Card', 'Yes', 'Yes'],
    ['=TODAY()-15', 'Office rent', 'Rent & Utilities', 800, 'Bank Transfer', 'Yes', 'Yes'],
    ['=TODAY()-12', 'Uber to client', 'Travel', 35, 'Debit Card', 'Yes', 'Yes'],
    ['=TODAY()-8', 'Etsy shipping labels', 'Shipping & Postage', 28, 'Credit Card', 'Yes', 'Yes'],
    ['=TODAY()-5', 'Accountant quarterly', 'Professional Services', 300, 'Bank Transfer', 'Yes', 'Yes'],
    ['=TODAY()-3', 'Stripe fees', 'Bank Fees', 42, 'Auto-Deduct', 'No', 'Yes'],
  ]);

  const requests = [
    helper.setTabColor(sid, COLORS.red),
    helper.setColumnWidth(sid, 0, 1, 130),
    helper.setColumnWidth(sid, 1, 2, 260),
    helper.setColumnWidth(sid, 2, 3, 200),
    helper.setColumnWidth(sid, 3, 4, 130),
    helper.setColumnWidth(sid, 4, 5, 160),
    helper.setColumnWidth(sid, 5, 6, 100),
    helper.setColumnWidth(sid, 6, 7, 140),
    helper.setRowHeight(sid, 0, 1, 45),
    helper.formatRange(sid, 0, 1, 0, 7, SheetsHelper.headerFormat(COLORS.primary, '#FFFFFF', 12)),
    helper.formatRange(sid, 1, 500, 0, 7, SheetsHelper.cellFormat(COLORS.white, COLORS.textDark, 10)),
    helper.numberFormat(sid, 1, 500, 0, 1, 'MMM DD, YYYY'),
    helper.currencyFormat(sid, 1, 500, 3, 4),
    helper.addDropdown(sid, 1, 500, 2, 3, expenseCategories),
    helper.addDropdown(sid, 1, 500, 4, 5, ['Cash', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Auto-Deduct', 'Other']),
    helper.addDropdown(sid, 1, 500, 5, 6, ['Yes', 'No']),
    helper.addDropdown(sid, 1, 500, 6, 7, ['Yes', 'No', 'Partial']),
    helper.addConditionalFormat(sid, 1, 500, 0, 7, '=ISEVEN(ROW())', COLORS.ultraLight),
    helper.addBorders(sid, 0, 11, 0, 7, COLORS.medGray),
    helper.freezeRows(sid, 1),
  ];

  await helper.batchUpdate(requests);
}

// ─── P&L DASHBOARD ──────────────────────────────────────────────────

async function buildDashboardTab(helper) {
  console.log('   📊 Building P&L Dashboard...');
  const sid = SHEET_IDS.dashboard;

  await helper.writeData("'📊 P&L Dashboard'!A1:H25", [
    ['📊 PROFIT & LOSS DASHBOARD', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    // Summary cards
    ['TOTAL REVENUE', '', 'TOTAL EXPENSES', '', 'NET PROFIT', '', 'PROFIT MARGIN', ''],
    [`=SUM('💵 Income'!D2:D1000)`, '',
     `=SUM('💸 Expenses'!D2:D1000)`, '',
     `=A4-C4`, '',
     `=IF(A4>0,(A4-C4)/A4,0)`, ''],
    ['', '', '', '', '', '', '', ''],
    // Monthly breakdown
    ['MONTH', 'INCOME', 'EXPENSES', 'NET', 'MARGIN', 'TAX DEDUCTIBLE', '', ''],
    ...Array.from({ length: 12 }, (_, i) => {
      const row = i + 7;
      const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i];
      return [
        month,
        `=SUMPRODUCT((MONTH('💵 Income'!A$2:A$1000)=${i + 1})*('💵 Income'!D$2:D$1000))`,
        `=SUMPRODUCT((MONTH('💸 Expenses'!A$2:A$1000)=${i + 1})*('💸 Expenses'!D$2:D$1000))`,
        `=B${row}-C${row}`,
        `=IF(B${row}>0,D${row}/B${row},0)`,
        `=SUMPRODUCT((MONTH('💸 Expenses'!A$2:A$1000)=${i + 1})*('💸 Expenses'!D$2:D$1000)*('💸 Expenses'!G$2:G$1000="Yes"))`,
        '', '',
      ];
    }),
    // Totals
    ['TOTAL', '=SUM(B7:B18)', '=SUM(C7:C18)', '=SUM(D7:D18)', '=IF(B19>0,D19/B19,0)', '=SUM(F7:F18)', '', ''],
    ['', '', '', '', '', '', '', ''],
    // Tax estimate
    ['ESTIMATED TAX', '', '', '', '', '', '', ''],
    [`=F19*'⚙️ Settings'!B6/100`, '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    // Expense breakdown for chart
    ['EXPENSE CATEGORY BREAKDOWN', '', '', '', '', 'REVENUE vs EXPENSES', '', ''],
  ]);

  const requests = [
    helper.setTabColor(sid, COLORS.primary),
    helper.setColumnWidth(sid, 0, 1, 180),
    helper.setColumnWidth(sid, 1, 6, 150),
    helper.setColumnWidth(sid, 6, 8, 120),
    // Title
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
    // Summary labels
    helper.setRowHeight(sid, 2, 3, 30),
    ...[0, 2, 4, 6].map(col => helper.mergeCells(sid, 2, 3, col, col + 2)),
    helper.formatRange(sid, 2, 3, 0, 8, SheetsHelper.headerFormat(COLORS.secondary, '#FFFFFF', 10)),
    // Summary values
    helper.setRowHeight(sid, 3, 4, 50),
    ...[0, 2, 4, 6].map(col => helper.mergeCells(sid, 3, 4, col, col + 2)),
    helper.formatRange(sid, 3, 4, 0, 6, {
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
    helper.currencyFormat(sid, 3, 4, 0, 1),
    helper.currencyFormat(sid, 3, 4, 2, 3),
    helper.currencyFormat(sid, 3, 4, 4, 5),
    helper.percentFormat(sid, 3, 4, 6, 7),
    // Conditional: green for profit, red for loss
    helper.addConditionalFormat(sid, 3, 4, 4, 5, '=$E4>=0', '#D4EDDA'),
    helper.addConditionalFormat(sid, 3, 4, 4, 5, '=$E4<0', '#F8D7DA'),
    // Monthly breakdown header
    helper.setRowHeight(sid, 5, 6, 40),
    helper.formatRange(sid, 5, 6, 0, 6, SheetsHelper.headerFormat(COLORS.primary, '#FFFFFF', 11)),
    // Monthly data
    helper.formatRange(sid, 6, 18, 0, 6, SheetsHelper.cellFormat(COLORS.white, COLORS.textDark, 10)),
    // Alternating rows
    ...Array.from({ length: 6 }, (_, i) =>
      helper.formatRange(sid, 6 + i * 2, 7 + i * 2, 0, 6, SheetsHelper.cellFormat(COLORS.ultraLight, COLORS.textDark, 10))
    ),
    // Totals row
    helper.formatRange(sid, 18, 19, 0, 6, SheetsHelper.headerFormat(COLORS.primary, '#FFFFFF', 11)),
    // Currency for monthly
    helper.currencyFormat(sid, 6, 19, 1, 4),
    helper.currencyFormat(sid, 6, 19, 5, 6),
    helper.percentFormat(sid, 6, 19, 4, 5),
    // Tax section
    helper.formatRange(sid, 20, 21, 0, 2, SheetsHelper.headerFormat(COLORS.secondary, '#FFFFFF', 12)),
    helper.mergeCells(sid, 20, 21, 0, 2),
    helper.formatRange(sid, 21, 22, 0, 1, {
      backgroundColor: SheetsHelper.hexToColor('#FFF3CD'),
      textFormat: {
        foregroundColor: SheetsHelper.hexToColor(COLORS.red),
        fontSize: 16,
        bold: true,
        fontFamily: 'Montserrat',
      },
      horizontalAlignment: 'CENTER',
    }),
    helper.currencyFormat(sid, 21, 22, 0, 1),
    // Chart section header
    helper.formatRange(sid, 23, 24, 0, 8, SheetsHelper.headerFormat(COLORS.secondary, '#FFFFFF', 11)),
    helper.mergeCells(sid, 23, 24, 0, 4),
    helper.mergeCells(sid, 23, 24, 5, 8),
    // Bar chart — Revenue vs Expenses by month
    helper.addBarChart(
      sid, 'Revenue vs Expenses by Month',
      sid,
      { startRowIndex: 5, endRowIndex: 19, startColumnIndex: 0, endColumnIndex: 1 },
      [
        { source: { startRowIndex: 5, endRowIndex: 19, startColumnIndex: 1, endColumnIndex: 2 }, color: COLORS.green },
        { source: { startRowIndex: 5, endRowIndex: 19, startColumnIndex: 2, endColumnIndex: 3 }, color: COLORS.red },
      ],
      24, 0, 550, 350
    ),
    // Borders
    helper.addBorders(sid, 5, 19, 0, 6, COLORS.medGray),
    helper.freezeRows(sid, 2),
  ];

  await helper.batchUpdate(requests);
}

// ─── Run ────────────────────────────────────────────────────────────

buildBookkeeping().catch((err) => {
  console.error('❌ Build failed:', err.message);
  if (err.errors) console.error(JSON.stringify(err.errors, null, 2));
  process.exit(1);
});
