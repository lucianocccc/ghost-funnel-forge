
import { useEffect, useRef, useState } from 'react';
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
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    // Previeni l'inizializzazione multipla
    if (initializationRef.current || isInitializing) {
      return;
    }
    
    initializationRef.current = true;
    setIsInitializing(true);
    
    let mounted = true;

    const initializeAuthState = async () => {
      try {
        // Set up auth state listener
        const subscription = setupAuthListener();

        // Initialize auth
        if (mounted) {
          await initializeAuth();
        }

        return subscription;
      } catch (error) {
        console.error('Error initializing auth state:', error);
        if (mounted) {
          setLoadingState(false);
          setInitializedState(true);
        }
        return null;
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    const subscriptionPromise = initializeAuthState();

    return () => {
      mounted = false;
      subscriptionPromise.then(subscription => {
        if (subscription) {
          subscription.unsubscribe();
        }
      });
    };
  }, []); // Array vuoto per evitare re-inizializzazioni

  return {
    user,
    session,
    profile,
    loading: loading || isInitializing,
    setUser,
    setSession,
    clearProfile
  };
};
