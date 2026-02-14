import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, LogOut } from 'lucide-react';

export default function MaintenancePage() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-warning/10 p-4">
              <AlertTriangle className="h-12 w-12 text-warning" />
            </div>
          </div>
          <CardTitle className="text-2xl">Maintenance in Progress</CardTitle>
          <CardDescription>
            The application is temporarily unavailable while updates are being applied.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              We're working to improve your experience. The SafetyHub application will be back online shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              Please check back in a few minutes.
            </p>
          </div>
          
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
