# Manual testing and demonstration checklist

This is a repeatable manual checklist, not a record of completed tests. Run it in a modern browser using fictitious names and contact information. Use an isolated browser profile or site origin for a clean run; clearing site data deletes existing demonstration records.

## Start and navigation

| Action | Expected result |
| --- | --- |
| Open `index.html` through a local preview server | Reservation screen loads without installation |
| Visit all four sidebar destinations | Correct screen appears and the URL hash changes |
| Toggle the theme, then refresh | Theme preference remains when storage is available |
| Navigate by keyboard | Controls have visible focus; skip link reaches main content |
| Resize to a narrow viewport | Forms remain usable; wide results can be inspected in their table containers |

## Reservations

| Action | Expected result |
| --- | --- |
| Submit an empty form | Required-field messages appear and the first invalid control receives focus |
| Try a past date or a date beyond 21 days ahead | Submission is rejected |
| Enter zero, a fraction, or more than eight guests | Guest count is rejected |
| Choose six guests and inspect the tables | Tables with fewer than six seats are disabled |
| Choose seven or eight guests | No table has sufficient capacity |
| Select each branch | Correct floor plan and branch-specific table IDs appear; no S tables are offered |
| Enter an invalid email or phone number | Inline validation blocks submission |
| Use `09171234567` or `+639171234567` | Phone format is accepted when other fields are valid |
| Save a valid reservation with acknowledgment selected | Reference appears; form resets; search contains a Pending payment record |
| Try the same branch, date, and table again | Table is held and cannot be selected while the hold is active |
| Revisit after 15 minutes and refresh results/table choices | Record shows Expired and the table becomes available |
| Refresh after saving | Record persists when browser storage is available |

For a short presentation, explain the 15-minute expiry behavior instead of waiting for it. Do not describe expiry as verified unless you have run that check.

## Staff profiles

| Action | Expected result |
| --- | --- |
| Submit missing names/email/role/branch | Invalid controls display errors |
| Use a password shorter than 12 characters or mismatched confirmation | Save is blocked |
| Save a valid new profile | Directory shows the profile |
| Add another profile with the same email in different capitalization | Duplicate email is rejected |
| Assign Staff or Branch Manager to Both branches | Branch validation rejects the choice |
| Assign System Administrator / Owner to Both branches | Assignment is accepted |
| Edit a profile with both password fields blank | Existing record updates without adding a duplicate |
| Select Clear / cancel edit | Form returns to add mode and new-profile passwords are required again |

## Search and reports

| Action | Expected result |
| --- | --- |
| Search with a partial guest name, email, or reference | Matching records appear regardless of text capitalization |
| Combine branch, dates, status, and minimum guests | Only records satisfying every filter appear |
| Set an end date before the start date | Date-range error blocks submission |
| Change sort order and submit | Results follow the chosen date/name order |
| Reset search filters | Default date ordering and unfiltered records return |
| Generate a reservation report for saved records | Preview shows matching rows, record count, and total guests |
| Change any report control | Preview clears and export is disabled until regeneration |
| Export CSV | Download includes metadata, column headings, and matching rows |
| Select Print / Save as PDF, regenerate, then export | Browser print dialog opens for the report |
| Generate payment or sales reports | Empty-data explanation appears; no fabricated transactions are shown |

## Persistence and presentation checks

With the same preview address open in two tabs, save a record in one and inspect the other. The second tab should refresh its data through the storage event. This does not establish that concurrent reservations are safe.

If your browser can block site storage, test in an isolated profile with that setting enabled. Confirm that the page reports storage limitations and still permits session-only interaction. Restore the setting after the test.

Inspect errors with keyboard navigation and, if available, a screen reader: labels should identify controls, inline errors should be associated with them, and status changes should be announced. Inspect the downloaded CSV and PDF output separately; opening a print dialog alone does not verify the saved document.

## Suggested 2–4 minute demonstration

1. Show reservation validation, choose a branch and suitable table, then save a fictitious booking.
2. Find that booking with a partial-name search and explain the Pending payment hold.
3. Add and edit a fictitious staff profile, showing one validation rule.
4. Generate a reservation report and export CSV or demonstrate Print / Save as PDF.
5. Refresh to show persistence and briefly explain that payments, email, and sign-in are not connected.

Capture screenshots of the four screens and at least one error state. Record the browser, test date, actual results, and any failures separately when preparing submission evidence. Screenshots, the video, group commits, and a documentation PDF remain separate deliverables.
