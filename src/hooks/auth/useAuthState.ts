
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
        
        // Handle different auth events
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
          console.log('User signed out or session expired');
          setSession(null);
          setUser(null);
          clearProfile();
          profileFetched = false;
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in successfully');
          
          // CRITICAL: Verify session is valid by making an authenticated request
          try {
            const { data: testData, error: testError } = await supabase
              .from('profiles')
              .select('*')
              .limit(1);

            if (testError) {
              console.error('Session validation failed:', testError);
              await supabase.auth.signOut({ scope: 'global' });
              setSession(null);
              setUser(null);
              clearProfile();
              setLoading(false);
              return;
            }

            console.log('Session validated successfully');
            setSession(session);
            setUser(session.user);
            
            // Only fetch profile if user is confirmed
            if (session.user.email_confirmed_at && !profileFetched) {
              console.log('User email confirmed, fetching profile...');
              profileFetched = true;
              // Defer profile fetching to prevent deadlocks
              setTimeout(() => {
                if (mounted && !profileLoading) {
                  fetchUserProfile(session.user.id);
                }
              }, 100);
            } else if (!session.user.email_confirmed_at) {
              console.log('User email not confirmed, clearing profile');
              clearProfile();
              setLoading(false);
            }
          } catch (error) {
            console.error('Session validation error:', error);
            await supabase.auth.signOut({ scope: 'global' });
            setSession(null);
            setUser(null);
            clearProfile();
            setLoading(false);
          }
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user && session.user.email_confirmed_at && !profileFetched) {
            console.log('Existing confirmed session, fetching profile...');
            profileFetched = true;
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
        
        if (session) {
          // CRITICAL: Validate session by making authenticated request
          try {
            const { data: testData, error: testError } = await supabase
              .from('profiles')
              .select('*')
              .limit(1);

            if (testError) {
              console.error('Initial session validation failed:', testError);
              await supabase.auth.signOut({ scope: 'global' });
              setSession(null);
              setUser(null);
              setLoading(false);
              setInitialized(true);
              return;
            }

            console.log('Initial session validated successfully');
            setSession(session);
            setUser(session.user);
            
            if (session.user.email_confirmed_at && !profileFetched) {
              console.log('Existing confirmed session found, fetching profile...');
              profileFetched = true;
              await fetchUserProfile(session.user.id);
            } else {
              setLoading(false);
            }
          } catch (error) {
            console.error('Initial session validation error:', error);
            await supabase.auth.signOut({ scope: 'global' });
            setSession(null);
            setUser(null);
            setLoading(false);
            setInitialized(true);
          }
        } else {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
        
        setInitialized(true);
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
    if (initialized && !profileLoading && (profile !== null || !user || !user.email_confirmed_at)) {
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
