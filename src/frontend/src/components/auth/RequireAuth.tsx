import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetMaintenanceMode, useHasAdmin } from '../../hooks/useQueries';
import { useIsCallerAdmin } from '../../hooks/useCurrentUser';
import LoginPage from '../../pages/LoginPage';
import MaintenancePage from '../../pages/MaintenancePage';
import AdminSetupPage from '../../pages/admin/AdminSetupPage';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isMaintenanceMode, isLoading: maintenanceLoading } = useGetMaintenanceMode();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: hasAdmin, isLoading: hasAdminLoading } = useHasAdmin();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  // Show loading while checking maintenance mode, admin status, and hasAdmin
  if (maintenanceLoading || adminLoading || hasAdminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If no admin exists and user is not admin, show admin setup page
  if (hasAdmin === false && !isAdmin) {
    return <AdminSetupPage />;
  }

  // If maintenance mode is enabled and user is not admin, show maintenance page
  if (isMaintenanceMode && !isAdmin) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
}
