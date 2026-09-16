# Google Sheets Integration for Complaint & Feedback Form

This guide enables you to connect the **Complaint / Feedback Form** directly to your own private Google Sheet using a serverless Google Apps Script Web App.

---

## What This Integration Provides:
* **Private Spreadsheet**: Every complaint, parent suggestion, or student voice submission is saved immediately into your school's private Google Sheet.
* **Auto Ticket ID**: Generates a clean tracking ID (e.g., `CF-2026-0001`) for every submission.
* **Administrative Status Tracking**: Includes built-in columns for `Status` (`New Submission`, `Under Review`, `Resolved`) and `Action Taken / Admin Notes`.
* **Security & Spam Filtering**: Built-in honeypot bot trap and verification token.
* **Duplicate Prevention**: 30-second double-click debounce to prevent duplicate entries if a user taps submit multiple times.

---

## Step 1: Create a Google Sheet
1. Open a new spreadsheet at [Google Sheets](https://sheets.new).
2. Rename the spreadsheet: `National Academy - Complaints & Feedback 2026`.
3. In **Row 1**, enter the following column headers (or let the script auto-create them on first submission):
   * **Col A**: `Timestamp`
   * **Col B**: `Ticket ID`
   * **Col C**: `Student Name`
   * **Col D**: `Class / Grade`
   * **Col E**: `Section`
   * **Col F**: `Roll Number`
   * **Col G**: `Parent / Guardian Name`
   * **Col H**: `Contact Phone`
   * **Col I**: `Category`
   * **Col J**: `Description / Feedback Message`
   * **Col K**: `Status`
   * **Col L**: `Admin Notes / Action Taken`

---

## Step 2: Add Google Apps Script Code
1. In your Google Sheet, click **Extensions** > **Apps Script**.
2. Rename the project at the top to: `National Academy Feedback Backend`.
3. Delete any default code in the editor and paste the complete script below:

```javascript
/**
 * ============================================================================
 * NATIONAL ACADEMY, SARAN - COMPLAINT & FEEDBACK BACKEND (Google Apps Script)
 * ============================================================================
 * Features:
 *  - Automated Ticket ID generator (e.g., CF-2026-0001)
 *  - Security Layer: Auth Token verification & Bot Honeypot protection
 *  - Rapid Double-Click Debounce (30-second filter)
 *  - Administrative workflow columns: Status & Resolution Notes
 *  - Thread-safe spreadsheet locking with LockService
 * ============================================================================
 */

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "active",
      service: "National Academy Feedback & Complaint Webhook",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Robustly parses cell timestamps into milliseconds.
 * Handles native Date objects, numbers, ISO strings, and Indian locale strings (DD/MM/YYYY, HH:mm:ss am/pm).
 */
function parseTimestampMillis(val) {
  if (val instanceof Date) return val.getTime();
  if (typeof val === "number") return val;
  if (!val) return 0;
  var str = String(val).trim();
  var dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,\s*|\s+)(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?/i);
  if (dmyMatch) {
    var day = parseInt(dmyMatch[1], 10);
    var month = parseInt(dmyMatch[2], 10) - 1;
    var year = parseInt(dmyMatch[3], 10);
    var hours = parseInt(dmyMatch[4], 10);
    var minutes = parseInt(dmyMatch[5], 10);
    var seconds = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
    var ampm = dmyMatch[7] ? dmyMatch[7].toLowerCase() : null;
    if (ampm === "pm" && hours < 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;
    var utcMillis = Date.UTC(year, month, day, hours, minutes, seconds);
    return utcMillis - (5.5 * 3600 * 1000); // IST offset UTC+5:30
  }
  var parsed = Date.parse(str);
  return isNaN(parsed) ? 0 : parsed;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Acquire lock for up to 30 seconds to handle concurrent submissions safely
    lock.waitLock(30000);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: "Server busy. Please try again in a moment." }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var p = e.parameter || {};

    // ------------------------------------------------------------------------
    // SECURITY LAYER 1: Secret Auth Token Verification
    // ------------------------------------------------------------------------
    var EXPECTED_AUTH_TOKEN = "NA_SARAN_FEEDBACK_2026_SECURE_TOKEN";
    if (p.auth_token && p.auth_token !== EXPECTED_AUTH_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", error: "Unauthorized access: invalid token" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ------------------------------------------------------------------------
    // SECURITY LAYER 2: Bot Honeypot Trap
    // ------------------------------------------------------------------------
    if (p.bot_trap && String(p.bot_trap).trim() !== "") {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "success", note: "bot_filtered" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ------------------------------------------------------------------------
    // EXTRACT & VALIDATE FIELDS
    // ------------------------------------------------------------------------
    var studentName = (p.student_name || "").trim();
    var parentName  = (p.parent_name || "").trim();
    var grade       = (p.class || "").trim();
    var section     = (p.section || "").trim();
    var rollNumber  = (p.roll_number || "").trim();
    var phone       = (p.phone || "").trim();
    var category    = (p.category || "General Suggestion").trim();
    var description = (p.description || "").trim();

    if (!studentName || studentName.length < 2) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", error: "Student name is required." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (!parentName || parentName.length < 2) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", error: "Parent name is required." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (!description || description.length < 10) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", error: "Please provide a detailed description (at least 10 characters)." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ------------------------------------------------------------------------
    // AUTO-CREATE HEADERS IF EMPTY
    // ------------------------------------------------------------------------
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Ticket ID",
        "Student Name",
        "Class / Grade",
        "Section",
        "Roll Number",
        "Parent / Guardian Name",
        "Contact Phone",
        "Category",
        "Description / Feedback Message",
        "Status",
        "Admin Notes / Action Taken"
      ]);
      // Format header row (Midnight Navy & Bold White Text)
      sheet.getRange(1, 1, 1, 12)
        .setFontWeight("bold")
        .setBackground("#050a30")
        .setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

    // ------------------------------------------------------------------------
    // RAPID DOUBLE-CLICK DUPLICATE FILTER (30-second debounce)
    // ------------------------------------------------------------------------
    var lastRow = sheet.getLastRow();
    var nowMillis = new Date().getTime();

    if (lastRow > 1) {
      var lastLoggedName = String(sheet.getRange(lastRow, 3).getValue() || "").trim();
      var lastLoggedDesc = String(sheet.getRange(lastRow, 10).getValue() || "").trim();
      var lastTimeVal = sheet.getRange(lastRow, 1).getValue();
      var lastTimeMillis = parseTimestampMillis(lastTimeVal);

      if (lastLoggedName === studentName && lastLoggedDesc === description) {
        if (lastTimeMillis > 0 && (nowMillis - lastTimeMillis) < 30000) {
          return ContentService
            .createTextOutput(JSON.stringify({
              result: "success",
              note: "rapid_double_click_suppressed",
              message: "Your feedback was already received moments ago. Thank you!"
            }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // ------------------------------------------------------------------------
    // GENERATE UNIQUE TICKET ID (e.g. CF-2026-0001)
    // ------------------------------------------------------------------------
    var entryNumber = Math.max(1, lastRow);
    var formattedNumber = ("0000" + entryNumber).slice(-4);
    var currentYear = new Date().getFullYear();
    var ticketId = "CF-" + currentYear + "-" + formattedNumber;

    // ------------------------------------------------------------------------
    // APPEND ROW TO SPREADSHEET
    // ------------------------------------------------------------------------
    var timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a");
    var initialStatus = "New Submission";

    sheet.appendRow([
      timestamp,
      ticketId,
      studentName,
      grade,
      section,
      rollNumber,
      parentName,
      phone,
      category,
      description,
      initialStatus,
      "" // Admin notes initial blank
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        result: "success",
        ticket_id: ticketId,
        student: studentName,
        parent: parentName,
        class: grade + " - " + section,
        timestamp: timestamp
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}
```

---

## Step 3: Deploy Web App in Google Apps Script
1. In the Apps Script editor, click **Save** (`Ctrl + S`).
2. Click **Deploy** (blue button top right) > **New deployment**.
3. Click the gear icon next to "Select type" and choose **Web app**.
4. Set the deployment options:
   * **Description**: `National Academy Complaint & Feedback Webhook`
   * **Execute as**: `Me`
   * **Who has access**: `Anyone` *(Crucial so parents and students can submit without needing to log in)*
5. Click **Deploy**.
6. Click **Authorize access**, select your Google account, click *Advanced* > *Go to National Academy Feedback Backend (unsafe)*, and click **Allow**.
7. Copy the generated **Web App URL** (ends with `/exec`).

---

## Step 4: Paste URL into `feedback_form.html`
1. Open [`feedback_form.html`](file:///c:/Users/ABID/Documents/Hussain841424/Hussain_Web/nationalacademy/form/feedback_form.html).
2. Near the top of the `<script>` tag, find:
   ```javascript
   const GOOGLE_SCRIPT_WEBAPP_URL = 'PASTE_YOUR_DEPLOYED_WEBAPP_URL_HERE';
   ```
3. Paste your Web App URL inside the quotes.
4. Save the file. All future feedback will now flow directly into your Google Sheet!

---

## Administrative Workflow in Google Sheets
* **Status Dropdown**: You can use Google Sheet's Data Validation on **Column K** to make a dropdown:
  * `New Submission` (Yellow)
  * `Under Review` (Blue)
  * `Resolved` (Green)
* **Ticket ID Reference**: When contacting a parent regarding their feedback or inquiry, you can reference their Ticket ID (`CF-2026-XXXX`).
