
import { useEffect } from 'react';
import { useAuthSession } from './useAuthSession';
import { useAuthInitialization } from './useAuthInitialization';

export const useAuthState = () => {
  const {
    user,
    session,
    loading,
    initialized,
    setUser,
    setSession,
    updateSession,
    setLoadingState,
    setInitializedState,
    clearSession
  } = useAuthSession();

  const {
    profile,
    initializeAuth,
    setupAuthListener,
    clearProfile
  } = useAuthInitialization({
    initialized,
    user,
    loading,
    updateSession,
    setLoadingState,
    setInitializedState,
    clearSession
  });

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const subscription = setupAuthListener();

    // Initialize auth
    if (mounted) {
      initializeAuth();
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove all dependencies to prevent re-initialization

  return {
    user,
    session,
    profile,
    loading,
    setUser,
    setSession,
    clearProfile
  };
};
