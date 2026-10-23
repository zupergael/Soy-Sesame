# Soy & Sesame — Form Controls Prototype

Open `index.html` in a browser, or use Antigravity's local preview extension. No build or package installation is required. Edit `index.html`, `styles.css`, and `app.js` in Antigravity.

## Detailed documentation

- [User guide](docs/USER_GUIDE.md): setup, step-by-step workflows, validation rules, and troubleshooting.
- [Technical description](docs/TECHNICAL_DESCRIPTION.md): architecture, stored records, table configuration, exports, and implementation limits.
- [Manual testing checklist](docs/TESTING.md): expected behavior and a suggested demonstration sequence.

## Four assignment forms

| Form | Classification | Controls (including buttons) |
| --- | --- | --- |
| Table reservation | Major | Branch, date, guest count, table, full name, email, phone, special requests, demo acknowledgment, marketing opt-in, save, clear (12) |
| Staff account add/edit | Major | First name, last name, email, role, branch, status, password, confirm password, save, clear/cancel (10, plus hidden record ID) |
| Reservation search | Supporting | Name/email query, reference, branch, start date, end date, status, minimum guests, sort, search, reset (10) |
| Report filters and export | Supporting | Title, branch, category, start date, end date, status, sort, format, generate, export, reset (11) |

## Behavior and validation

- Reservations: required customer details, email format, Philippine mobile number format, name length, 1–8 whole-number guests, Manila-date window of today through 21 days, table capacity, and existing demo holds. Table IDs and capacities follow the supplied Padre Campa and S.H. Loyola posters. S tables cannot be reserved. The supplied posters are included in assets/. A saved reservation creates a 15-minute browser-local hold and remains pending payment; after expiry its status is derived as Expired. No payment or email is sent.
- Accounts: required fields, email format, duplicate email detection, minimum 12-character demo password and matching confirmation; single-branch assignment for Staff and Branch Manager. Editing preserves record identity. Passwords are never saved. These are profile records, not real authenticated accounts or enforced permissions.
- Search: optional combined filters, numeric limits, start/end date ordering, sorting, and reset. Results reflect browser-local reservations.
- Reports: title length, required dates, date ordering, filtered reservations, CSV download, and browser Print / Save as PDF. Payment/sales categories truthfully show empty results because those data sources are not connected. Changing filters invalidates the preview until regeneration.
- All forms: associated labels, appropriate input types, visible keyboard focus, native tab order, inline error messages linked to inputs, focus on the first invalid input, and polite status announcements.

## Data handling and limits

Records are stored under `soy-sesame-forms-v1` in this browser's localStorage. Use fictitious details for the demonstration. If storage fails, the page reports session-only saving. Different browser profiles or local server addresses have different records. There is no shared database, server validation, real access control, PayMongo integration, email delivery, or multi-user atomic table locking. Browser-local holds are for demonstrating the form interaction only.

The page uses native system fonts, a warm cream-and-burgundy light theme, and a red-and-black dark theme. The theme button saves its choice locally under soy-sesame-theme. The cocktail artwork is inline SVG; branch floor-plan posters are bundled PNG assets. No external font or image downloads are required.

## Files

```text
Soy & Sesame/
├── index.html
├── styles.css
├── app.js
├── assets/
│   ├── p-campa-tables.png
│   └── sh-loyola-tables.png
├── .gitignore
└── README.md
```

## Suggested demonstration

1. Submit each form with invalid/missing values to show inline error states.
2. Save a reservation with fictitious contact details; find it under Search & filter.
3. Add a fictitious staff profile; edit its role or status; show duplicate-email and mismatched-password errors.
4. Generate a reservation report for the selected dates. Export CSV, then select Print / Save as PDF and regenerate to export PDF.
5. Refresh the browser to show saved data persists.

The assignment's screenshots, 2–4 minute video, group Git commits, and documentation PDF are separate submission deliverables; this folder provides the implementation and source documentation.
