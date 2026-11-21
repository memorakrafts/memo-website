/*
 * Memorakrafts enquiry receiver (Google Apps Script)
 * Paste this into Extensions > Apps Script of your Google Sheet.
 * This file is for reference only. Do not upload the Apps Script URL to GitHub.
 */

const SPREADSHEET_ID = '1iMQqnYSzdT8HXO9Hmkoo4BbzZvFQqnolYkIYGLvDZZE';
const SHEET_NAME = 'Website Enquiries';

const HEADERS = [
  'Timestamp',
  'Full Name',
  'Company',
  'Business Type',
  'City & State',
  'Email',
  'Phone',
  'Enquiry Type',
  'Number of Hampers',
  'Budget per Gift',
  'Requirements'
];

// Opening the /exec URL in a browser shows this status message.
function doGet() {
  return output({ success: true, message: 'Memorakrafts enquiry endpoint is running.' });
}

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};

    if (!clean(p.fullName) || !clean(p.phone)) {
      throw new Error('Name and phone are required.');
    }
    if (!SPREADSHEET_ID || SPREADSHEET_ID.indexOf('PASTE_') === 0) {
      throw new Error('Set SPREADSHEET_ID in Code.gs.');
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      safeCell(p.fullName),
      safeCell(p.company),
      safeCell(p.businessType),
      safeCell(p.location),
      safeCell(p.email),
      safeCell(p.phone),
      safeCell(p.eventType),
      safeCell(p.quantity),
      safeCell(p.budget),
      safeCell(p.message)
    ]);

    return output({ success: true });
  } catch (err) {
    return output({ success: false, message: String(err.message || err) });
  }
}

function clean(value) {
  return String(value || '').trim();
}

// Prevents spreadsheet formula injection (cells starting with = + - @).
function safeCell(value) {
  const s = clean(value);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function output(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
