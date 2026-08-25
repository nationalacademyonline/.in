# Centralised Examination Result Portal (Class 9 & Class 10)

An official, responsive, zero-maintenance static web portal for Secondary School Examination (Class IX & Class X) result lookup and certificate retrieval.

---

## Direct PDF URL Generation Algorithm

The system operates using a zero-backend, deterministic URL construction algorithm. When a candidate enters their Roll Number and selects their Date of Birth (DOB via HTML5 calendar picker), the portal generates the direct PDF certificate URL:

### Formula
1. **Roll Number Substring**: Extract the **last 4 digits** of the Roll Number.
2. **DOB Year Substring**: Extract the **last 2 digits of the year** from the Date of Birth.
3. **Combine**: Concatenate `last4Roll` + `last2Year` to produce the 6-digit PDF filename code.
4. **Construct URL**: Append the code and `.pdf` extension to the official GitHub raw repository storage URL.

### Example
- **Roll Number**: `22287869` $\rightarrow$ Last 4 digits: `7869`
- **Date of Birth**: `12-08-2013` $\rightarrow$ Last 2 digits of Year: `13`
- **Generated Code**: `786913`
- **Final Target PDF URL**:
  `https://raw.githubusercontent.com/nationalacademyonline/.in/main/CER/Result_PDFs/786913.pdf`

---

## Dummy Details Sample

- **Roll No**: `2224865`
- **DOB**: `30/12/2016` (Year `2016` $\rightarrow$ `16`)
- **Generated Code**: `486516`
- **Target Certificate**: `https://raw.githubusercontent.com/nationalacademyonline/.in/main/CER/Result_PDFs/486516.pdf`

---

## File Structure (`CER/`)

```text
CER/
├── index.html       # Single-Page Result Form & Algorithm Script
├── css/
│   └── styles.css   # Premium Glassmorphism Design System
├── dummy details    # Sample Candidate Credentials
├── SRS.txt          # Software Requirements Specification
├── LL-SRS.txt       # Low-Level Specification
└── README.md        # Technical Documentation
```