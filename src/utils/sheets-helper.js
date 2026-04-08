import { google } from 'googleapis';

/**
 * Core Google Sheets helper — handles creation, formatting, data population, and charts.
 */
export class SheetsHelper {
  constructor(authClient) {
    this.sheets = google.sheets({ version: 'v4', auth: authClient });
    this.drive = google.drive({ version: 'v3', auth: authClient });
    this.spreadsheetId = null;
  }

  // ─── Sheet Creation ───────────────────────────────────────────────

  async createSpreadsheet(title, sheetNames = ['Sheet1']) {
    const sheets = sheetNames.map((name, i) => ({
      properties: {
        title: name,
        sheetId: i,
        index: i,
        gridProperties: { rowCount: 1000, columnCount: 26 },
      },
    }));

    const res = await this.sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
        sheets,
      },
    });

    this.spreadsheetId = res.data.spreadsheetId;
    console.log(`\n📊 Created spreadsheet: "${title}"`);
    console.log(`   ID: ${this.spreadsheetId}`);
    console.log(`   URL: https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit`);

    return res.data;
  }

  // ─── Data Writing ─────────────────────────────────────────────────

  async writeData(range, values) {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
  }

  async appendData(range, values) {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });
  }

  // ─── Batch Updates (formatting, merges, charts, etc.) ─────────────

  async batchUpdate(requests) {
    if (!requests.length) return;
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: { requests },
    });
  }

  // ─── Formatting Helpers ───────────────────────────────────────────

  static hexToColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { red: r, green: g, blue: b };
  }

  static headerFormat(bgHex, textHex = '#FFFFFF', fontSize = 11, bold = true) {
    return {
      backgroundColor: SheetsHelper.hexToColor(bgHex),
      textFormat: {
        foregroundColor: SheetsHelper.hexToColor(textHex),
        fontSize,
        bold,
        fontFamily: 'Montserrat',
      },
      horizontalAlignment: 'CENTER',
      verticalAlignment: 'MIDDLE',
    };
  }

  static cellFormat(bgHex = '#FFFFFF', textHex = '#333333', fontSize = 10, bold = false) {
    return {
      backgroundColor: SheetsHelper.hexToColor(bgHex),
      textFormat: {
        foregroundColor: SheetsHelper.hexToColor(textHex),
        fontSize,
        bold,
        fontFamily: 'Inter',
      },
      verticalAlignment: 'MIDDLE',
    };
  }

  formatRange(sheetId, startRow, endRow, startCol, endCol, format) {
    return {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: startRow,
          endRowIndex: endRow,
          startColumnIndex: startCol,
          endColumnIndex: endCol,
        },
        cell: { userEnteredFormat: format },
        fields: 'userEnteredFormat',
      },
    };
  }

  mergeCells(sheetId, startRow, endRow, startCol, endCol, mergeType = 'MERGE_ALL') {
    return {
      mergeCells: {
        range: {
          sheetId,
          startRowIndex: startRow,
          endRowIndex: endRow,
          startColumnIndex: startCol,
          endColumnIndex: endCol,
        },
        mergeType,
      },
    };
  }

  setColumnWidth(sheetId, startCol, endCol, width) {
    return {
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: 'COLUMNS',
          startIndex: startCol,
          endIndex: endCol,
        },
        properties: { pixelSize: width },
        fields: 'pixelSize',
      },
    };
  }

  setRowHeight(sheetId, startRow, endRow, height) {
    return {
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: startRow,
          endIndex: endRow,
        },
        properties: { pixelSize: height },
        fields: 'pixelSize',
      },
    };
  }

  // ─── Borders ──────────────────────────────────────────────────────

  addBorders(sheetId, startRow, endRow, startCol, endCol, colorHex = '#CCCCCC', style = 'SOLID') {
    const borderStyle = {
      style,
      color: SheetsHelper.hexToColor(colorHex),
    };
    return {
      updateBorders: {
        range: {
          sheetId,
          startRowIndex: startRow,
          endRowIndex: endRow,
          startColumnIndex: startCol,
          endColumnIndex: endCol,
        },
        top: borderStyle,
        bottom: borderStyle,
        left: borderStyle,
        right: borderStyle,
        innerHorizontal: borderStyle,
        innerVertical: borderStyle,
      },
    };
  }

  // ─── Data Validation ──────────────────────────────────────────────

  addDropdown(sheetId, startRow, endRow, startCol, endCol, values) {
    return {
      setDataValidation: {
        range: {
          sheetId,
          startRowIndex: startRow,
          endRowIndex: endRow,
          startColumnIndex: startCol,
          endColumnIndex: endCol,
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: values.map((v) => ({ userEnteredValue: v })),
          },
          showCustomUi: true,
          strict: true,
        },
      },
    };
  }

  // ─── Conditional Formatting ───────────────────────────────────────

  addConditionalFormat(sheetId, startRow, endRow, startCol, endCol, formula, bgHex) {
    return {
      addConditionalFormatRule: {
        rule: {
          ranges: [{
            sheetId,
            startRowIndex: startRow,
            endRowIndex: endRow,
            startColumnIndex: startCol,
            endColumnIndex: endCol,
          }],
          booleanRule: {
            condition: {
              type: 'CUSTOM_FORMULA',
              values: [{ userEnteredValue: formula }],
            },
            format: {
              backgroundColor: SheetsHelper.hexToColor(bgHex),
            },
          },
        },
        index: 0,
      },
    };
  }

  // ─── Number Formatting ────────────────────────────────────────────

  numberFormat(sheetId, startRow, endRow, startCol, endCol, pattern) {
    return {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: startRow,
          endRowIndex: endRow,
          startColumnIndex: startCol,
          endColumnIndex: endCol,
        },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: 'NUMBER', pattern },
          },
        },
        fields: 'userEnteredFormat.numberFormat',
      },
    };
  }

  currencyFormat(sheetId, startRow, endRow, startCol, endCol, symbol = '$') {
    return this.numberFormat(sheetId, startRow, endRow, startCol, endCol, `${symbol}#,##0.00`);
  }

  percentFormat(sheetId, startRow, endRow, startCol, endCol) {
    return this.numberFormat(sheetId, startRow, endRow, startCol, endCol, '0.0%');
  }

  // ─── Charts ───────────────────────────────────────────────────────

  addPieChart(sheetId, title, dataSheetId, labelRange, dataRange, anchorRow, anchorCol, width = 600, height = 400) {
    return {
      addChart: {
        chart: {
          spec: {
            title,
            pieChart: {
              legendPosition: 'RIGHT_LEGEND',
              domain: {
                sourceRange: {
                  sources: [{
                    sheetId: dataSheetId,
                    ...labelRange,
                  }],
                },
              },
              series: {
                sourceRange: {
                  sources: [{
                    sheetId: dataSheetId,
                    ...dataRange,
                  }],
                },
              },
              pieHole: 0.4, // donut chart
            },
            fontName: 'Montserrat',
          },
          position: {
            overlayPosition: {
              anchorCell: {
                sheetId,
                rowIndex: anchorRow,
                columnIndex: anchorCol,
              },
              widthPixels: width,
              heightPixels: height,
            },
          },
        },
      },
    };
  }

  addBarChart(sheetId, title, dataSheetId, domainRange, seriesRanges, anchorRow, anchorCol, width = 600, height = 400, stacked = false) {
    return {
      addChart: {
        chart: {
          spec: {
            title,
            basicChart: {
              chartType: 'COLUMN',
              legendPosition: 'BOTTOM_LEGEND',
              stackedType: stacked ? 'STACKED' : 'NOT_STACKED',
              domains: [{
                domain: {
                  sourceRange: {
                    sources: [{
                      sheetId: dataSheetId,
                      ...domainRange,
                    }],
                  },
                },
              }],
              series: seriesRanges.map((range) => ({
                series: {
                  sourceRange: {
                    sources: [{
                      sheetId: dataSheetId,
                      ...range.source,
                    }],
                  },
                },
                targetAxis: 'LEFT_AXIS',
                color: range.color ? SheetsHelper.hexToColor(range.color) : undefined,
              })),
              headerCount: 1,
            },
            fontName: 'Montserrat',
          },
          position: {
            overlayPosition: {
              anchorCell: {
                sheetId,
                rowIndex: anchorRow,
                columnIndex: anchorCol,
              },
              widthPixels: width,
              heightPixels: height,
            },
          },
        },
      },
    };
  }

  // ─── Sheet Protection ─────────────────────────────────────────────

  protectRange(sheetId, startRow, endRow, startCol, endCol, description = 'Protected') {
    return {
      addProtectedRange: {
        protectedRange: {
          range: {
            sheetId,
            startRowIndex: startRow,
            endRowIndex: endRow,
            startColumnIndex: startCol,
            endColumnIndex: endCol,
          },
          description,
          warningOnly: true,
        },
      },
    };
  }

  // ─── Freeze Rows/Cols ─────────────────────────────────────────────

  freezeRows(sheetId, count) {
    return {
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: { frozenRowCount: count },
        },
        fields: 'gridProperties.frozenRowCount',
      },
    };
  }

  freezeColumns(sheetId, count) {
    return {
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: { frozenColumnCount: count },
        },
        fields: 'gridProperties.frozenColumnCount',
      },
    };
  }

  // ─── Tab Color ────────────────────────────────────────────────────

  setTabColor(sheetId, hex) {
    return {
      updateSheetProperties: {
        properties: {
          sheetId,
          tabColor: SheetsHelper.hexToColor(hex),
        },
        fields: 'tabColor',
      },
    };
  }

  // ─── Sharing ──────────────────────────────────────────────────────

  async shareWithUser(email) {
    await this.drive.permissions.create({
      fileId: this.spreadsheetId,
      requestBody: {
        role: 'writer',
        type: 'user',
        emailAddress: email,
      },
      sendNotificationEmail: false,
    });
    console.log(`📧 Shared with ${email} (editor access)`);
  }

  async setViewerAccess() {
    await this.drive.permissions.create({
      fileId: this.spreadsheetId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    console.log('🔗 Sharing set to "Anyone with the link can view"');
    console.log(`   Copy link: https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/copy`);
  }
}
