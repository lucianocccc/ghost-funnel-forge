
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

  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current) {
      return;
    }
    
    initializationRef.current = true;
    
    let mounted = true;
    let subscription: any = null;

    const initializeAuthState = async () => {
      try {
        console.log('Starting auth initialization...');
        
        // Set up auth state listener first
        subscription = setupAuthListener();

        // Initialize auth
        if (mounted) {
          await initializeAuth();
        }

      } catch (error) {
        console.error('Error initializing auth state:', error);
        if (mounted) {
          setLoadingState(false);
          setInitializedState(true);
        }
      }
    };

    initializeAuthState();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array to run only once

  // Set loading to false when we have both initialized and profile is loaded (or user doesn't need profile)
  useEffect(() => {
    if (initialized) {
      // If no user, set loading to false
      if (!user) {
        console.log('No user, setting loading to false');
        setLoadingState(false);
        return;
      }
      
      // If user exists but email not confirmed, set loading to false
      if (user && !user.email_confirmed_at) {
        console.log('User email not confirmed, setting loading to false');
        setLoadingState(false);
        return;
      }
      
      // If user exists and email confirmed, wait for profile or set loading to false
      if (user && user.email_confirmed_at) {
        if (profile) {
          console.log('User and profile loaded, setting loading to false');
          setLoadingState(false);
        } else {
          // Give a timeout for profile loading, then set loading to false anyway
          const timeout = setTimeout(() => {
            console.log('Profile loading timeout, setting loading to false anyway');
            setLoadingState(false);
          }, 3000);
          
          return () => clearTimeout(timeout);
        }
      }
    }
  }, [initialized, user, profile, setLoadingState]);

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
