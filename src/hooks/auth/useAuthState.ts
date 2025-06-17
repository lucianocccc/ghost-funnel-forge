
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { profile, loading: profileLoading, fetchUserProfile, clearProfile } = useProfile();

  useEffect(() => {
    let mounted = true;
    let profileFetched = false;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? `Session exists for ${session.user.email}` : 'No session');
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && !profileFetched) {
          console.log('User signed in, fetching profile...');
          profileFetched = true;
          // Defer profile fetching to prevent deadlocks
          setTimeout(() => {
            if (mounted && !profileLoading) {
              fetchUserProfile(session.user.id);
            }
          }, 100);
        } else if (!session) {
          console.log('No session, clearing profile...');
          profileFetched = false;
          clearProfile();
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    // Check for existing session only once
    const initializeAuth = async () => {
      if (initialized) return;
      
      try {
        console.log('Initializing auth state...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }
        
        console.log('Initial session check:', session ? `Session exists for ${session.user.email}` : 'No session');
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setInitialized(true);
        
        if (session?.user && !profileFetched) {
          console.log('Existing session found, fetching profile...');
          profileFetched = true;
          await fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, clearProfile, initialized, profileLoading]);

  // Handle loading state updates - only when profile loading changes
  useEffect(() => {
    if (initialized && !profileLoading && (profile !== null || !user)) {
      setLoading(false);
    }
  }, [profile, profileLoading, user, initialized]);

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
