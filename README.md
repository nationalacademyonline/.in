# National Academy Saran — Official Web Hub & Portals

Official web repository for **National Academy Saran** (Taraiya, Saran, Bihar). This project provides a modernized, mobile-first Contact Us & Inquiries hub and hosts the Central Examination Board Result (CEB) portal.

---

## 🏫 About National Academy Saran

- **Location**: Shahnewazpur, State Highway 73, Madsaura Road, Taraiya, Saran, Bihar – 841424 (Near Punjab National Bank)
- **Website**: [www.nationalacademysaran.com](https://www.nationalacademysaran.com)
- **Email**: [support.nationalacademysaran@gmail.com](mailto:support.nationalacademysaran@gmail.com)
- **Helplines**:
  - **Accounts Office**: `+91 97717 60033` (Call & WhatsApp)
  - **General Helpdesk**: `+91 87570 33600`

---

## 🎨 Brand Identity & Theme

The user interface is designed using an official three-tone institutional palette:

| Color Role | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Midnight Navy** | `#050a30` | Primary brand dark, headings, and luxury dark mode background |
| **Ice Slate** | `#f4f6fc` | Light mode canvas, card borders, and subtle contrast |
| **Electric Blue** | `#233dff` | Interactive buttons, badges, glows, and brand accents |

- **School Logo**: Direct 4K raw asset hosted on [Assets/School Logo 4K.png](https://raw.githubusercontent.com/nationalacademyonline/Assets/main/School%20Logo%204K.png).
- **Typography**: Google Fonts ([Outfit](https://fonts.google.com/specimen/Outfit) & [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)).

---

## 📂 Repository Structure

```text
├── index.html          # Modern, mobile-first Contact Us & Inquiries page
├── css/
│   └── style.css       # Design system, 2x2 contact grid, and responsive styles
├── CEB/                # Central Examination Board Result (Class 9 & 10) Portal
│   ├── index.html      # Scorecard search and verification portal
│   └── Result_PDFs/    # Archive & examination records
└── README.md           # Project documentation
```

---

## ✨ Features

### 1. Contact Us & Inquiries Hub (`index.html`)
- **Admission Enquiry Form (2026–2027)**: Direct access for new student enrollments via [Google Form](https://forms.gle/efnVTqDJbvzvwEXW7).
- **Complaint & Feedback Portal**: Direct student & parent voice form via [Google Form](https://forms.gle/EGjkVovPbxakk7jCA).
- **Campus Location & Live Mini Map**:
  - Embedded Google Map preview directly within the location card.
  - Expands into an interactive modal window with directions and 1-click address copy.
  - Direct link to [Google Maps Location](https://www.google.com/maps/search/?api=1&query=National+Academy,+Taraiya,+Saran,+Bihar+841424).
- **2×2 Office Desk Grid**:
  - Accounts Office (`+91 97717 60033`)
  - General Helpdesk (`+91 87570 33600`)
  - Accounts WhatsApp (`WhatsApp Chat`)
  - Support Email (`support.nationalacademysaran@gmail.com`)
- **Theme Switcher**: Instant toggle between Light (Ice Slate) and Dark (Midnight Navy) themes with `localStorage` persistence.
- **Mobile-First**: 44px+ touch targets, safe area inset support (iOS/Android), and fluid responsiveness.

### 2. Central Examination Board Result (`CEB/`)
- Secondary Board Examination portal for Class 9 and Class 10 students.
- Search by Roll Number and Date of Birth (DOB) with instant, direct official certificate retrieval.

---

## 🚀 Local Preview

Open `index.html` in any modern web browser (Chrome, Edge, Safari, Firefox). No build tools or backend dependencies are required.