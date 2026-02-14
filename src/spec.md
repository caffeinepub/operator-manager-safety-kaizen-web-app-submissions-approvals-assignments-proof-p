# Specification

## Summary
**Goal:** Add a manager/admin-only operator activity overview so managers can review all operator usage in one place.

**Planned changes:**
- Backend: add a new admin/manager-only query that returns all entries from the operatorActivity map, sorted by most recent lastActivity, including principal, lastActivity, and optional profile name/role from userProfiles when available.
- Frontend: create a new manager-only page that displays a sortable operator activity table (name if available, principal, last activity, days inactive, Active/Inactive badge) with a configurable inactivity threshold (default 7 days).
- Frontend: add a React Query hook in `frontend/src/hooks/useQueries.ts` for the new backend query and support manual refetch/update when the threshold changes.
- Frontend: add routing and header navigation entry for the new page (e.g. `/manager/activity`) guarded by existing `RequireAuth` + `RequireRole(requiredRole="admin")`, and handle loading/empty states.

**User-visible outcome:** Managers/admins can open a new “Operator Activity” page from the manager header navigation to view all operators’ last activity, see days inactive and Active/Inactive status based on a configurable threshold, and refresh the data on demand.
