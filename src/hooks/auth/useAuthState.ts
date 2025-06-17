
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

    const initializeAuth = async () => {
      if (initialized) return;
      
      try {
        console.log('Initializing auth state...');
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
            setInitialized(true);
          }
          return;
        }
        
        console.log('Initial session check:', session ? `Session exists for ${session.user.email}` : 'No session');
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setInitialized(true);
          
          // Only fetch profile if user is confirmed and we don't have one yet
          if (session?.user?.email_confirmed_at && !profile && !profileLoading) {
            console.log('Fetching profile for confirmed user...');
            fetchUserProfile(session.user.id);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? `Session exists for ${session.user.email}` : 'No session');
        
        if (!mounted) return;
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out or no session');
          setSession(null);
          setUser(null);
          clearProfile();
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in successfully');
          setSession(session);
          setUser(session.user);
          
          // Fetch profile if user is confirmed
          if (session.user.email_confirmed_at) {
            console.log('User email confirmed, fetching profile...');
            setTimeout(() => {
              if (mounted) {
                fetchUserProfile(session.user.id);
              }
            }, 100);
          } else {
            console.log('User email not confirmed');
            setLoading(false);
          }
        } else if (session) {
          setSession(session);
          setUser(session.user);
          
          // Handle existing session
          if (session.user?.email_confirmed_at && !profile && !profileLoading) {
            setTimeout(() => {
              if (mounted) {
                fetchUserProfile(session.user.id);
              }
            }, 100);
          } else {
            setLoading(false);
          }
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove all dependencies to prevent re-initialization

  // Handle profile loading completion
  useEffect(() => {
    if (initialized && !profileLoading) {
      // Only set loading to false if we have a profile or user doesn't need one
      if (profile || !user || !user.email_confirmed_at) {
        setLoading(false);
      }
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
