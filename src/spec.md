# Specification

## Summary
**Goal:** Default admin authorization credentials to admin / 1234 on both the Admin Authorization form and fresh backend installs.

**Planned changes:**
- Frontend: Prefill the “Admin Login ID” field with `admin` and the “Password” field with `1234` when the Admin Authorization Required form first loads, while keeping both fields editable before submit.
- Backend: Update the default seeded admin credential on an empty credential store to use login `admin` with password `1234`.
- Backend: Ensure the admin authorization endpoint also triggers the same default seeding behavior when called first on a fresh install (without overwriting existing stored credentials).

**User-visible outcome:** When the admin authorization form appears it is pre-populated with admin/1234 (editable), and on a fresh install admin actions can be authorized using admin/1234 even if admin authorization is the first credential-related call.
