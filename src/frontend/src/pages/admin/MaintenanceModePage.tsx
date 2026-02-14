import { useGetMaintenanceMode, useSetMaintenanceMode } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function MaintenanceModePage() {
  const { data: isMaintenanceMode, isLoading } = useGetMaintenanceMode();
  const setMaintenanceMode = useSetMaintenanceMode();
  const [localState, setLocalState] = useState<boolean | null>(null);

  const effectiveState = localState !== null ? localState : (isMaintenanceMode ?? false);

  const handleToggle = async (enabled: boolean) => {
    setLocalState(enabled);
    try {
      await setMaintenanceMode.mutateAsync(enabled);
      toast.success(
        enabled 
          ? 'Maintenance mode enabled. Operators will see a maintenance screen.' 
          : 'Maintenance mode disabled. Application is now accessible to all users.'
      );
      setLocalState(null);
    } catch (error) {
      console.error('Failed to update maintenance mode:', error);
      toast.error('Failed to update maintenance mode. Please try again.');
      setLocalState(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Maintenance Mode</h1>
        <p className="text-muted-foreground mt-2">
          Control application availability for operators
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Mode Control</CardTitle>
            <CardDescription>
              When enabled, operators will see a maintenance screen instead of the application. 
              Managers and admins can still access the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="maintenance-toggle" className="text-base font-medium">
                  Enable Maintenance Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  {effectiveState 
                    ? 'Maintenance mode is currently active' 
                    : 'Application is accessible to all users'}
                </p>
              </div>
              <Switch
                id="maintenance-toggle"
                checked={effectiveState}
                onCheckedChange={handleToggle}
                disabled={setMaintenanceMode.isPending}
              />
            </div>

            {effectiveState && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Maintenance mode is active.</strong> Operators cannot access the application 
                  and will see a maintenance screen. Only managers and admins can use the app.
                </AlertDescription>
              </Alert>
            )}

            {!effectiveState && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  The application is currently accessible to all authenticated users.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What happens when maintenance mode is enabled?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Operators will see a maintenance screen when they try to access the application</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Managers and admins can continue to use the application normally</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Operators can sign out but cannot access any application features</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Use this mode when performing updates, testing, or system maintenance</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
