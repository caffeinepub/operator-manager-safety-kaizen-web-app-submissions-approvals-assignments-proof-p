import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useBootstrapAdmin } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const bootstrapMutation = useBootstrapAdmin();
  const [error, setError] = useState<string | null>(null);

  const handleBootstrap = async () => {
    setError(null);
    try {
      await bootstrapMutation.mutateAsync();
      // On success, navigate to manager activity page
      setTimeout(() => {
        navigate({ to: '/manager/activity' });
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize admin');
    }
  };

  const handleContinue = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Admin Setup Required</CardTitle>
          <CardDescription>
            No administrator has been initialized for this application yet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {bootstrapMutation.isSuccess ? (
            <Alert>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                You have been assigned as the initial Admin. Redirecting to Manager dashboard...
              </AlertDescription>
            </Alert>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Setup Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>One-Time Setup</AlertTitle>
              <AlertDescription>
                This application requires an administrator to manage user roles and system settings. 
                The first person to complete this setup will become the initial Admin and can then assign 
                Manager or Operator roles to other users via the Role Management page.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm">What happens next:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Your Internet Identity principal will be assigned the Manager role</li>
              <li>You'll gain access to Role Management, Maintenance Mode, and Manager pages</li>
              <li>You can assign roles to other users through the Role Management interface</li>
              <li>This setup can only be performed once</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleBootstrap}
              disabled={bootstrapMutation.isPending || bootstrapMutation.isSuccess}
              className="flex-1"
              size="lg"
            >
              {bootstrapMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Setting up...
                </>
              ) : bootstrapMutation.isSuccess ? (
                'Setup Complete'
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Become Admin (One-Time Setup)
                </>
              )}
            </Button>
            {error && (
              <Button
                onClick={handleContinue}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Continue to App
              </Button>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Authentication is handled via Internet Identity. Admins manage access by assigning roles to principals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
