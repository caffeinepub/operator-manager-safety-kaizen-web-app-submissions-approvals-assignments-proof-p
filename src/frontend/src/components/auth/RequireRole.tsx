import { useIsCallerAdmin } from '../../hooks/useCurrentUser';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { getAuthenticatedRole } from '../../utils/credentialSession';
import { Role } from '../../backend';

export default function RequireRole({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole: 'admin' | 'manager';
}) {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  const navigate = useNavigate();
  const credentialRole = getAuthenticatedRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Admin pages require Admin role
  if (requiredRole === 'admin') {
    const hasAdminAccess = isAdmin || credentialRole === Role.admin;
    
    if (!hasAdminAccess) {
      return (
        <div className="container max-w-2xl mx-auto py-12 px-4">
          <Alert variant="destructive">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              Your Login ID does not have Admin access. Please contact an Admin.
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Button onClick={() => navigate({ to: '/' })}>Return to Dashboard</Button>
          </div>
        </div>
      );
    }
  }

  // Manager pages allow Manager or Admin
  if (requiredRole === 'manager') {
    const hasManagerAccess = isAdmin || credentialRole === Role.manager || credentialRole === Role.admin;
    
    if (!hasManagerAccess) {
      return (
        <div className="container max-w-2xl mx-auto py-12 px-4">
          <Alert variant="destructive">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have Manager access. Please contact an Admin to obtain Manager credentials.
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Button onClick={() => navigate({ to: '/' })}>Return to Dashboard</Button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
