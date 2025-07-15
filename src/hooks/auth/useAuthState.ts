
import { useEffect, useRef } from 'react';
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

  const initializationRef = useRef(false);

  useEffect(() => {
    // Previeni l'inizializzazione multipla
    if (initializationRef.current) {
      return;
    }
    
    initializationRef.current = true;
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
  }, []); // Array vuoto per evitare re-inizializzazioni

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
