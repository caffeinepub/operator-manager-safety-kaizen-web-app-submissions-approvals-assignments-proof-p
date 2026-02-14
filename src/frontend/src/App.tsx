import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCurrentUser';
import { useActivityHeartbeat } from './hooks/useActivityHeartbeat';
import ProfileSetupDialog from './components/profile/ProfileSetupDialog';
import AppHeader from './components/layout/AppHeader';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ObservationNewPage from './pages/observations/ObservationNewPage';
import ObservationsListPage from './pages/observations/ObservationsListPage';
import ObservationDetailPage from './pages/observations/ObservationDetailPage';
import KaizenNewPage from './pages/kaizen/KaizenNewPage';
import KaizenListPage from './pages/kaizen/KaizenListPage';
import KaizenDetailPage from './pages/kaizen/KaizenDetailPage';
import RoleManagementPage from './pages/admin/RoleManagementPage';
import InactivityDashboardPage from './pages/manager/InactivityDashboardPage';
import AnalyticsPage from './pages/manager/AnalyticsPage';
import GapsPage from './pages/manager/GapsPage';
import OperatorActivityPage from './pages/manager/OperatorActivityPage';
import RequireAuth from './components/auth/RequireAuth';
import RequireRole from './components/auth/RequireRole';
import AppLayout from './components/layout/AppLayout';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function RootLayout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  useActivityHeartbeat();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && <AppHeader />}
      <main>
        <Outlet />
      </main>
      {showProfileSetup && <ProfileSetupDialog />}
      <Toaster />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  ),
});

const observationNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/observations/new',
  component: () => (
    <RequireAuth>
      <ObservationNewPage />
    </RequireAuth>
  ),
});

const observationsListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/observations',
  component: () => (
    <RequireAuth>
      <ObservationsListPage />
    </RequireAuth>
  ),
});

const observationDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/observations/$id',
  component: () => (
    <RequireAuth>
      <ObservationDetailPage />
    </RequireAuth>
  ),
});

const kaizenNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kaizen/new',
  component: () => (
    <RequireAuth>
      <KaizenNewPage />
    </RequireAuth>
  ),
});

const kaizenListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kaizen',
  component: () => (
    <RequireAuth>
      <KaizenListPage />
    </RequireAuth>
  ),
});

const kaizenDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kaizen/$id',
  component: () => (
    <RequireAuth>
      <KaizenDetailPage />
    </RequireAuth>
  ),
});

const roleManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/roles',
  component: () => (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <RoleManagementPage />
      </RequireRole>
    </RequireAuth>
  ),
});

const inactivityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manager/inactivity',
  component: () => (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <InactivityDashboardPage />
      </RequireRole>
    </RequireAuth>
  ),
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manager/analytics',
  component: () => (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <AnalyticsPage />
      </RequireRole>
    </RequireAuth>
  ),
});

const gapsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manager/gaps',
  component: () => (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <GapsPage />
      </RequireRole>
    </RequireAuth>
  ),
});

const operatorActivityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manager/activity',
  component: () => (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <OperatorActivityPage />
      </RequireRole>
    </RequireAuth>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  observationNewRoute,
  observationsListRoute,
  observationDetailRoute,
  kaizenNewRoute,
  kaizenListRoute,
  kaizenDetailRoute,
  roleManagementRoute,
  inactivityRoute,
  analyticsRoute,
  gapsRoute,
  operatorActivityRoute,
  loginRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
