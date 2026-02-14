# Specification

## Summary
**Goal:** Make the "Download CSV" export action easier to find on the manager Inactivity Dashboard by moving it into the page header.

**Planned changes:**
- Relocate the "Download CSV" button from the "Inactive Operators" card header to the Inactivity Dashboard page header row, aligned to the right of the title/description area.
- Preserve existing conditional visibility: show the button only when there is at least one inactive operator; hide it everywhere when there are none.
- Keep the CSV export behavior unchanged (same columns and same filename format, including days threshold and current date).

**User-visible outcome:** When there are 1+ inactive operators, managers see a right-aligned "Download CSV" button in the page header near the Inactivity Dashboard title and can download the same CSV as before; when there are 0 inactive operators, no download button is shown.
