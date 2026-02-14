import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import AppLayout from '../../components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  useAuthorizeAdmin, 
  useCreateCredential, 
  useResetCredential, 
  useDisableCredential, 
  useEnableCredential,
  setAdminToken,
  clearAdminToken
} from '../../hooks/useQueries';
import { Role } from '../../backend';
import { Key, UserPlus, RefreshCw, Ban, CheckCircle, AlertCircle, ShieldAlert, LogOut } from 'lucide-react';
import { getCurrentLoginId, clearCredentialSession } from '../../utils/credentialSession';
import { mapCredentialError } from '../../utils/loginSelection';

// Mock credentials for display - in production this would come from backend
interface DisplayCredential {
  id: string;
  role: Role;
  enabled: boolean;
}

export default function CredentialManagementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authorizeAdmin = useAuthorizeAdmin();
  const createCredential = useCreateCredential();
  const resetCredential = useResetCredential();
  const disableCredential = useDisableCredential();
  const enableCredential = useEnableCredential();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoginId, setAuthLoginId] = useState('admin');
  const [authPassword, setAuthPassword] = useState('1234');
  
  const [credentials, setCredentials] = useState<DisplayCredential[]>([
    { id: 'admin', role: Role.admin, enabled: true }
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showMyResetDialog, setShowMyResetDialog] = useState(false);
  const [showDisableMyAccountDialog, setShowDisableMyAccountDialog] = useState(false);
  const [selectedLoginId, setSelectedLoginId] = useState('');
  
  const [newLoginId, setNewLoginId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<Role>(Role.operator);
  const [resetPassword, setResetPassword] = useState('');
  const [myNewPassword, setMyNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentLoginId = getCurrentLoginId();

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // Trim whitespace from inputs before submitting
      const trimmedLoginId = authLoginId.trim();
      const trimmedPassword = authPassword.trim();
      
      const token = await authorizeAdmin.mutateAsync({
        loginId: trimmedLoginId,
        password: trimmedPassword,
      });
      setAdminToken(token);
      setIsAuthorized(true);
      setSuccess('Admin authorization successful');
    } catch (err: any) {
      // Use mapCredentialError to show user-safe error messages
      setError(mapCredentialError(err));
    }
  };

  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await createCredential.mutateAsync({
        loginId: newLoginId,
        password: newPassword,
        role: newRole,
      });
      
      // Add to local display list
      setCredentials([...credentials, { id: newLoginId, role: newRole, enabled: true }]);
      
      setSuccess(`Login ID created successfully: ${newLoginId}`);
      setShowCreateDialog(false);
      setNewLoginId('');
      setNewPassword('');
      setNewRole(Role.operator);
    } catch (err: any) {
      setError(err.message || 'Failed to create Login ID');
    }
  };

  const handleResetCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await resetCredential.mutateAsync({
        loginId: selectedLoginId,
        newPassword: resetPassword,
      });
      
      setSuccess(`Password reset successfully for ${selectedLoginId}`);
      setShowResetDialog(false);
      setSelectedLoginId('');
      setResetPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    }
  };

  const handleResetMyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!currentLoginId) {
      setError('No active session found');
      return;
    }
    
    try {
      await resetCredential.mutateAsync({
        loginId: currentLoginId,
        newPassword: myNewPassword,
      });
      
      setSuccess('Your password has been reset successfully');
      setShowMyResetDialog(false);
      setMyNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to reset your password');
    }
  };

  const handleDisableCredential = async (loginId: string) => {
    setError('');
    setSuccess('');
    
    try {
      await disableCredential.mutateAsync(loginId);
      
      // Update local display list
      setCredentials(credentials.map(c => 
        c.id === loginId ? { ...c, enabled: false } : c
      ));
      
      setSuccess(`Account disabled: ${loginId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to disable account');
    }
  };

  const handleEnableCredential = async (loginId: string) => {
    setError('');
    setSuccess('');
    
    try {
      await enableCredential.mutateAsync(loginId);
      
      // Update local display list
      setCredentials(credentials.map(c => 
        c.id === loginId ? { ...c, enabled: true } : c
      ));
      
      setSuccess(`Account enabled: ${loginId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to enable account');
    }
  };

  const handleDisableMyAccount = async () => {
    setError('');
    setSuccess('');
    
    if (!currentLoginId) {
      setError('No active session found');
      return;
    }

    // Check if this is the last enabled admin
    const enabledAdmins = credentials.filter(c => c.role === Role.admin && c.enabled);
    const isLastAdmin = enabledAdmins.length === 1 && enabledAdmins[0].id === currentLoginId;
    
    if (isLastAdmin) {
      setError('Cannot disable the last enabled Admin account. This would lock the system.');
      setShowDisableMyAccountDialog(false);
      return;
    }
    
    try {
      await disableCredential.mutateAsync(currentLoginId);
      
      // Update local display list
      setCredentials(credentials.map(c => 
        c.id === currentLoginId ? { ...c, enabled: false } : c
      ));
      
      setSuccess('Your account has been disabled. You will be logged out.');
      setShowDisableMyAccountDialog(false);
      
      // Sign out after a brief delay
      setTimeout(() => {
        clearCredentialSession();
        clearAdminToken();
        queryClient.clear();
        navigate({ to: '/login' });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to disable your account');
      setShowDisableMyAccountDialog(false);
    }
  };

  const getRoleLabel = (role: Role): string => {
    switch (role) {
      case Role.admin:
        return 'Admin';
      case Role.manager:
        return 'Manager';
      case Role.operator:
        return 'Operator';
      default:
        return 'Unknown';
    }
  };

  const getRoleBadgeVariant = (role: Role): 'default' | 'secondary' | 'outline' => {
    switch (role) {
      case Role.admin:
        return 'default';
      case Role.manager:
        return 'secondary';
      case Role.operator:
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Check if current user can disable their account
  const enabledAdmins = credentials.filter(c => c.role === Role.admin && c.enabled);
  const canDisableMyAccount = !(enabledAdmins.length === 1 && enabledAdmins[0].id === currentLoginId);

  if (!isAuthorized) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                Admin Authorization Required
              </CardTitle>
              <CardDescription>
                Enter your admin credentials to manage Login IDs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuthorize} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="auth-loginid">Admin Login ID</Label>
                  <Input
                    id="auth-loginid"
                    value={authLoginId}
                    onChange={(e) => setAuthLoginId(e.target.value)}
                    placeholder="Enter your admin Login ID"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="auth-password">Password</Label>
                  <Input
                    id="auth-password"
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={authorizeAdmin.isPending}>
                  {authorizeAdmin.isPending ? 'Authorizing...' : 'Authorize'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Login ID Management</h1>
            <p className="text-muted-foreground">
              Create and manage Login IDs for Operator, Manager, and Admin access
            </p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Login ID
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Login ID</DialogTitle>
                <DialogDescription>
                  Create a new Login ID and password for system access
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCredential}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-loginid">Login ID</Label>
                    <Input
                      id="new-loginid"
                      value={newLoginId}
                      onChange={(e) => setNewLoginId(e.target.value)}
                      placeholder="Enter Login ID"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-role">Role</Label>
                    <Select
                      value={newRole}
                      onValueChange={(value) => setNewRole(value as Role)}
                    >
                      <SelectTrigger id="new-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Role.operator}>Operator</SelectItem>
                        <SelectItem value={Role.manager}>Manager</SelectItem>
                        <SelectItem value={Role.admin}>Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCredential.isPending}>
                    {createCredential.isPending ? 'Creating...' : 'Create Login ID'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {currentLoginId && (
          <Card>
            <CardHeader>
              <CardTitle>My Admin Account</CardTitle>
              <CardDescription>
                Manage your own Login ID: <strong>{currentLoginId}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Dialog open={showMyResetDialog} onOpenChange={setShowMyResetDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset My Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset My Password</DialogTitle>
                      <DialogDescription>
                        Enter a new password for your account
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleResetMyPassword}>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="my-new-password">New Password</Label>
                          <Input
                            id="my-new-password"
                            type="password"
                            value={myNewPassword}
                            onChange={(e) => setMyNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowMyResetDialog(false);
                            setMyNewPassword('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={resetCredential.isPending}>
                          {resetCredential.isPending ? 'Resetting...' : 'Reset Password'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <AlertDialog open={showDisableMyAccountDialog} onOpenChange={setShowDisableMyAccountDialog}>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDisableMyAccountDialog(true)}
                    disabled={!canDisableMyAccount}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Disable My Account
                  </Button>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disable Your Account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will disable your Login ID <strong>{currentLoginId}</strong> and you will be logged out immediately. 
                        You will not be able to access the system until another admin re-enables your account.
                        <br /><br />
                        <strong>Warning:</strong> This action cannot be undone by yourself.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDisableMyAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Disable My Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              
              {!canDisableMyAccount && (
                <p className="text-sm text-muted-foreground mt-3">
                  You cannot disable your account because you are the last enabled Admin.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>All Login IDs</CardTitle>
            <CardDescription>
              Manage all system Login IDs. After creating a Login ID, users can log in with their credentials and access features based on their assigned role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Login ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials.map((cred) => (
                  <TableRow key={cred.id}>
                    <TableCell className="font-medium">{cred.id}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(cred.role)}>
                        {getRoleLabel(cred.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {cred.enabled ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <Ban className="h-3 w-3 mr-1" />
                          Disabled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {cred.id !== currentLoginId && (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedLoginId(cred.id)}
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Reset
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reset Password</DialogTitle>
                                  <DialogDescription>
                                    Enter a new password for <strong>{cred.id}</strong>
                                  </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleResetCredential}>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="reset-password">New Password</Label>
                                      <Input
                                        id="reset-password"
                                        type="password"
                                        value={resetPassword}
                                        onChange={(e) => setResetPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => {
                                        setShowResetDialog(false);
                                        setResetPassword('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button type="submit" disabled={resetCredential.isPending}>
                                      {resetCredential.isPending ? 'Resetting...' : 'Reset Password'}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>

                            {cred.enabled ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDisableCredential(cred.id)}
                                disabled={disableCredential.isPending}
                              >
                                <Ban className="h-3 w-3 mr-1" />
                                Disable
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEnableCredential(cred.id)}
                                disabled={enableCredential.isPending}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Enable
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
