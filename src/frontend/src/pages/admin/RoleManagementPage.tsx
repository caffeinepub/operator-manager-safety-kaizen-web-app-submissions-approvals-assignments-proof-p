import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssignCallerUserRole } from '../../hooks/useQueries';
import { UserRole } from '../../backend';
import { Principal } from '@icp-sdk/core/principal';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RoleManagementPage() {
  const [principalId, setPrincipalId] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.admin);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const assignRole = useAssignCallerUserRole();

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const principal = Principal.fromText(principalId);
      await assignRole.mutateAsync({ user: principal, role: selectedRole });
      setSuccess(`Role assigned successfully to ${principalId}`);
      setPrincipalId('');
    } catch (err: any) {
      setError(err.message || 'Failed to assign role. Please check the Principal ID format.');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Role Management</h1>
          <p className="text-muted-foreground">
            Assign Manager or Admin roles to users by their Principal ID
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Assign Role</CardTitle>
            <CardDescription>
              Enter the user's Principal ID and select their access level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssignRole} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="principal">Principal ID</Label>
                <Input
                  id="principal"
                  value={principalId}
                  onChange={(e) => setPrincipalId(e.target.value)}
                  placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The user's Internet Identity Principal ID
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Access Level</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as UserRole)}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.admin}>Admin / Manager</SelectItem>
                    <SelectItem value={UserRole.user}>Operator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={assignRole.isPending}>
                <Shield className="h-4 w-4 mr-2" />
                {assignRole.isPending ? 'Assigning...' : 'Assign Role'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How Role Assignment Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>1. User Signs In:</strong> New users first authenticate using Internet Identity. They are automatically assigned the Operator role.
            </p>
            <p>
              <strong>2. Share Principal ID:</strong> The user shares their Principal ID with you (visible in their profile or browser console).
            </p>
            <p>
              <strong>3. Assign Role:</strong> You enter their Principal ID here and assign Manager or Admin access.
            </p>
            <p>
              <strong>4. Password Unlock:</strong> After role assignment, users with Manager/Admin roles must enter valid credentials (username/password) after Internet Identity sign-in to unlock their elevated access.
            </p>
            <p>
              <strong>Note:</strong> Credentials are managed separately in the Credentials page. Role assignment via Principal ID determines who can attempt to unlock Manager/Admin access.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
