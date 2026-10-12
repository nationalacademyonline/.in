# Google Sheets Integration for General Enquiry, Careers & Collaboration Form

This guide enables you to connect the **General Purpose Enquiry, Career Application & Collaboration Form** (`general_form.html`) directly to your own private Google Sheet using a serverless Google Apps Script Web App.

---

## What This Integration Provides:
* **Private Spreadsheet**: Every career application, institutional collaboration offer, vendor pitch, alumni request, or public enquiry is automatically logged in real-time.
* **Auto Ticket ID**: Generates a clean tracking ID (e.g., `GEN-2026-0001`) for every submission.
* **Smart Contextual Capture**: Stores specialized fields (Teacher role, qualification, resume link, company name, collaboration domain) cleanly without clutter.
* **Administrative Status Tracking**: Built-in columns for `Status` (`New Enquiry`, `Under Review`, `Interview Scheduled`, `Partner Contacted`, `Archived`) and `Admin Notes`.
* **Security & Spam Filtering**: Built-in honeypot bot trap and verification token (`NA_SARAN_GENERAL_2026_SECURE_TOKEN`).
* **Duplicate Debounce**: 30-second filter to prevent accidental rapid double-click submissions.

---

## Step 1: Create a Google Sheet
1. Open a new spreadsheet at [Google Sheets](https://sheets.new).
2. Rename the spreadsheet: `National Academy - General Enquiries & Careers 2026`.
3. In **Row 1**, the script will automatically create and style the midnight navy headers upon the very first submission. If you wish to type them manually, use:
   * **Col A**: `Timestamp`
   * **Col B**: `Ticket ID`
   * **Col C**: `Full Name`
   * **Col D**: `Category`
   * **Col E**: `Contact Phone`
   * **Col F**: `Email Address`
   * **Col G**: `City / Location`
   * **Col H**: `Subject`
   * **Col I**: `Message / Proposal Details`
   * **Col J**: `Career Role`
   * **Col K**: `Career Qualification`
   * **Col L**: `Career Experience`
   * **Col M**: `Resume / Portfolio Link`
   * **Col N**: `Organization / Company Name`
   * **Col O**: `Sub-Category / Specific Focus`
   * **Col P**: `Status`
   * **Col Q**: `Admin Notes / Follow-Up`

---

## Step 2: Add Google Apps Script Code
1. In your Google Sheet, click **Extensions** > **Apps Script**.
2. Rename the project at the top to: `National Academy General Enquiry Backend`.
3. Delete any default code in the editor and paste the complete script below:

```javascript
/**
 * ============================================================================
 * NATIONAL ACADEMY, SARAN - GENERAL ENQUIRY & CAREERS BACKEND (Google Apps Script)
 * ============================================================================
 * Features:
 *  - Client & Auto Ticket ID Synchronization (e.g. GEN-2026-4821)
 *  - Auto-generated Midnight Navy Header row (#050a30)
 *  - Multi-intent contextual capture: Careers, Collabs, Vendors, Alumni, Inquiries
 *  - Security Layer: Auth Token verification & Bot Honeypot protection
 *  - Rapid Double-Click Debounce (30-second filter)
 *  - Administrative workflow columns: Status & Resolution Notes
 *  - Thread-safe spreadsheet locking with LockService
 *  - Resilient payload parser (handles URL-encoded, POST parameters, and JSON)
 * ============================================================================
 */

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "active",
      service: "National Academy General Enquiry & Careers Webhook",
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

    // ------------------------------------------------------------------------
    // ROBUST PAYLOAD PARSER (Handles URL-encoded, parameter object, and JSON)
    // ------------------------------------------------------------------------
    var p = (e && e.parameter) ? e.parameter : {};
    if ((!p || Object.keys(p).length === 0) && e && e.postData && e.postData.contents) {
      try {
        p = JSON.parse(e.postData.contents);
      } catch (err) {
        p = {};
        var qs = e.postData.contents.split('&');
        for (var i = 0; i < qs.length; i++) {
          var pair = qs[i].split('=');
          if (pair[0]) {
            p[decodeURIComponent(pair[0].replace(/\+/g, ' '))] = decodeURIComponent((pair[1] || '').replace(/\+/g, ' '));
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // SECURITY LAYER 1: Secret Auth Token Verification
    // ------------------------------------------------------------------------
    var ALLOWED_TOKENS = ["NA_SARAN_GENERAL_2026_SECURE_TOKEN", "NA_GENERAL_2026_SECURE_TOKEN"];
    if (p.auth_token && ALLOWED_TOKENS.indexOf(p.auth_token) === -1) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", error: "Unauthorized access: invalid token" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ------------------------------------------------------------------------
    // SECURITY LAYER 2: Bot Honeypot Trap
    // ------------------------------------------------------------------------
    if ((p.hp_website && String(p.hp_website).trim() !== "") || (p.bot_trap && String(p.bot_trap).trim() !== "")) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "success", note: "bot_filtered" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ------------------------------------------------------------------------
    // EXTRACT & SANITIZE FIELDS
    // ------------------------------------------------------------------------
    var fullName       = (p.full_name || "").trim();
    var phone          = (p.phone || "").trim().replace(/\D/g, "");
    var email          = (p.email || "").trim();
    var cityLocation   = (p.city_location || "").trim();
    var category       = (p.category || "General Inquiry").trim();
    var subject        = (p.subject || "").trim();
    var message        = (p.message || "").trim();

    // Contextual fields: Careers
    var careerRole     = (p.career_role || "").trim();
    var careerQual     = (p.career_qualification || "").trim();
    var careerExp      = (p.career_experience || "").trim();
    var careerResume   = (p.career_resume_link || "").trim();

    // Contextual fields: Organization / Company / Alumni Student
    var collabOrg      = (p.collab_org_name || p.vendor_company_name || (p.alumni_student_name ? "Alumni: " + p.alumni_student_name : "")).trim();
    if (p.collab_org_type && collabOrg) {
      collabOrg += " [" + p.collab_org_type + "]";
    }

    // Contextual fields: Sub-Focus / Domain / Specific Request details
    var alumniDetails  = p.alumni_doc_type ? p.alumni_doc_type + (p.alumni_last_class || p.alumni_year ? " (" + [p.alumni_last_class ? "Class: " + p.alumni_last_class : "", p.alumni_year ? "Year: " + p.alumni_year : ""].filter(Boolean).join(", ") + ")" : "") : "";
    var collabDetails  = p.collab_type ? p.collab_type + (p.collab_timeline ? " [Timeline: " + p.collab_timeline + "]" : "") : "";
    var collabFocus    = (collabDetails || p.vendor_domain || alumniDetails || p.general_focus || "").trim();

    if (!fullName || fullName.length < 2) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", error: "Full name is required (at least 2 characters)." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (!message || message.length < 10) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", error: "Detailed message is required (at least 10 characters)." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ------------------------------------------------------------------------
    // AUTO-CREATE HEADERS IF EMPTY
    // ------------------------------------------------------------------------
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Ticket ID",
        "Full Name",
        "Category",
        "Contact Phone",
        "Email Address",
        "City / Location",
        "Subject",
        "Message / Proposal Details",
        "Career Role",
        "Career Qualification",
        "Career Experience",
        "Resume / Portfolio Link",
        "Organization / Company Name",
        "Sub-Category / Specific Focus",
        "Status",
        "Admin Notes / Follow-Up"
      ]);
      sheet.getRange(1, 1, 1, 17)
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
      var lastLoggedMsg  = String(sheet.getRange(lastRow, 9).getValue() || "").trim();
      var lastTimeVal    = sheet.getRange(lastRow, 1).getValue();
      var lastTimeMillis = parseTimestampMillis(lastTimeVal);

      if (lastLoggedName === fullName && lastLoggedMsg === message) {
        if (lastTimeMillis > 0 && (nowMillis - lastTimeMillis) < 30000) {
          return ContentService
            .createTextOutput(JSON.stringify({
              result: "success",
              note: "rapid_double_click_suppressed",
              message: "Your inquiry was already received moments ago. Thank you!"
            }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // ------------------------------------------------------------------------
    // TICKET ID (Sync client ticket ID or generate sequential ID)
    // ------------------------------------------------------------------------
    var entryNumber = Math.max(1, lastRow);
    var formattedNumber = ("0000" + entryNumber).slice(-4);
    var currentYear = new Date().getFullYear();
    var fallbackTicketId = "GEN-" + currentYear + "-" + formattedNumber;
    var ticketId = (p.ticket_id && String(p.ticket_id).trim()) || fallbackTicketId;

    // ------------------------------------------------------------------------
    // APPEND ROW TO SPREADSHEET
    // ------------------------------------------------------------------------
    var timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a");
    var initialStatus = "New Enquiry";

    sheet.appendRow([
      timestamp,
      ticketId,
      fullName,
      category,
      phone,
      email,
      cityLocation,
      subject,
      message,
      careerRole,
      careerQual,
      careerExp,
      careerResume,
      collabOrg,
      collabFocus,
      initialStatus,
      "" // Admin notes initial blank
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        result: "success",
        ticket_id: ticketId,
        full_name: fullName,
        category: category,
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

### Deploying for the First Time:
1. In the Apps Script editor, click **Save** (`Ctrl + S`).
2. Click the blue **Deploy** button (top right) > **New deployment**.
3. Click the gear icon next to "Select type" and choose **Web app**.
4. Set the deployment options:
   * **Description**: `National Academy General Enquiry & Careers Webhook`
   * **Execute as**: `Me`
   * **Who has access**: **`Anyone`** *(Crucial so visitors, job seekers, and partners can submit without needing a Google login)*
5. Click **Deploy**.
6. Click **Authorize access**, select your Google account, click *Advanced* > *Go to National Academy General Enquiry Backend (unsafe)*, and click **Allow**.
7. Copy the generated **Web App URL** (ends with `/exec`).

### If Updating an Existing Deployment (Keeps the same URL):
1. In the Apps Script editor, click **Save** (`Ctrl + S`).
2. At the top right, click **Deploy** > **Manage deployments**.
3. In the left panel, select your **Active** Web app.
4. Click the **Pencil icon (Edit)** at the top right of the modal.
5. In the **Version** dropdown, select **New version**.
6. Click **Deploy**.
> **Important:** Creating a "New version" ensures your current URL immediately runs the updated code without generating a new link.

---

## Step 4: Paste URL into `general_form.html`
1. Open [`general_form.html`](file:///c:/Users/ABID/Documents/GitHub%20Website%20(.in)/form/general_form.html).
2. Near line 642, find the endpoint configuration:
   ```javascript
   const GOOGLE_SCRIPT_WEBAPP_URL = '';
   ```
3. Paste your Web App URL inside the quotes:
   ```javascript
   const GOOGLE_SCRIPT_WEBAPP_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```
4. Save the file (`Ctrl + S`). Every submission from the website will now record in real-time into your spreadsheet!

---

## Administrative Status Workflow in Google Sheets
In **Column P (Status)**, you can set up a dropdown using Google Sheets Data Validation:
* `New Enquiry` (Yellow)
* `Under Review` (Blue)
* `Interview Scheduled` (Purple)
* `Partner Contacted` (Teal)
* `Resolved / Archived` (Green)
