
import { useEffect } from 'react';

interface UseAuthRedirectProps {
  loading: boolean;
  user: any;
  profile: any;
}

export const useAuthRedirect = ({ loading, user, profile }: UseAuthRedirectProps) => {
  useEffect(() => {
    console.log('AuthRedirect check:', { loading, user: !!user, profile: !!profile, currentPath: window.location.pathname });
    
    // Force redirect if user is authenticated regardless of email confirmation
    if (!loading && user && profile) {
      console.log('Auth page: Authenticated user detected, forcing redirect...', {
        userEmail: user.email,
        profileRole: profile.role,
        emailConfirmed: user.email_confirmed_at || 'NOT_CONFIRMED'
      });
      
      // Force immediate redirect
      console.log('Auth page: FORCING redirect to dashboard NOW');
      window.location.replace('/dashboard');
      return;
    }
    
    // Also check if we're stuck on auth page when we should be redirected
    if (!loading && user && profile && window.location.pathname === '/auth') {
      console.log('Auth page: User is authenticated but stuck on auth page, forcing redirect');
      window.location.replace('/dashboard');
    }
  }, [user, profile, loading]);
};
