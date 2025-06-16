
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile, fetchUserProfile, clearProfile } = useProfile();

  useEffect(() => {
    let mounted = true;
    let profileFetched = false;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'Session exists' : 'No session');
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && !profileFetched) {
          profileFetched = true;
          // Defer profile fetching to prevent deadlocks
          setTimeout(() => {
            if (mounted) {
              fetchUserProfile(session.user.id);
            }
          }, 100);
        } else if (!session) {
          clearProfile();
          profileFetched = false;
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        console.log('Initial session check:', session ? 'Session exists' : 'No session');
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && !profileFetched) {
          profileFetched = true;
          await fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, clearProfile]);

  // Handle loading state updates from profile operations
  useEffect(() => {
    if (profile !== null || (!user && !loading)) {
      setLoading(false);
    }
  }, [profile, user, loading]);

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
