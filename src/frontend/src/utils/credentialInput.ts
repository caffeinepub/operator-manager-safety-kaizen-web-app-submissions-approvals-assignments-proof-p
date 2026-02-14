// Utility for credential input normalization and validation

/**
 * Trims leading and trailing whitespace from a credential field
 */
export function trimCredentialField(value: string): string {
  return value.trim();
}

/**
 * Validates that a credential field is not empty or whitespace-only
 * Returns an error message if invalid, or null if valid
 */
export function validateCredentialField(value: string, fieldName: string): string | null {
  const trimmed = trimCredentialField(value);
  
  if (trimmed.length === 0) {
    return `${fieldName} is required`;
  }
  
  return null;
}

/**
 * Validates Login ID and Password fields together
 * Returns an error message if invalid, or null if valid
 */
export function validateCredentials(loginId: string, password: string): string | null {
  const loginIdError = validateCredentialField(loginId, 'Login ID');
  if (loginIdError) return loginIdError;
  
  const passwordError = validateCredentialField(password, 'Password');
  if (passwordError) return passwordError;
  
  return null;
}
