// Session storage helper for login intent selection
type LoginIntent = 'operator' | 'manager' | 'admin';

const LOGIN_INTENT_KEY = 'login_intent';
const MANAGER_ACCESS_DENIED_KEY = 'manager_access_denied';
const ADMIN_ACCESS_DENIED_KEY = 'admin_access_denied';

export function setLoginIntent(intent: LoginIntent): void {
  sessionStorage.setItem(LOGIN_INTENT_KEY, intent);
}

export function getLoginIntent(): LoginIntent | null {
  const intent = sessionStorage.getItem(LOGIN_INTENT_KEY);
  if (intent === 'operator' || intent === 'manager' || intent === 'admin') {
    return intent;
  }
  return null;
}

export function clearLoginIntent(): void {
  sessionStorage.removeItem(LOGIN_INTENT_KEY);
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
