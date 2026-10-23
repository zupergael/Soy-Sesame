# Soy & Sesame user guide

## Purpose and setup

Soy & Sesame is a browser-based form controls prototype for the Padre Campa and S.H. Loyola branches. It demonstrates table reservations, staff profile management, reservation searches, and report exports. It is intended for classroom demonstrations using fictitious information.

Open `index.html` in a modern browser, or open the folder through your editor's local preview server. No installation, build command, account, or backend is required. Keep the same browser profile and preview address when demonstrating saved records: browser storage belongs to the page's origin. Storage behavior when opening a file directly can vary by browser; use a local preview server if persistence is unreliable.

Use the sidebar to switch between the four screens. The theme button switches between the default dark appearance and a light appearance, and saves that preference locally.

## Make a reservation

1. Choose a branch and a reservation date from today through 21 days ahead. The application uses Manila time to determine today.
2. Enter a whole-number guest count from 1 to 8.
3. Choose an available table. The list marks tables that are already held or too small and disables those choices. Select the branch layout image to inspect the supplied floor plan in another tab.
4. Enter a full name, email address, and Philippine mobile number. Accepted phone formats are `09XXXXXXXXX` and `+639XXXXXXXXX`, without spaces or hyphens.
5. Optionally enter special requests and select the marketing checkbox. Acknowledge that saving does not confirm payment.
6. Select **Save reservation**. The status message includes an `SS-` reference, and the record becomes available in Search & filter.

The name accepts 2–80 characters, email accepts up to 120 characters, and special requests accept up to 300 characters. Errors appear beside the affected controls, and focus moves to the first invalid control.

A saved record holds its table for 15 minutes from the time of submission. Its status is **Pending payment** during that period and **Expired** afterward. Expiry does not delete the record. Refresh the table choices or search results to see current availability and status; there is no continuously updating countdown.

Although the guest field allows 1–8, the largest configured table seats 6. Parties of 7 or 8 therefore cannot select a suitable table. Combining tables is not implemented. S tables are excluded from reservations.

The displayed fee and GCash / Maya options describe the proposed business experience. The prototype collects no payment, sends no email, and cannot confirm a real booking. It does not provide cancellation or reservation editing.

## Add or edit a staff profile

Enter first and last names, a unique work email, role, branch, status, and matching demo passwords. Names accept 2–50 characters each. New profiles require a password of 12–128 characters. Passwords are checked during submission but are never stored.

Staff and Branch Manager profiles must belong to one branch. Only **System Administrator / Owner** can select **Both branches**. Duplicate emails are checked without regard to capitalization.

Saved profiles appear in the staff directory. Select **Edit**, change the details, and save to update the same record. When editing, leave both password fields blank to skip the password check. **Clear / cancel edit** returns the form to add mode. Active and Inactive are profile attributes; they do not enable or disable actual sign-in access.

## Find reservations

Use any combination of name/email text, reference text, branch, reservation date range, status, and minimum guest count. Name/email and reference searches match partial text without regard to capitalization. All supplied filters must match for a record to appear.

Date boundaries are inclusive. The end date must be on or after the start date. Sort by earliest reservation date, latest reservation date, or guest name. Select **Search reservations** to apply changes, or **Reset filters** to show records with the default sort.

## Generate and export reports

1. Enter a title of 3–80 characters.
2. Choose branch, category, date range, status, sort order, and export format. Both dates are required and refer to reservation dates.
3. Select **Generate report** to create a preview. Reservation reports show record count, total guests, and matching bookings.
4. Select **Export report** to download CSV, or open the browser print dialog for **Print / Save as PDF**. Choose a PDF destination in that dialog if available.

Changing any report control, including the export format, clears the preview and disables export until you generate again. The report captures statuses at generation time. Generate again after a hold expires to update those statuses.

Payment transactions and Sales performance intentionally produce empty reports because there are no connected payment or sales data sources. Generated reports are demonstration outputs, not official financial statements.

## Saved data and troubleshooting

Reservations and staff profiles remain in this browser's local storage after refresh when storage is available. Clearing browser site data removes them. There is no in-app delete or restore function. Separate browsers, profiles, and server addresses do not share records.

If storage is unavailable or unreadable, the page displays a warning. Records can still be used in memory, but a refresh may lose session-only changes. If a table is unavailable, check guest capacity, branch, date, and existing unexpired holds. If export is disabled, generate the report again.

See [technical details](TECHNICAL_DESCRIPTION.md) for implementation limits and [the testing checklist](TESTING.md) for a demonstration sequence.
