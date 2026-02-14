import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { UserCircle, Shield } from 'lucide-react';
import { setLoginIntent, getLoginIntent, clearLoginIntent } from '../utils/loginSelection';

export default function LoginPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      // User is authenticated, redirect based on stored intent
      const intent = getLoginIntent();
      
      if (intent === 'manager') {
        navigate({ to: '/manager/activity' });
      } else {
        // Default to operator dashboard
        navigate({ to: '/' });
      }
      
      // Clear the intent after successful redirect
      clearLoginIntent();
    }
  }, [identity, navigate]);

  const handleLogin = async (intent: 'operator' | 'manager') => {
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
              Choose your role to sign in:
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
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Secure authentication powered by Internet Computer
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
