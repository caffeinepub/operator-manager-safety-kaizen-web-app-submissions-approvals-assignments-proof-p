// Session storage helper for login intent selection
type LoginIntent = 'operator' | 'manager';

const LOGIN_INTENT_KEY = 'login_intent';

export function setLoginIntent(intent: LoginIntent): void {
  sessionStorage.setItem(LOGIN_INTENT_KEY, intent);
}

export function getLoginIntent(): LoginIntent | null {
  const intent = sessionStorage.getItem(LOGIN_INTENT_KEY);
  if (intent === 'operator' || intent === 'manager') {
    return intent;
  }
  return null;
}

export function clearLoginIntent(): void {
  sessionStorage.removeItem(LOGIN_INTENT_KEY);
}
