
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
    if (initialized) return;
    
    try {
      console.log('Initializing auth state...');
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        clearSession();
        setInitializedState(true);
        return;
      }
      
      console.log('Initial session check:', session ? `Session exists for ${session.user.email}` : 'No session');
      
      updateSession(session);
      setInitializedState(true);
      
      // Only fetch profile if user is confirmed and we don't have one yet
      if (session?.user?.email_confirmed_at && !profile && !profileLoading) {
        console.log('Fetching profile for confirmed user...');
        fetchUserProfile(session.user.id);
      } else {
        setLoadingState(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearSession();
      setInitializedState(true);
    }
  }, [initialized, profile, profileLoading, updateSession, setLoadingState, setInitializedState, clearSession, fetchUserProfile]);

  const setupAuthListener = useCallback(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? `Session exists for ${session.user.email}` : 'No session');
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out or no session');
          updateSession(null);
          clearProfile();
          setLoadingState(false);
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in successfully');
          updateSession(session);
          
          // Fetch profile if user is confirmed
          if (session.user.email_confirmed_at) {
            console.log('User email confirmed, fetching profile...');
            setTimeout(() => {
              fetchUserProfile(session.user.id);
            }, 100);
          } else {
            console.log('User email not confirmed');
            setLoadingState(false);
          }
        } else if (session) {
          updateSession(session);
          
          // Handle existing session
          if (session.user?.email_confirmed_at && !profile && !profileLoading) {
            setTimeout(() => {
              fetchUserProfile(session.user.id);
            }, 100);
          } else {
            setLoadingState(false);
          }
        }
      }
    );

    return subscription;
  }, [updateSession, clearProfile, setLoadingState, fetchUserProfile, profile, profileLoading]);

  // Handle profile loading completion
  useEffect(() => {
    if (initialized && !profileLoading) {
      // Only set loading to false if we have a profile or user doesn't need one
      if (profile || !user || !user.email_confirmed_at) {
        setLoadingState(false);
      }
    }
  }, [profile, profileLoading, user, initialized, setLoadingState]);

  return {
    profile,
    initializeAuth,
    setupAuthListener,
    clearProfile
  };
};
