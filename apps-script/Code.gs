// Google Apps Script Web App backend for the FIFA World Cup 2026 Predict & Win contest.
// Bind this script to the target Google Sheet (Extensions > Apps Script) and deploy as a Web App.
// See DEPLOY.md for setup instructions.

var SHEET_NAME = 'Predictions';
var CONFIG_SHEET_NAME = 'Config';
var ACTUALS_SHEET_NAME = 'Actuals';

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
      case 'submit':
        return jsonOutput({ ok: true, submit: submitPrediction(sheet, body.payload || {}) });
      case 'overwrite':
        overwriteAll(sheet, body.payload || []);
        return jsonOutput({ ok: true });
      case 'readConfig':
        return jsonOutput({ ok: true, config: readKv(CONFIG_SHEET_NAME) });
      case 'writeConfig':
        writeKv(CONFIG_SHEET_NAME, body.payload || {});
        return jsonOutput({ ok: true, config: readKv(CONFIG_SHEET_NAME) });
      case 'readActuals':
        return jsonOutput({ ok: true, actuals: readKv(ACTUALS_SHEET_NAME) });
      case 'writeActuals':
        writeKv(ACTUALS_SHEET_NAME, body.payload || {});
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

// --- Atomic prediction submit -----------------------------------------------
// Registration-gate + duplicate check + ID generation + append, all performed
// in ONE web-app call so the Next.js route makes a single round-trip. A script
// lock serialises submissions, so two people submitting the same mobile/email
// at the same time cannot both pass the duplicate check (read-then-write race).
// Mirrors lib/validation.ts (dedup + ID format) and lib/config.ts (gate keys).

var PREDICTION_FIELDS = [
  'World_Cup_Winner', 'Runner_Up', 'Third_Place', 'Fair_Play_Award',
  'Golden_Ball', 'Golden_Boot', 'Most_Assists', 'Golden_Glove', 'Best_Young_Player'
];

var DEFAULT_REGISTRATION_CLOSED_MESSAGE =
  'Predictions are now closed. The submission window for FIFA World Cup 2026 has ended — thank you for your interest!';

function normMobile(value) {
  if (value === null || value === undefined || value === '') return '';
  return String(value).trim();
}

function normEmail(value) {
  if (value === null || value === undefined || value === '') return '';
  return String(value).trim().toLowerCase();
}

function submitPrediction(sheet, payload) {
  payload = payload || {};
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    // Registration gate. Fail OPEN if the Config read errors so a config
    // problem never blocks every submission (matches the previous route logic).
    try {
      var config = readKv(CONFIG_SHEET_NAME);
      var enabledRaw = config['registration_enabled'];
      var enabled = (enabledRaw === undefined || enabledRaw === '')
        ? true
        : String(enabledRaw).trim().toUpperCase() === 'TRUE';
      if (!enabled) {
        var closedMsg = String(config['registration_closed_message'] || '').trim();
        return { outcome: 'closed', message: closedMsg || DEFAULT_REGISTRATION_CLOSED_MESSAGE };
      }
    } catch (configErr) {
      // Treat an unreadable Config tab as "registration enabled".
    }

    var mobile = normMobile(payload.Mobile_Number);
    var email = normEmail(payload.Email_Address);

    // Single pass: collect existing IDs and flag duplicates. Mobile takes
    // precedence over email, matching findDuplicateField in lib/validation.ts.
    var rows = readAll(sheet);
    var existingIds = {};
    var mobileDup = false;
    var emailDup = false;
    for (var i = 0; i < rows.length; i++) {
      existingIds[rows[i].Submission_ID] = true;
      if (mobile !== '' && normMobile(rows[i].Mobile_Number) === mobile) mobileDup = true;
      if (email !== '' && normEmail(rows[i].Email_Address) === email) emailDup = true;
    }
    if (mobileDup) return { outcome: 'duplicate', field: 'mobile' };
    if (emailDup) return { outcome: 'duplicate', field: 'email' };

    var submissionId;
    do {
      submissionId = 'FWC26-' + Math.floor(10000 + Math.random() * 90000);
    } while (existingIds[submissionId]);

    var timestamp = payload.Timestamp || new Date().toISOString();
    var entry = {
      Submission_ID: submissionId,
      Timestamp: timestamp,
      Full_Name: payload.Full_Name || '',
      Mobile_Number: mobile,
      Email_Address: email,
      Total_Score: 0,
      Rank: ''
    };
    for (var j = 0; j < PREDICTION_FIELDS.length; j++) {
      entry[PREDICTION_FIELDS[j]] = payload[PREDICTION_FIELDS[j]] || '';
    }

    appendRow(sheet, entry);
    return { outcome: 'created', submissionId: submissionId, timestamp: timestamp };
  } finally {
    lock.releaseLock();
  }
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

// --- Generic key/value tabs (Config app settings + stored Actuals) ----------
// Each is a two-column sheet: header row "Key" | "Value", then one row per
// entry. Values are always read back as strings. writeKv merges a patch into
// the existing rows so callers can update one field without clobbering others.

function getKvSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  var firstRow = sheet.getRange(1, 1, 1, 2).getValues()[0];
  if (firstRow[0] !== 'Key' || firstRow[1] !== 'Value') {
    sheet.getRange(1, 1, 1, 2).setValues([['Key', 'Value']]);
  }
  return sheet;
}

function readKv(sheetName) {
  var sheet = getKvSheet(sheetName);
  var lastRow = sheet.getLastRow();
  var obj = {};
  if (lastRow < 2) return obj;
  var values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  values.forEach(function (row) {
    var key = row[0];
    if (key === '' || key === null) return;
    var value = row[1];
    if (value === null || value === undefined) value = '';
    else if (Object.prototype.toString.call(value) === '[object Date]') value = value.toISOString();
    else value = String(value);
    obj[String(key)] = value;
  });
  return obj;
}

function writeKv(sheetName, patch) {
  var sheet = getKvSheet(sheetName);
  var current = readKv(sheetName);
  Object.keys(patch || {}).forEach(function (key) {
    var value = patch[key];
    current[key] = value === undefined || value === null ? '' : String(value);
  });

  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 2).clearContent();
  }

  var keys = Object.keys(current);
  if (keys.length > 0) {
    var rows = keys.map(function (key) {
      return [key, current[key]];
    });
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
