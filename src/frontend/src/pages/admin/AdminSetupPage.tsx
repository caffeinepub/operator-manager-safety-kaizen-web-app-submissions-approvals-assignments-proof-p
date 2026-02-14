import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from '@tanstack/react-router';
import { ShieldCheck, CheckCircle } from 'lucide-react';

export default function AdminSetupPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Admin initialization happens automatically in the backend
    // Redirect to dashboard after a brief moment
    const timer = setTimeout(() => {
      navigate({ to: '/' });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Admin Setup Complete</CardTitle>
          <CardDescription>
            Your account has been initialized as Admin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              You are now the Admin. Redirecting to dashboard...
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>What you can do now:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Manage user roles via Role Management</li>
              <li>Create password credentials for Operator/Manager access</li>
              <li>Control maintenance mode and system settings</li>
              <li>Access all manager and admin tools</li>
            </ul>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Additional Admins can be assigned through Role Management.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
