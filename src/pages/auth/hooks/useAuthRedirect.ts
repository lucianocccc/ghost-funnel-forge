
import { useEffect } from 'react';

interface UseAuthRedirectProps {
  loading: boolean;
  user: any;
  profile: any;
}

export const useAuthRedirect = ({ loading, user, profile }: UseAuthRedirectProps) => {
  useEffect(() => {
    // Only redirect if we have a valid, confirmed user with profile and not loading
    if (!loading && user && user.email_confirmed_at && profile) {
      console.log('Auth page: Authenticated user detected, redirecting...', {
        userEmail: user.email,
        profileRole: profile.role,
        emailConfirmed: user.email_confirmed_at
      });
      
      // Use a small delay to ensure the auth state is fully settled
      setTimeout(() => {
        // Redirect based on role
        if (profile.role === 'admin') {
          console.log('Auth page: Admin user, redirecting to /admin');
          window.location.href = '/admin';
        } else {
          console.log('Auth page: Regular user, redirecting to home');
          window.location.href = '/';
        }
      }, 100);
    }
  }, [user, profile, loading]);
};
