# Central Examination Board Result Portal (Class 9 & Class 10)

An official, responsive, zero-maintenance static web portal for Secondary School Examination (Class IX & Class X) result lookup and certificate retrieval.

---

## Direct PDF URL Generation Algorithm

The system operates using a zero-backend, deterministic URL construction algorithm. When a candidate enters their Roll Number and selects their Date of Birth (DOB via HTML5 calendar picker), the portal generates the direct PDF certificate URL:

### Formula
1. **Roll Number Substring**: Extract the **last 5 digits** of the Roll Number (`last5Roll`).
2. **DOB Date & Month Substring**: Extract the first 4 digits of DOB consisting of **Day (DD)** + **Month (MM)** (`dateMonth`).
3. **Combine**: Concatenate `last5Roll` + `dateMonth` to produce the 9-digit PDF filename code.
4. **Construct Paths & Filename**:
   - **Primary Relative Path**: `Result_PDFs/{pdfCode}.pdf`
   - **Fallback Raw Storage**: `https://raw.githubusercontent.com/nationalacademyonline/.in/main/CEB/Result_PDFs/{pdfCode}.pdf`
   - **Clean Download Name**: `Result_{pdfCode}.pdf`
5. **Validation**: Pre-checks file existence via asynchronous fetch before revealing download and preview actions.

### Example (Using Dummy Details)
- **Roll Number**: `22285468` $\rightarrow$ Last 5 digits: `85468`
- **Date of Birth**: `30-12-2016` $\rightarrow$ Day: `30`, Month: `12` $\rightarrow$ `3012`
- **Generated Code**: `854683012`
- **Target File**: `Result_PDFs/854683012.pdf`
- **Clean Download**: `Result_854683012.pdf`

---

## Dummy Details Sample

- **Roll No**: `22285468`
- **DOB**: `30/12/2016` (Day `30`, Month `12` $\rightarrow$ `3012`)
- **Generated Code**: `854683012`
- **Target Certificate**: `https://raw.githubusercontent.com/nationalacademyonline/.in/main/CEB/Result_PDFs/854683012.pdf`

---

## File Structure (`CEB/`)

```text
CEB/
├── index.html       # Single-Page Result Form & Algorithm Script
├── Result_PDFs/     # Direct Marksheet Records
├── dummy details    # Sample Candidate Credentials
├── SRS.txt          # Software Requirements Specification
├── LL-SRS.txt       # Low-Level Specification
└── README.md        # Technical Documentation
```