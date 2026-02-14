import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut, User, Shield } from 'lucide-react';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUser';
import { useAppLogout } from '../../hooks/useAppLogout';
import { useGoBackOrDashboard } from '../../utils/goBackOrDashboard';
import { getAuthenticatedRole, getCurrentLoginId } from '../../utils/credentialSession';
import { Role } from '../../backend';
import AppLayout from '../../components/layout/AppLayout';
import AppHeader from '../../components/layout/AppHeader';

export default function ManagerProfilePage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const { logout } = useAppLogout();
  const { goBackOrDashboard } = useGoBackOrDashboard();
  const credentialRole = getAuthenticatedRole();
  const loginId = getCurrentLoginId();

  const getRoleLabel = (): string => {
    if (credentialRole === Role.admin) return 'Admin';
    if (credentialRole === Role.manager) return 'Manager';
    if (credentialRole === Role.operator) return 'Operator';
    return 'User';
  };

  return (
    <>
      <AppHeader />
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold">Manager Profile</h1>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={goBackOrDashboard} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button variant="destructive" onClick={logout} className="w-full sm:w-auto">
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details and role information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-muted-foreground">Loading profile...</div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-lg font-medium">{userProfile?.name || 'Not set'}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <p className="text-lg font-medium">{getRoleLabel()}</p>
                    </div>
                  </div>

                  {loginId && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Login ID</label>
                      <p className="text-lg font-mono">{loginId}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </>
  );
}
