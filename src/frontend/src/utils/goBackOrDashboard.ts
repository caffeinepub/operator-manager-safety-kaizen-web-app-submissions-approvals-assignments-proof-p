import { useNavigate } from '@tanstack/react-router';

/**
 * Navigation helper that attempts to go back in browser history.
 * If there is no usable history, navigates to the main Dashboard (/).
 */
export function useGoBackOrDashboard() {
  const navigate = useNavigate();

  const goBackOrDashboard = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to dashboard
      navigate({ to: '/' });
    }
  };

  return { goBackOrDashboard };
}
