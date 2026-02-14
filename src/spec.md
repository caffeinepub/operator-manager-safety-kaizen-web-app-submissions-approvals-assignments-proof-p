# Specification

## Summary
**Goal:** Restore a clearly visible, reliable “Log out” button on the Manager Profile and Operator Profile pages that signs the user out and returns them to `/login`.

**Planned changes:**
- Add an always-visible “Log out” button to `/manager/profile` and `/operator/profile` pages (not dependent on any header dropdown).
- Wire both buttons to the existing centralized logout logic (`frontend/src/hooks/useAppLogout.ts`) so logout clears session/admin token state, clears React Query cache, and navigates to `/login`.
- Adjust profile page layout as needed to keep the button visible and usable on desktop and mobile (avoid hidden/overflow in narrow widths).

**User-visible outcome:** Managers/Admins and Operators can always see and click “Log out” directly on their profile pages, which signs them out and returns them to the login screen.
