import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssignCallerUserRole, useGetUserProfile } from '../../hooks/useQueries';
import { UserRole } from '../../backend';
import { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

export default function RoleManagementPage() {
  const [principalInput, setPrincipalInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.user);
  const [lookupPrincipal, setLookupPrincipal] = useState<Principal | null>(null);
  const assignRole = useAssignCallerUserRole();
  const { data: userProfile } = useGetUserProfile(lookupPrincipal);

  const handleLookup = () => {
    try {
      const principal = Principal.fromText(principalInput.trim());
      setLookupPrincipal(principal);
    } catch (error) {
      toast.error('Invalid principal format');
    }
  };

  const handleAssignRole = async () => {
    if (!lookupPrincipal) {
      toast.error('Please lookup a user first');
      return;
    }

    try {
      await assignRole.mutateAsync({ user: lookupPrincipal, role: selectedRole });
      toast.success('Role assigned successfully');
      setPrincipalInput('');
      setLookupPrincipal(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign role');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Role Management</h1>
          <p className="text-muted-foreground">Assign roles to users by their principal ID</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assign User Role</CardTitle>
            <CardDescription>Enter a user's principal ID to assign or update their role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="principal">User Principal ID</Label>
              <div className="flex gap-2">
                <Input
                  id="principal"
                  value={principalInput}
                  onChange={(e) => setPrincipalInput(e.target.value)}
                  placeholder="Enter principal ID..."
                  className="font-mono text-sm"
                />
                <Button onClick={handleLookup} variant="outline">
                  Lookup
                </Button>
              </div>
            </div>

            {lookupPrincipal && (
              <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm font-medium">User Profile</p>
                {userProfile ? (
                  <>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Name:</span> {userProfile.name}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Current Role:</span> {userProfile.role}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No profile found for this user</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Assign Role</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.user}>User (Operator)</SelectItem>
                  <SelectItem value={UserRole.admin}>Admin (Manager)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAssignRole} disabled={!lookupPrincipal || assignRole.isPending} className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              {assignRole.isPending ? 'Assigning...' : 'Assign Role'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Find Principal IDs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Users can find their principal ID by:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Checking the metadata section on any observation or Kaizen they submitted</li>
              <li>Asking them to share their principal ID with you directly</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
