
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

interface UseAuthInitializationProps {
  initialized: boolean;
  user: any;
  loading: boolean;
  updateSession: (session: any) => void;
  setLoadingState: (loading: boolean) => void;
  setInitializedState: (initialized: boolean) => void;
  clearSession: () => void;
}

export const useAuthInitialization = ({
  initialized,
  user,
  loading,
  updateSession,
  setLoadingState,
  setInitializedState,
  clearSession
}: UseAuthInitializationProps) => {
  const { profile, loading: profileLoading, fetchUserProfile, clearProfile } = useProfile();

  const initializeAuth = useCallback(async () => {
    if (initialized) {
      console.log('Auth already initialized, skipping...');
      return;
    }
    
    try {
      console.log('Starting auth initialization...');
      setLoadingState(true);
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session during init:', error);
        clearSession();
        setInitializedState(true);
        setLoadingState(false);
        return;
      }
      
      console.log('Initial session check:', session ? `Session exists for ${session.user.email}` : 'No session found');
      
      // Update session state
      updateSession(session);
      setInitializedState(true);
      
      // Handle profile loading for confirmed users
      if (session?.user?.email_confirmed_at) {
        console.log('User email confirmed, fetching profile...');
        // Use a small delay to prevent potential conflicts
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 100);
      } else {
        console.log('No confirmed user, setting loading to false');
        setLoadingState(false);
      }
    } catch (error) {
      console.error('Unexpected error during auth initialization:', error);
      clearSession();
      setInitializedState(true);
      setLoadingState(false);
    }
  }, [initialized, updateSession, setLoadingState, setInitializedState, clearSession, fetchUserProfile]);

  const setupAuthListener = useCallback(() => {
    console.log('Setting up auth state change listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change detected:', event, session ? `Session for ${session.user.email}` : 'No session');
        
        // Handle sign out or no session
        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out or session cleared');
          updateSession(null);
          clearProfile();
          setLoadingState(false);
          return;
        }

        // Handle sign in
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('User signed in or token refreshed');
          updateSession(session);
          
          // Only fetch profile for confirmed users
          if (session.user?.email_confirmed_at) {
            console.log('Fetching profile for confirmed user...');
            // Delay to prevent deadlock
            setTimeout(() => {
              fetchUserProfile(session.user.id);
            }, 100);
          } else {
            console.log('User email not confirmed, skipping profile fetch');
            setLoadingState(false);
          }
        }
      }
    );

    return subscription;
  }, [updateSession, clearProfile, setLoadingState, fetchUserProfile]);

  // Handle loading state when profile operations complete
  useEffect(() => {
    if (initialized && !profileLoading) {
      // If we have a user but no profile after loading attempt, still set loading to false
      if (user && user.email_confirmed_at && !profile) {
        console.log('Profile loading completed but no profile found, continuing anyway');
        setTimeout(() => setLoadingState(false), 500);
      } else if (user && user.email_confirmed_at && profile) {
        console.log('User and profile both loaded successfully');
        setLoadingState(false);
      } else if (!user) {
        console.log('No user, loading complete');
        setLoadingState(false);
      }
    }
  }, [initialized, user, profile, profileLoading, setLoadingState]);

  return {
    profile,
    initializeAuth,
    setupAuthListener,
    clearProfile
  };
};
