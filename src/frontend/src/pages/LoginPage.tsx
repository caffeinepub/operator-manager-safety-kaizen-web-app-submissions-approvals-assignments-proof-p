import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMaintenanceMode } from '../hooks/useQueries';
import { useIsCallerAdmin } from '../hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { UserCircle, Shield, ShieldCheck } from 'lucide-react';
import { setLoginIntent, getLoginIntent, clearLoginIntent, setManagerAccessDenied, setAdminAccessDenied } from '../utils/loginSelection';

export default function LoginPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const { data: isMaintenanceMode, isLoading: maintenanceLoading } = useGetMaintenanceMode();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity && !maintenanceLoading && !adminLoading) {
      // Check if maintenance mode is active and user is not admin
      if (isMaintenanceMode && !isAdmin) {
        // Don't redirect, let RequireAuth handle showing maintenance page
        return;
      }

      // User is authenticated and either not in maintenance or is admin
      const intent = getLoginIntent();
      
      if (intent === 'manager') {
        // Check if user has admin/manager permission
        if (isAdmin) {
          navigate({ to: '/manager/activity' });
        } else {
          // User tried to sign in as manager but doesn't have permission
          setManagerAccessDenied();
          navigate({ to: '/' });
        }
      } else if (intent === 'admin') {
        // Check if user has admin/manager permission
        if (isAdmin) {
          navigate({ to: '/admin/roles' });
        } else {
          // User tried to sign in as admin but doesn't have permission
          setAdminAccessDenied();
          navigate({ to: '/' });
        }
      } else {
        // Default to operator dashboard
        navigate({ to: '/' });
      }
      
      // Clear the intent after successful redirect
      clearLoginIntent();
    }
  }, [identity, isMaintenanceMode, isAdmin, maintenanceLoading, adminLoading, navigate]);

  const handleLogin = async (intent: 'operator' | 'manager' | 'admin') => {
    try {
      // Persist the selection before initiating login
      setLoginIntent(intent);
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      // Clear intent on error
      clearLoginIntent();
    }
  };

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/assets/generated/itc-limited-logo.dim_512x512.png" 
              alt="ITC Limited Logo" 
              className="h-20 w-20 object-contain" 
            />
          </div>
          <CardTitle className="text-2xl">ITC Khordha Safetyhub</CardTitle>
          <CardDescription>Continuous Improvement & Safety Management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <img
              src="/assets/generated/fs-line-processing-photo.dim_1200x600.jpg"
              alt="FS Line Processing"
              className="w-full h-auto rounded-lg mb-4 object-cover"
            />
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-center text-muted-foreground font-medium">
              Choose your role to sign in with Internet Identity:
            </p>
            
            <Button
              onClick={() => handleLogin('operator')}
              disabled={isLoggingIn}
              className="w-full"
              size="lg"
              variant="default"
            >
              <UserCircle className="h-5 w-5 mr-2" />
              {isLoggingIn ? 'Connecting...' : 'Sign in as Operator'}
            </Button>
            
            <Button
              onClick={() => handleLogin('manager')}
              disabled={isLoggingIn}
              className="w-full"
              size="lg"
              variant="default"
            >
              <Shield className="h-5 w-5 mr-2" />
              {isLoggingIn ? 'Connecting...' : 'Sign in as Manager'}
            </Button>
            
            <Button
              onClick={() => handleLogin('admin')}
              disabled={isLoggingIn}
              className="w-full"
              size="lg"
              variant="default"
            >
              <ShieldCheck className="h-5 w-5 mr-2" />
              {isLoggingIn ? 'Connecting...' : 'Sign in as Admin'}
            </Button>
          </div>
          
          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p>Authentication via Internet Identity</p>
            <p className="text-[10px]">Manager and Admin access is assigned by an existing Admin through Role Management</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
