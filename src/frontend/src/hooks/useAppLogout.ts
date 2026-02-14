import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { clearCredentialSession } from '../utils/credentialSession';
import { clearAdminToken } from './useQueries';

/**
 * Centralized logout hook that performs all cleanup operations
 * and navigates to the login page.
 */
export function useAppLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = async () => {
    // Clear credential session
    clearCredentialSession();
    
    // Clear admin token state
    clearAdminToken();
    
    // Clear React Query cache
    queryClient.clear();
    
    // Navigate to login
    navigate({ to: '/login' });
  };

  return { logout };
}
