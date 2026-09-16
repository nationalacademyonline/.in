# National Academy Saran — Official Institutional Web Portal

Official repository for **National Academy Saran** (Shahnewazpur, Taraiya, Saran, Bihar). This project provides the institutional homepage, contact and campus directory, admissions and feedback forms hub, alongside hosting the independent Central Examination Board (CEB) result portal.

---

> [!IMPORTANT]
> **Independent Portals & Unlinked Architecture**:
> - The **Central Examination Board (`CEB/`)** portal is completely autonomous, standalone, and self-contained.
> - **The CEB portal is not connected or linked to the school website, and the school website does not link to the CEB portal.**
> - Both systems maintain their own separate stylesheets, assets, icon vendors, and navigation workflows.

---

## 🏫 About National Academy Saran

- **Location**: Shahnewazpur, State Highway 73, Taraiya, Saran, Bihar – 841424
- **Website**: [www.nationalacademysaran.com](https://www.nationalacademysaran.com)
- **Email**: [support.nationalacademysaran@gmail.com](mailto:support.nationalacademysaran@gmail.com)
- **Helplines**:
  - **Accounts & Admissions**: `+91 97717 60033` (Call & WhatsApp)
  - **General Helpdesk**: `+91 87570 33600`

---

## 🎨 Brand Design System

The institutional website uses a refined three-tone palette:

| Color Role | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Midnight Navy** | `#050a30` | Institutional brand dark, headings, and luxury dark mode background |
| **Ice Slate** | `#f4f6fc` | Light mode canvas, card borders, and crisp contrast |
| **Electric Blue** | `#233dff` | Interactive buttons, badges, glows, and brand accents |

- **Typography**: Google Fonts ([Outfit](https://fonts.google.com/specimen/Outfit) & [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)).
- **Icons**: Local self-hosted Font Awesome 6 icons.

---

## 📂 Repository Structure

```text
├── index.html          # Official Contact & Campus Directory (Main portal page: campus location, office desks, interactive Google Map)
├── home/
│   └── index.html      # Institutional Homepage (Hero, About, Academics, Facilities, Life at Campus gallery)
├── contact/
│   └── index.html      # Seamless redirect forwarder to root Contact & Directory page
├── assets/             # School assets, campus gallery images, school logo
├── css/
│   └── style.css       # Unified institutional design system & responsive styling
├── vendor/             # Local self-hosted Font Awesome 6 font files & CSS
├── form/
│   └── index.html      # Admission enquiry and grievance/feedback forms hub
└── CEB/                # Standalone Central Examination Board Result Portal
    ├── assets/         # Isolated CEB emblem
    ├── css/            # Consolidated CEB stylesheets (style.css, fontawesome.min.css)
    ├── webfonts/       # Isolated Font Awesome icon fonts
    ├── Result_PDFs/    # Marksheet records archive
    ├── index.html      # Result retrieval form & deterministic algorithm
    └── README.md       # CEB portal technical documentation
```

---

## 🚀 Viewing the Pages

All pages are built using static HTML, CSS, and modern JavaScript:
- Simply double-click or open any page (`index.html`, `contact/index.html`, `form/index.html`, or `CEB/index.html`) directly in your web browser (Chrome, Edge, Safari, Firefox).
- **No Python localhost server or backend environment is required.**
