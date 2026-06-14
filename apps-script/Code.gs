// Google Apps Script Web App backend for the FIFA World Cup 2026 Predict & Win contest.
// Bind this script to the target Google Sheet (Extensions > Apps Script) and deploy as a Web App.
// See DEPLOY.md for setup instructions.

var SHEET_NAME = 'Predictions';

var SHEET_HEADERS = [
  'Submission_ID',
  'Timestamp',
  'Full_Name',
  'Mobile_Number',
  'Email_Address',
  'World_Cup_Winner',
  'Runner_Up',
  'Third_Place',
  'Fair_Play_Award',
  'Most_Entertaining_Team',
  'Dark_Horse',
  'Golden_Ball',
  'Golden_Boot',
  'Most_Assists',
  'Golden_Glove',
  'Best_Young_Player',
  'Total_Score',
  'Rank'
];

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOutput({ ok: false, error: 'Invalid JSON body.' });
  }

  var secret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
  if (!secret || body.secret !== secret) {
    return jsonOutput({ ok: false, error: 'Unauthorized.' });
  }

  try {
    var sheet = getSheet();

    switch (body.action) {
      case 'read':
        return jsonOutput({ ok: true, submissions: readAll(sheet) });
      case 'append':
        appendRow(sheet, body.payload || {});
        return jsonOutput({ ok: true });
      case 'overwrite':
        overwriteAll(sheet, body.payload || []);
        return jsonOutput({ ok: true });
      default:
        return jsonOutput({ ok: false, error: 'Unknown action: ' + body.action });
    }
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err) });
  }
}

// Columns that must never be auto-converted to numbers by Sheets (e.g. "+919876543210"
// would otherwise lose its leading "+" and become a number, breaking duplicate checks).
var TEXT_COLUMNS = ['Submission_ID', 'Mobile_Number'];

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  ensureHeaderRow(sheet);
  ensureTextColumnFormats(sheet);
  return sheet;
}

function ensureHeaderRow(sheet) {
  var firstRow = sheet.getRange(1, 1, 1, SHEET_HEADERS.length).getValues()[0];
  var hasHeaders = SHEET_HEADERS.every(function (header, i) {
    return firstRow[i] === header;
  });
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setValues([SHEET_HEADERS]);
  }
}

function ensureTextColumnFormats(sheet) {
  TEXT_COLUMNS.forEach(function (header) {
    var columnIndex = SHEET_HEADERS.indexOf(header) + 1;
    sheet.getRange(2, columnIndex, sheet.getMaxRows() - 1, 1).setNumberFormat('@');
  });
}

function readAll(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var numRows = lastRow - 1;
  var values = sheet.getRange(2, 1, numRows, SHEET_HEADERS.length).getValues();

  return values
    .filter(function (row) {
      return row.some(function (cell) {
        return cell !== '' && cell !== null;
      });
    })
    .map(rowToObject);
}

var NUMERIC_FIELDS = ['Total_Score', 'Rank'];

function rowToObject(row) {
  var obj = {};
  SHEET_HEADERS.forEach(function (header, i) {
    var value = row[i];
    if (header === 'Timestamp' && Object.prototype.toString.call(value) === '[object Date]') {
      value = value.toISOString();
    }
    if (value === null || value === undefined) {
      value = '';
    } else if (NUMERIC_FIELDS.indexOf(header) === -1 && typeof value === 'number') {
      // Defend against Sheets having auto-converted a text field (e.g. mobile number) to a number.
      value = String(value);
    }
    obj[header] = value;
  });
  return obj;
}

function objectToRow(obj) {
  return SHEET_HEADERS.map(function (header) {
    var value = obj[header];
    return value === undefined || value === null ? '' : value;
  });
}

function appendRow(sheet, entry) {
  sheet.appendRow(objectToRow(entry));
}

function overwriteAll(sheet, submissions) {
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, SHEET_HEADERS.length).clearContent();
  }
  if (submissions && submissions.length > 0) {
    var rows = submissions.map(objectToRow);
    sheet.getRange(2, 1, rows.length, SHEET_HEADERS.length).setValues(rows);
  }
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
