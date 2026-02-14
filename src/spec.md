# Specification

## Summary
**Goal:** Add an Admin Internet Identity sign-in entry point and clearly communicate that the app does not support username/password accounts.

**Planned changes:**
- Update `/login` to include a third button, “Sign in as Admin”, alongside the existing Operator and Manager options, using the same Internet Identity login flow.
- Extend the session-stored login intent to support `admin`, including clearing intent after handling, consistent with existing behavior.
- Implement post-login handling for the `admin` intent: redirect Admin/Manager users to an existing admin landing route (e.g., `/admin/roles`); otherwise show a clear English message about needing Admin-assigned access and redirect to the operator dashboard (`/`).
- Add a short English guidance section on an existing admin-protected page (e.g., Role Management) explaining role assignment for Internet Identity principals (share Principal ID → Admin assigns Operator or Manager/Admin role) and explicitly not mentioning passwords.

**User-visible outcome:** The login page shows three Internet Identity sign-in options (Operator/Manager/Admin). Admin-intent sign-in routes eligible users to the admin area, while ineligible users see an English explanation and are redirected to the operator dashboard. Admin pages clarify that access is managed by assigning roles to Internet Identity principals, not by creating passwords.
