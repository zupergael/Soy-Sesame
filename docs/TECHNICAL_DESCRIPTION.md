# Technical description

## Architecture and source files

The application is a static single-page interface built with native HTML, CSS, and JavaScript. It has no framework, package dependencies, HTTP API, database server, or build pipeline.

| File | Responsibility |
| --- | --- |
| `index.html` | Four form screens, navigation, labels, input constraints, report preview containers, artwork, and initial theme selection |
| `styles.css` | Layout, responsive presentation, light/dark colors, focus styling, and print presentation |
| `app.js` | Validation, browser storage, table availability, profile editing, searching, reporting, and navigation |
| `assets/soy-sesame-logo.png` | Bundled brand logo |
| `assets/p-campa-tables.png` | Supplied Padre Campa table layout |
| `assets/sh-loyola-tables.png` | Supplied S.H. Loyola table layout |

The script loads with `defer` so the document controls exist before event handlers are attached. Navigation changes the URL hash to `reservation`, `accounts`, `search`, or `reports`. `showPage()` hides other sections, updates `aria-current`, and refreshes relevant content. Unrecognized hashes fall back to the reservation screen.

## State and persistence

The in-memory `state` object contains `reservations` and `accounts` arrays. `persist()` serializes the complete object under the localStorage key `soy-sesame-forms-v1`. Initialization accepts stored data when both properties are arrays; it does not deeply validate every record. Unreadable storage produces a session-only warning.

The theme is stored separately under `soy-sesame-theme`. A `storage` event handler reloads valid array containers from other tabs on the same origin and refreshes the views. This synchronization is best effort: it is not an atomic transaction or a guarantee against simultaneous bookings or lost updates. Storage removals are not applied to the in-memory state by that handler.

### Reservation record

| Property | Meaning |
| --- | --- |
| `id` | `SS-` plus the first eight characters of a generated UUID, uppercased |
| `branch`, `date`, `table` | Selected branch, `YYYY-MM-DD` reservation date, and table identifier |
| `guests` | Numeric guest count |
| `name`, `email`, `phone` | Guest contact details |
| `notes` | Trimmed special requests |
| `marketing` | Boolean checkbox value |
| `createdAt`, `expiresAt` | Epoch timestamps in milliseconds; expiry is 15 minutes after creation |

The payment acknowledgment checkbox is validated but not saved. Status is derived by `bookingStatus()` from `expiresAt` and the current device clock. There is no persisted confirmation, paid status, payment reference, time slot, or cancellation field.

### Staff profile record

Each profile contains `id`, `first`, `last`, `email`, `role`, `branch`, and `status`. New profiles receive a UUID. The hidden `accountId` control preserves identity during edits. Password and confirmation values are excluded from the saved object. Roles and statuses are descriptive data and do not enforce permissions.

### Report state

The separate `report` variable stores filters, result rows, and a Manila-formatted generation timestamp. It exists only in memory. Reservation rows copy the derived status at generation time, so exports represent that preview rather than continuously recalculating expiry. Input changes and newly saved reservations invalidate the report.

## Validation and form behavior

All four forms use `novalidate` to let JavaScript present inline feedback while still checking the browser's constraint validation API. `validate()` clears previous errors, trims text/email/telephone controls, runs custom rules, and inspects each control's validity. Invalid controls receive `aria-invalid` and an error linked through `aria-describedby`; the first invalid control receives focus.

Custom reservation checks verify that a table belongs to the chosen branch, has enough capacity, and has no unexpired hold for the same branch/date/table. The check runs again on submission. Holds apply to the entire selected date because there are no time slots.

`dateString()` derives a calendar date using `Asia/Manila`. Reservation date limits are refreshed during table updates and submission. Staff validation checks case-insensitive email uniqueness, password confirmation and minimum length, and role/branch compatibility. Search and report validation reject reversed date ranges.

### Configured reservable tables

| Branch | Tables and capacities |
| --- | --- |
| Padre Campa | A2: 6, A3: 6, B2: 6, B3: 4, C1: 5, C2: 5, D1: 4, D2: 4, D3: 4 |
| S.H. Loyola | A1: 6, A2: 6, A3: 4, A4: 4, A5: 4, B1: 4, B2: 4, B3: 4, C1: 5, C2: 5 |

These values are defined in `BRANCH_TABLES`. The floor-plan asset paths are mapped separately in `BRANCH_LAYOUTS`. S tables are omitted. The form allows up to eight guests but no configured table seats more than six.

## Search and export processing

`filteredReservations()` combines optional filters with logical AND. Text filters use case-insensitive substring matching. Branch and status use exact matches; date comparisons use ISO date strings with inclusive boundaries. Sorting supports date ascending, date descending, and guest name.

`reservationTable()` renders matching records for search and reports. `escapeHTML()` escapes dynamic values inserted into HTML templates. CSV export uses a UTF-8 BOM, quoted cells, escaped double quotes, and CRLF row separators. `csvCell()` prefixes values that could be interpreted as spreadsheet formulas. CSV metadata includes report title, category, branch, period, and generation time, followed by reservation columns.

PDF export calls `window.print()` and relies on the browser's print destination and the stylesheet's print rules. There is no PDF generation library. Payment and sales categories have empty row sets because their sources are not implemented.

## Accessibility and operating limits

The interface includes a skip link, associated field labels, semantic buttons and tables, keyboard focus styling, inline validation descriptions, and a polite live status region. Hash navigation can focus the destination heading. Floor-plan links indicate that they open in another tab.

All validation and data handling happen in the browser and can be modified through developer tools. Contact data is stored as plain JSON in localStorage. There is no authentication, server validation, authorization, encrypted data store, payment processing, email delivery, audit log, backup service, or guaranteed multi-user table locking. The UI's fee and payment labels are informational only.

Use a modern browser with localStorage, `Intl.DateTimeFormat`, `crypto.randomUUID()`, Blob downloads, and the constraint validation API. A trusted local preview origin is useful where browser security restrictions affect these APIs.

Future production work would require a backend with validated persistent records, atomic booking rules, actual identity and permission enforcement, and verified payment and notification integrations. Those are proposed extensions rather than current functionality.
