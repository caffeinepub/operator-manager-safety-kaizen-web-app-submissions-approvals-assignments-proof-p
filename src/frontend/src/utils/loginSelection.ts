// Utility to map backend credential validation errors to user-safe English messages

export function mapCredentialError(error: any): string {
  let errorMessage = error?.message || String(error);
  
  // Strip common canister trap prefixes to get the actual error message
  // Examples: "Canister trapped: ...", "Call was rejected: ...", "Canister trapped explicitly: ...", etc.
  errorMessage = errorMessage
    .replace(/^Canister trapped explicitly:\s*/i, '')
    .replace(/^Canister trapped:\s*/i, '')
    .replace(/^Call was rejected:\s*/i, '')
    .replace(/^Error:\s*/i, '')
    .replace(/^Reject text:\s*/i, '')
    .trim();
  
  // Check for disabled credential
  if (errorMessage.toLowerCase().includes('disabled')) {
    return 'This Login ID is disabled. Please contact an Admin.';
  }
  
  // Check for role mismatch
  if (errorMessage.includes('Selected role does not match')) {
    // Extract the correct role from the error message if possible
    const roleMatch = errorMessage.match(/Please select '(\w+)'/);
    if (roleMatch && roleMatch[1]) {
      return `Your Login ID does not have ${roleMatch[1]} access. Please select the correct role or contact an Admin.`;
    }
    return 'The selected role does not match your Login ID. Please select the correct role.';
  }
  
  // Check for invalid credentials (catch various forms)
  if (
    errorMessage.toLowerCase().includes('invalid credentials') ||
    errorMessage.toLowerCase().includes('invalid or non-admin') ||
    errorMessage.toLowerCase().includes('invalid')
  ) {
    return 'Invalid Login ID or password.';
  }
  
  // Default fallback for any other errors - don't expose raw backend messages
  return 'Invalid Login ID or password.';
}
