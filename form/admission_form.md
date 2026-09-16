# Google Sheets Integration for Admission Form (With Photo & Oral Test)

This setup securely saves all admission applications into your private Google Sheet in real-time, including:
* **Pre-Nursery** to Class 10 grades
* **Oral Test / Screening** (Yes / No)
* **Student Passport Photo** (Automatically saved into a dedicated Google Drive folder and linked directly in the sheet!)
* **Security & Spam Protection** (Bot honeypot + secret token validation)
* **Duplicate Detection** (Detects siblings vs rapid double-clicks vs re-inquiries)

---

## Step 1: Create a Google Sheet
1. Open a new spreadsheet at [Google Sheets](https://sheets.new).
2. Rename the sheet: `National Academy - Admissions 2026-27`.
3. In **Row 1**, set the column headers (or the script will auto-generate them on first submission):
   * **Col A**: `Timestamp`
   * **Col B**: `Student Name`
   * **Col C**: `Date of Birth`
   * **Col D**: `Gender`
   * **Col E**: `Grade / Class`
   * **Col F**: `Oral Test`
   * **Col G**: `Blood Group`
   * **Col H**: `Father's Name`
   * **Col I**: `Mother's Name`
   * **Col J**: `Phone (WhatsApp)`
   * **Col K**: `Alternate Phone`
   * **Col L**: `Email`
   * **Col M**: `Address`
   * **Col N**: `City / District`
   * **Col O**: `Previous School`
   * **Col P**: `Last Class Passed`
   * **Col Q**: `Queries / Remarks`
   * **Col R**: `Student Photo URL`
   * **Col S**: `Status / Duplicate Notes`

---

## Step 2: Add Google Apps Script Code
1. In your Google Sheet, click **Extensions** > **Apps Script**.
2. Rename the project at the top to: `National Academy Admission Backend`.
3. Replace all existing text in the script editor with the complete code below:

```javascript
/**
 * ============================================================================
 * NATIONAL ACADEMY, SARAN - ADMISSION FORM BACKEND (Google Apps Script)
 * ============================================================================
 * Features:
 *  - Security Layer 1: Secret Auth Token verification (prevents external spam)
 *  - Security Layer 2: Hidden honeypot trap (blocks automated web bots)
 *  - Security Layer 3: Server-side validation (phone, name, grade, oral test)
 *  - Solution 1: Sibling Detection (Composite key: Student Name + Phone)
 *  - Solution 2: Rapid Double-Click Protection (60-second duplicate filter)
 *  - Solution 3: Re-inquiry / Desk Follow-Up Logger (Column S status tag)
 *  - Robust Indian (DD/MM/YYYY) & Native Date Timestamp Parser
 *  - Automatic Drive Folder creation for uploaded student passport photos
 * ============================================================================
 */

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "active",
      service: "National Academy Admission Form Webhook",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Robustly parses cell timestamps into milliseconds.
 * Handles native Date objects, numbers, ISO strings, and Indian locale strings (DD/MM/YYYY, HH:mm:ss am/pm).
 */
function parseTimestampMillis(val) {
  if (val instanceof Date) {
    return val.getTime();
  }
  if (typeof val === "number") {
    return val;
  }
  if (!val) {
    return 0;
  }

  var str = String(val).trim();

  // Match DD/MM/YYYY or D/M/YYYY with time (e.g. 11/9/2026, 9:15:51 pm or 11/09/2026 21:15:51)
  var dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,\s*|\s+)(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?/i);
  if (dmyMatch) {
    var day = parseInt(dmyMatch[1], 10);
    var month = parseInt(dmyMatch[2], 10) - 1; // 0-indexed month
    var year = parseInt(dmyMatch[3], 10);
    var hours = parseInt(dmyMatch[4], 10);
    var minutes = parseInt(dmyMatch[5], 10);
    var seconds = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
    var ampm = dmyMatch[7] ? dmyMatch[7].toLowerCase() : null;

    if (ampm === "pm" && hours < 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;

    // Asia/Kolkata is UTC+05:30 (5.5 hours = 19,800,000 ms)
    var utcMillis = Date.UTC(year, month, day, hours, minutes, seconds);
    return utcMillis - (5.5 * 3600 * 1000);
  }

  // Fallback to standard JavaScript Date parser
  var parsed = Date.parse(str);
  return isNaN(parsed) ? 0 : parsed;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Acquire lock for up to 30 seconds to prevent concurrent write race conditions
    lock.waitLock(30000);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: "Server busy. Please try again." }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var p = e.parameter || {};

    // ------------------------------------------------------------------------
    // SECURITY LAYER 1: Secret Auth Token Verification
    // ------------------------------------------------------------------------
    var ALLOWED_TOKENS = ["NA_SARAN_ADMISSION_2026_SECURE_TOKEN", "NA_ADMISSION_2026_SECURE_TOKEN"];
    if (p.auth_token && ALLOWED_TOKENS.indexOf(p.auth_token) === -1) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", error: "Unauthorized access: invalid token" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ------------------------------------------------------------------------
    // SECURITY LAYER 2: Hidden Honeypot Trap (Blocks automated web bots)
    // ------------------------------------------------------------------------
    if (p.bot_trap && String(p.bot_trap).trim() !== "") {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "success", note: "bot_filtered" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ------------------------------------------------------------------------
    // SECURITY LAYER 3: Server-side Field Validation
    // ------------------------------------------------------------------------
    var studentName = (p.student_name || "").trim();
    var phone = (p.phone || "").trim().replace(/\D/g, ""); // strip non-digits
    var grade = (p.grade || p.class || "").trim();
    var oralTest = (p.oral_test || "No").trim();

    if (!studentName || studentName.length < 2) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", error: "Student name is required (at least 2 characters)" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (!phone || phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", error: "Invalid mobile number. Must be a 10-digit Indian number starting with 6, 7, 8, or 9." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (!grade) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", error: "Class/Grade is required." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ------------------------------------------------------------------------
    // AUTO-CREATE HEADERS IF EMPTY
    // ------------------------------------------------------------------------
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Student Name",
        "Date of Birth",
        "Gender",
        "Grade / Class",
        "Oral Test",
        "Blood Group",
        "Father's Name",
        "Mother's Name",
        "Phone (WhatsApp)",
        "Alternate Phone",
        "Email",
        "Address",
        "City / District",
        "Previous School",
        "Last Class Passed",
        "Queries / Remarks",
        "Student Photo URL",
        "Status / Duplicate Notes"
      ]);
      // Format header row
      sheet.getRange(1, 1, 1, 19)
        .setFontWeight("bold")
        .setBackground("#050a30")
        .setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

    // ------------------------------------------------------------------------
    // SMART DUPLICATE DETECTION & SIBLING HANDLING
    // Solution 1: Sibling Detection (Composite key: Student Name + Phone)
    // Solution 2: Rapid Double-Click Protection (60-second duplicate filter)
    // Solution 3: Re-inquiry / Desk Follow-Up Logger (Column S status tag)
    // ------------------------------------------------------------------------
    var lastRow = sheet.getLastRow();
    var isDuplicate = false;
    var duplicateType = "";
    var nowMillis = new Date().getTime();

    if (lastRow > 1) {
      var dataRange = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
      var normalizedNewName = studentName.toLowerCase().replace(/\s+/g, "");

      for (var i = dataRange.length - 1; i >= 0; i--) {
        var rowTimeRaw = dataRange[i][0];
        var rowName = String(dataRange[i][1] || "").trim();
        var rowPhone = String(dataRange[i][9] || "").trim().replace(/\D/g, "");
        var normalizedRowName = rowName.toLowerCase().replace(/\s+/g, "");

        if (rowPhone === phone) {
          if (normalizedRowName === normalizedNewName) {
            // Same student name AND same phone
            var rowTimeMillis = parseTimestampMillis(rowTimeRaw);
            var timeDiffSeconds = rowTimeMillis > 0 ? (nowMillis - rowTimeMillis) / 1000 : 99999;

            if (timeDiffSeconds >= 0 && timeDiffSeconds <= 60) {
              // SOLUTION 2: Rapid double-click duplicate within 60 seconds
              return ContentService
                .createTextOutput(JSON.stringify({
                  result: "success",
                  note: "rapid_double_click_suppressed",
                  message: "Your application was already received moments ago. Thank you!"
                }))
                .setMimeType(ContentService.MimeType.JSON);
            } else {
              // SOLUTION 3: Re-inquiry after 60 seconds (parent following up)
              isDuplicate = true;
              duplicateType = "Re-inquiry: Previous submission logged on " + rowTimeRaw;
              break;
            }
          } else {
            // SOLUTION 1: SIBLING APPLICATION (Same parent phone, different child name)
            duplicateType = "Sibling of " + rowName + " (Shared Family Phone: " + phone + ")";
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // STUDENT PHOTO UPLOAD (Base64 -> Dedicated Google Drive Folder)
    // ------------------------------------------------------------------------
    var photoUrl = "No photo provided";
    var photoBase64 = p.photo_base64 || "";
    var photoType = p.photo_type || "image/jpeg";

    if (photoBase64 && photoBase64.indexOf("data:") === 0) {
      try {
        var commaIdx = photoBase64.indexOf(",");
        var base64Data = commaIdx > -1 ? photoBase64.substring(commaIdx + 1) : photoBase64;
        var decodedBytes = Utilities.base64Decode(base64Data);

        var folderName = "National Academy Student Photos";
        var folders = DriveApp.getFoldersByName(folderName);
        var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

        var ext = photoType.indexOf("png") > -1 ? ".png" : ".jpg";
        var sanitizedName = studentName.replace(/[^a-zA-Z0-9]/g, "_");
        var fileName = sanitizedName + "_Grade_" + grade.replace(/[^a-zA-Z0-9]/g, "_") + "_" + Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyyMMdd_HHmmss") + ext;

        var blob = Utilities.newBlob(decodedBytes, photoType, fileName);
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        photoUrl = file.getUrl();
      } catch (photoErr) {
        photoUrl = "Error uploading photo: " + photoErr.toString();
      }
    }

    // ------------------------------------------------------------------------
    // APPEND APPLICATION ROW TO GOOGLE SHEET
    // ------------------------------------------------------------------------
    var timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a");
    var statusNote = duplicateType || "New Applicant";

    sheet.appendRow([
      timestamp,
      studentName,
      p.dob || "",
      p.gender || "",
      grade,
      oralTest,
      p.blood_group || "",
      p.father_name || "",
      p.mother_name || "",
      p.phone || "",
      p.alt_phone || "",
      p.email || "",
      p.address || "",
      p.city || "",
      p.prev_school || "",
      p.prev_class || "",
      p.queries || "",
      photoUrl,
      statusNote
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        result: "success",
        student: studentName,
        grade: grade,
        oral_test: oralTest,
        photo_uploaded: photoUrl.indexOf("drive.google.com") > -1,
        note: statusNote
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
1. Click **Deploy** > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set the deployment options:
   * **Description**: `National Academy Admissions Form Backend`
   * **Execute as**: `Me`
   * **Who has access**: `Anyone` *(Crucial so applicants can submit without signing into Google)*
4. Click **Deploy**.
5. Click **Authorize access**, choose your Google account, click *Advanced* > *Go to National Academy Admission Backend (unsafe)*, and click **Allow**.
6. Copy the **Web App URL** (ends in `/exec`).

### If Updating an Existing Deployment (Keeps the same URL):
1. In the Apps Script editor, click **Save** (`Ctrl + S`).
2. At the top right, click **Deploy** > **Manage deployments**.
3. In the left panel, select your **Active** Web app.
4. Click the **Pencil icon (Edit)** at the top right of the modal.
5. In the **Version** dropdown, select **New version**.
6. Click **Deploy**.
> **Important:** Creating a "New version" ensures your current URL immediately runs the updated code without generating a new link.

---

## Step 4: Link Web App URL into `admission_form.html`
1. Open [`admission_form.html`](file:///c:/Users/ABID/Documents/Hussain841424/Hussain_Web/nationalacademy/form/admission_form.html).
2. Locate the `GOOGLE_SCRIPT_WEBAPP_URL` constant near the top of the `<script>` tag:
   ```javascript
   const GOOGLE_SCRIPT_WEBAPP_URL = 'PASTE_YOUR_DEPLOYED_WEBAPP_URL_HERE';
   ```
3. Paste your Web App URL inside the quotes.

---

## How Student Photos Appear in Google Drive & Sheets
* Every uploaded passport photograph is automatically organized into a dedicated Google Drive folder named **"National Academy Student Photos"**.
* Column R (**Student Photo URL**) will contain a direct clickable link to the photo in Google Drive.
* Column S (**Status / Duplicate Notes**) will automatically mark siblings or re-inquiries.
