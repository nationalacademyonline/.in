# Centralised Examination Result Portal (Class 9 & Class 10)

An official, responsive, high-performance web portal for Secondary School Examination (Class IX & Class X) result lookup and certificate verification. Built with pure static web technologies (HTML5, Vanilla CSS3, ES Modules JavaScript), optimized for deployment on GitHub Pages.

---

## Key Features

- **Class 9 & Class 10 Secondary Examination Scope**: Specialized result structure featuring Theory (Max 80) + Internal Assessment / Practical (Max 20) = Total (100 Marks) breakdown per subject.
- **Numeric Roll Number Lookup**: Strictly enforced digits-only roll number validation (e.g. `2224865`).
- **Interactive Calendar System for DOB Selection**: HTML5 Date Picker interface formatted into standard `DD/MM/YYYY` format (e.g. `30/12/2016`).
- **Official Marksheet & Transcript Viewer**: Interactive grade card displaying subject scores, positional grades (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`, `D1`, `E`/`F`), CGPA, percentage, and qualifying division status.
- **GitHub Hosted PDF Download Links**: Direct link dispatching for pre-hosted official PDF certificates on GitHub static storage (`pdfUrl`).
- **Tamper-Evident QR Code Verification**: Pure client-side vector SVG QR code generated on each transcript containing roll number, DOB, and record hash.
- **Dark & Light Mode**: Premium glassmorphism design system with modern Google Fonts (`Outfit` & `Inter`).
- **Zero Backend Infrastructure**: Runs 100% client-side in browser memory with browser `LocalStorage` and static `data/students.json` fetching.

---

## Project Structure

```text
Result HMTL/
├── index.html                   # Main Single-Page Web Application Entry
├── README.md                    # Project Documentation & Deployment Guide
├── SRS.txt                      # Software Requirements Specification (High Level)
├── LL-SRS.txt                   # Low-Level SRS Technical Implementation Spec
├── Roll Format                  # Sample Roll & DOB Specification File
│
├── data/
│   └── students.json            # Static JSON Student Results Database
│
├── css/
│   └── styles.css               # Glassmorphism Design System & Print CSS Rules
│
└── js/
    ├── app.js                   # Application Router, Event Controller & Toast Alerts
    ├── storage.js               # LocalStorage Manager & Static JSON Fetch Engine
    ├── calculator.js            # Secondary School Positional Grade & CGPA Calculator
    ├── pdf-generator.js         # Marksheet Layout Renderer & GitHub PDF Link Dispatcher
    ├── qrcode-standalone.js     # Standalone Client-Side SVG QR Code Builder
    └── sample-data.js           # Embedded Seed Dataset (Class IX & Class X)
```

---

## Sample Examination Credentials

Test the portal locally or online using these sample secondary credentials:

| Roll Number | Date of Birth | Class Level | Candidate Name | Qualifying Status |
| :--- | :--- | :--- | :--- | :--- |
| **`2224865`** | `30/12/2016` | Class X | Aarav Sharma | Pass with Distinction (CGPA 9.50) |
| **`2224866`** | `15/08/2009` | Class X | Ananya Verma | First Division (CGPA 9.17) |
| **`2224867`** | `22/03/2010` | Class IX | Rohan Kulkarni | First Division (CGPA 7.40) |

---

## Adding / Updating Student Records

### Method A: Editing `data/students.json` (Static JSON File)
Simply open `data/students.json` in any code or text editor and add new student entries:

```json
[
  {
    "id": "STU-2024-001",
    "rollNo": "2224865",
    "dob": "30/12/2016",
    "name": "Aarav Sharma",
    "motherName": "Sunita Sharma",
    "fatherName": "Suresh Sharma",
    "classLevel": "Class X",
    "schoolName": "St. Xavier's Secondary School",
    "schoolCode": "84012",
    "centerCode": "4102",
    "session": "2023-2024",
    "issueDate": "2024-05-20",
    "pdfUrl": "https://github.com/your-username/results-repo/raw/main/pdfs/2224865.pdf",
    "subjects": [
      { "code": "184", "name": "ENGLISH LANG & LIT", "theoryMarks": 72, "internalMarks": 19, "totalMarks": 91, "maxMarks": 100, "grade": "A1", "gradePoint": 10 },
      { "code": "041", "name": "MATHEMATICS STANDARD", "theoryMarks": 75, "internalMarks": 20, "totalMarks": 95, "maxMarks": 100, "grade": "A1", "gradePoint": 10 },
      { "code": "086", "name": "SCIENCE", "theoryMarks": 70, "internalMarks": 19, "totalMarks": 89, "maxMarks": 100, "grade": "A2", "gradePoint": 9 }
    ]
  }
]
```

### Method B: Directly in `js/sample-data.js`
Modify `INITIAL_STUDENTS_DATA` inside `js/sample-data.js` to change the embedded default records.

---

## GitHub Pages Deployment Guide

1. Create a repository on GitHub (e.g. `centralised-examination-result`).
2. Push all project files to the repository `main` branch.
3. Upload your student PDF certificates into a folder in the repository (or a separate release).
4. Update the `pdfUrl` values in `data/students.json` to point to your GitHub raw file URLs:
   `https://raw.githubusercontent.com/username/repository-name/main/pdfs/2224865.pdf`
5. Navigate to Repository **Settings** -> **Pages**.
6. Under **Build and deployment**, set Source to `Deploy from a branch` and select `main` (`/ (root)`).
7. Save. Your portal will be live at `https://username.github.io/repository-name/`!
