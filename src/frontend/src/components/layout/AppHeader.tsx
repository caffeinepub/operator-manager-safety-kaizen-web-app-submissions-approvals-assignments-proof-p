import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../../hooks/useCurrentUser';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from '@tanstack/react-router';
import { Menu, User, LogOut, LayoutDashboard, FileText, Lightbulb, Shield, Activity, BarChart3, AlertTriangle, Users } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

export default function AppHeader() {
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Observations', icon: FileText, path: '/observations' },
    { label: 'Kaizen', icon: Lightbulb, path: '/kaizen' },
  ];

  const managerItems = isAdmin
    ? [
        { label: 'Analytics', icon: BarChart3, path: '/manager/analytics' },
        { label: 'Gaps Analysis', icon: AlertTriangle, path: '/manager/gaps' },
        { label: 'Inactivity', icon: Activity, path: '/manager/inactivity' },
        { label: 'Operator Activity', icon: Users, path: '/manager/activity' },
        { label: 'Role Management', icon: Shield, path: '/admin/roles' },
      ]
    : [];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => (
        <Button
          key={item.path}
          variant="ghost"
          onClick={() => {
            navigate({ to: item.path });
            if (mobile) setMobileMenuOpen(false);
          }}
          className={mobile ? 'w-full justify-start' : ''}
        >
          <item.icon className="h-4 w-4 mr-2" />
          {item.label}
        </Button>
      ))}
      {managerItems.length > 0 && (
        <>
          {mobile && <div className="border-t my-2" />}
          {managerItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => {
                navigate({ to: item.path });
                if (mobile) setMobileMenuOpen(false);
              }}
              className={mobile ? 'w-full justify-start' : ''}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          ))}
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/assets/generated/kaizen-logo.dim_512x512.png" alt="Logo" className="h-10 w-10" />
            <div>
              <h1 className="text-lg font-bold leading-tight">SafetyHub</h1>
              <p className="text-xs text-muted-foreground">Continuous Improvement</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {userProfile && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium">{userProfile.name}</p>
                <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-xs">
                  {isAdmin ? 'Manager' : 'Operator'}
                </Badge>
              </div>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userProfile?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{isAdmin ? 'Manager' : 'Operator'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-2 mt-8">
                <NavLinks mobile />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
