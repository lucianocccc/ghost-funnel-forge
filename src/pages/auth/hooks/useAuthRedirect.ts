
import { useEffect } from 'react';

interface UseAuthRedirectProps {
  loading: boolean;
  user: any;
  profile: any;
}

export const useAuthRedirect = ({ loading, user, profile }: UseAuthRedirectProps) => {
  useEffect(() => {
    console.log('AuthRedirect check:', { loading, user: !!user, profile: !!profile, currentPath: window.location.pathname });
    
    // Redirect if user is authenticated, even if profile is still loading
    if (!loading && user) {
      console.log('Auth page: Authenticated user detected, redirecting...', {
        userEmail: user.email,
        hasProfile: !!profile,
        emailConfirmed: user.email_confirmed_at || 'NOT_CONFIRMED'
      });
      
      console.log('Auth page: Redirecting to dashboard');
      window.location.replace('/dashboard');
      return;
    }
    
    // Safety timeout - if user exists but we're still on auth page after 3 seconds, force redirect
    if (user && window.location.pathname === '/auth') {
      const timeoutId = setTimeout(() => {
        console.log('Auth page: Safety timeout - forcing redirect for authenticated user');
        window.location.replace('/dashboard');
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [user, profile, loading]);
};
