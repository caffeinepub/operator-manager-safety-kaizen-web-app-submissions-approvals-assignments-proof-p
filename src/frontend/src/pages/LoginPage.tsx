import { useGetMaintenanceMode, useValidateCredentials } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { UserCircle, Shield, ShieldCheck } from 'lucide-react';
import { setCredentialSession } from '../utils/credentialSession';
import { Role } from '../backend';
import { mapCredentialError } from '../utils/loginSelection';
import { trimCredentialField, validateCredentials } from '../utils/credentialInput';

export default function LoginPage() {
  const { data: isMaintenanceMode } = useGetMaintenanceMode();
  const navigate = useNavigate();
  const validateCredentialsMutation = useValidateCredentials();
  
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'operator' | 'manager' | 'admin'>('operator');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Trim inputs
    const trimmedLoginId = trimCredentialField(loginId);
    const trimmedPassword = trimCredentialField(password);
    
    // Validate that fields are not empty or whitespace-only
    const validationError = validateCredentials(loginId, password);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      // Map UI role to backend Role enum
      const roleMap: Record<'operator' | 'manager' | 'admin', Role> = {
        operator: Role.operator,
        manager: Role.manager,
        admin: Role.admin,
      };
      
      const backendRole = roleMap[selectedRole];
      
      // Validate credentials with selected role using trimmed values
      const authenticatedRole = await validateCredentialsMutation.mutateAsync({
        loginId: trimmedLoginId,
        password: trimmedPassword,
        selectedRole: backendRole,
      });
      
      // Store credential session with authenticated role
      setCredentialSession(trimmedLoginId, authenticatedRole);
      
      // Navigate based on selected role
      if (selectedRole === 'admin') {
        navigate({ to: '/admin/credentials' });
      } else if (selectedRole === 'operator') {
        navigate({ to: '/' });
      } else if (selectedRole === 'manager') {
        navigate({ to: '/manager/activity' });
      }
    } catch (err: any) {
      // Map backend error to user-safe message
      const userMessage = mapCredentialError(err);
      setError(userMessage);
    }
  };

  const getRoleIcon = () => {
    switch (selectedRole) {
      case 'operator':
        return <UserCircle className="h-5 w-5" />;
      case 'manager':
        return <Shield className="h-5 w-5" />;
      case 'admin':
        return <ShieldCheck className="h-5 w-5" />;
      default:
        return <UserCircle className="h-5 w-5" />;
    }
  };

  const getRoleLabel = () => {
    switch (selectedRole) {
      case 'operator':
        return 'Operator';
      case 'manager':
        return 'Manager';
      case 'admin':
        return 'Admin';
      default:
        return 'Operator';
    }
  };

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
        <CardContent>
          <div className="text-center mb-6">
            <img
              src="/assets/generated/fs-line-processing-photo.dim_1200x600.jpg"
              alt="FS Line Processing"
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as 'operator' | 'manager' | 'admin')}
              >
                <SelectTrigger id="role">
                  <div className="flex items-center gap-2">
                    {getRoleIcon()}
                    <span>{getRoleLabel()}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operator">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" />
                      <span>Operator</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="manager">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Manager</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loginId">Login ID</Label>
              <Input
                id="loginId"
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter your Login ID"
                required
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={validateCredentialsMutation.isPending}
            >
              {validateCredentialsMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="text-xs text-center text-muted-foreground mt-4">
            <p>Enter your credentials to access the system</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
