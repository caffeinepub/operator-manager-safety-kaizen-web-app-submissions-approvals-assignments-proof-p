import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import AppLayout from './components/layout/AppLayout';
import RequireAuth from './components/auth/RequireAuth';
import RequireRole from './components/auth/RequireRole';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import AdminSetupPage from './pages/admin/AdminSetupPage';
import MaintenancePage from './pages/MaintenancePage';
import InactivityDashboardPage from './pages/manager/InactivityDashboardPage';
import OperatorActivityPage from './pages/manager/OperatorActivityPage';
import RoleManagementPage from './pages/admin/RoleManagementPage';
import CredentialManagementPage from './pages/admin/CredentialManagementPage';
import MaintenanceModePage from './pages/admin/MaintenanceModePage';
import ObservationsListPage from './pages/observations/ObservationsListPage';
import ObservationDetailPage from './pages/observations/ObservationDetailPage';
import ObservationFormPage from './pages/observations/ObservationFormPage';
import KaizenListPage from './pages/kaizen/KaizenListPage';
import KaizenDetailPage from './pages/kaizen/KaizenDetailPage';
import KaizenFormPage from './pages/kaizen/KaizenFormPage';
import ManagerProfilePage from './pages/manager/ManagerProfilePage';
import OperatorProfilePage from './pages/operator/OperatorProfilePage';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const adminSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/setup',
  component: AdminSetupPage,
});

const maintenanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/maintenance',
  component: MaintenancePage,
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

const observationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/observations',
  component: () => (
    <RequireAuth>
      <ObservationsListPage />
    </RequireAuth>
  ),
});

const observationsNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/observations/new',
  component: () => (
    <RequireAuth>
      <ObservationFormPage />
    </RequireAuth>
  ),
});

const observationsDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/observations/$id',
  component: () => (
    <RequireAuth>
      <ObservationDetailPage />
    </RequireAuth>
  ),
});

const kaizenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kaizen',
  component: () => (
    <RequireAuth>
      <KaizenListPage />
    </RequireAuth>
  ),
});

const kaizenNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kaizen/new',
  component: () => (
    <RequireAuth>
      <KaizenFormPage />
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

const managerInactivityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manager/inactivity',
  component: () => (
    <RequireAuth>
      <RequireRole requiredRole="manager">
        <InactivityDashboardPage />
      </RequireRole>
    </RequireAuth>
  ),
});

const managerActivityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manager/activity',
  component: () => (
    <RequireAuth>
      <RequireRole requiredRole="manager">
        <OperatorActivityPage />
      </RequireRole>
    </RequireAuth>
  ),
});

const managerProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manager/profile',
  component: () => (
    <RequireAuth>
      <RequireRole requiredRole="manager">
        <ManagerProfilePage />
      </RequireRole>
    </RequireAuth>
  ),
});

const operatorProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/operator/profile',
  component: () => (
    <RequireAuth>
      <OperatorProfilePage />
    </RequireAuth>
  ),
});

const adminRolesRoute = createRoute({
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

const adminCredentialsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/credentials',
  component: () => (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <CredentialManagementPage />
      </RequireRole>
    </RequireAuth>
  ),
});

const adminMaintenanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/maintenance',
  component: () => (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <MaintenanceModePage />
      </RequireRole>
    </RequireAuth>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  adminSetupRoute,
  maintenanceRoute,
  observationsRoute,
  observationsNewRoute,
  observationsDetailRoute,
  kaizenRoute,
  kaizenNewRoute,
  kaizenDetailRoute,
  managerInactivityRoute,
  managerActivityRoute,
  managerProfileRoute,
  operatorProfileRoute,
  adminRolesRoute,
  adminCredentialsRoute,
  adminMaintenanceRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
