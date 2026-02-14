import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/assets/generated/kaizen-logo.dim_512x512.png" alt="Logo" className="h-20 w-20" />
          </div>
          <CardTitle className="text-2xl">Welcome to SafetyHub</CardTitle>
          <CardDescription>Continuous Improvement & Safety Management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <img
              src="/assets/generated/kaizen-dashboard-illustration.dim_1200x600.png"
              alt="Dashboard"
              className="w-full h-auto rounded-lg mb-4"
            />
          </div>
          <Button
            onClick={handleLogin}
            disabled={loginStatus === 'logging-in'}
            className="w-full"
            size="lg"
          >
            <LogIn className="h-5 w-5 mr-2" />
            {loginStatus === 'logging-in' ? 'Connecting...' : 'Sign In with Internet Identity'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Secure authentication powered by Internet Computer
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
