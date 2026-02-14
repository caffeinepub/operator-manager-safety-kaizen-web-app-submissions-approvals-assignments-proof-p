// Session storage helper for credential-based authentication
import { Role } from '../backend';

const CREDENTIAL_SESSION_KEY = 'credential_session';
const MANAGER_ACCESS_DENIED_KEY = 'manager_access_denied';
const ADMIN_ACCESS_DENIED_KEY = 'admin_access_denied';

interface CredentialSession {
  loginId: string;
  role: Role;
  timestamp: number;
}

export function setCredentialSession(loginId: string, role: Role): void {
  const session: CredentialSession = {
    loginId,
    role,
    timestamp: Date.now(),
  };
  sessionStorage.setItem(CREDENTIAL_SESSION_KEY, JSON.stringify(session));
}

export function getCredentialSession(): CredentialSession | null {
  const sessionStr = sessionStorage.getItem(CREDENTIAL_SESSION_KEY);
  if (!sessionStr) return null;
  
  try {
    const session = JSON.parse(sessionStr) as CredentialSession;
    return session;
  } catch {
    return null;
  }
}

export function getCurrentLoginId(): string | null {
  const session = getCredentialSession();
  return session?.loginId || null;
}

export function clearCredentialSession(): void {
  sessionStorage.removeItem(CREDENTIAL_SESSION_KEY);
  sessionStorage.removeItem(MANAGER_ACCESS_DENIED_KEY);
  sessionStorage.removeItem(ADMIN_ACCESS_DENIED_KEY);
}

export function isAuthenticated(): boolean {
  return getCredentialSession() !== null;
}

export function getAuthenticatedRole(): Role | null {
  const session = getCredentialSession();
  return session?.role || null;
}

// Manager access denial message
export function setManagerAccessDenied(): void {
  sessionStorage.setItem(MANAGER_ACCESS_DENIED_KEY, 'true');
}

export function getManagerAccessDenied(): boolean {
  return sessionStorage.getItem(MANAGER_ACCESS_DENIED_KEY) === 'true';
}

export function clearManagerAccessDenied(): void {
  sessionStorage.removeItem(MANAGER_ACCESS_DENIED_KEY);
}

// Admin access denial message
export function setAdminAccessDenied(): void {
  sessionStorage.setItem(ADMIN_ACCESS_DENIED_KEY, 'true');
}

export function getAdminAccessDenied(): boolean {
  return sessionStorage.getItem(ADMIN_ACCESS_DENIED_KEY) === 'true';
}

export function clearAdminAccessDenied(): void {
  sessionStorage.removeItem(ADMIN_ACCESS_DENIED_KEY);
}
