import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUser';
import { useIsCallerAdmin } from '../../hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQueryClient } from '@tanstack/react-query';
import { Home, FileText, Lightbulb, Users, Settings, LogOut, Menu, Shield, Key } from 'lucide-react';
import { clearCredentialSession, getAuthenticatedRole } from '../../utils/credentialSession';
import { clearAdminToken } from '../../hooks/useQueries';
import { Role } from '../../backend';

export default function AppHeader() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();
  const credentialRole = getAuthenticatedRole();

  const handleLogout = async () => {
    clearCredentialSession();
    clearAdminToken();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  const initials = userProfile?.name
    ? userProfile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  // User has manager access if they're admin or have manager/admin credential role
  const hasManagerAccess = isAdmin || credentialRole === Role.manager || credentialRole === Role.admin;
  
  // User has admin access if they're admin or have admin credential role
  const hasAdminAccess = isAdmin || credentialRole === Role.admin;

  // Display role label
  const getRoleLabel = (): string => {
    if (credentialRole === Role.admin) return 'Admin';
    if (credentialRole === Role.manager) return 'Manager';
    if (credentialRole === Role.operator) return 'Operator';
    return 'User';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/itc-limited-logo.dim_512x512.png" 
              alt="ITC Limited" 
              className="h-10 w-10 object-contain" 
            />
            <div>
              <h1 className="text-lg font-bold leading-tight">ITC Khordha</h1>
              <p className="text-xs text-muted-foreground">Safetyhub</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/' })}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/observations' })}>
              <FileText className="h-4 w-4 mr-2" />
              Observations
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/kaizen' })}>
              <Lightbulb className="h-4 w-4 mr-2" />
              Kaizen
            </Button>
            {hasManagerAccess && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Manager
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Manager Tools</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: '/manager/inactivity' })}>
                    Inactivity Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: '/manager/activity' })}>
                    Operator Activity
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {hasAdminAccess && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Admin Tools</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: '/admin/credentials' })}>
                    <Key className="h-4 w-4 mr-2" />
                    Login IDs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: '/admin/maintenance' })}>
                    <Settings className="h-4 w-4 mr-2" />
                    Maintenance Mode
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">{userProfile?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{userProfile?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
