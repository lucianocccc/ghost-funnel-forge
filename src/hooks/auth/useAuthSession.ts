
import { useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const updateSession = useCallback((newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
  }, []);

  const setLoadingState = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  const setInitializedState = useCallback((isInitialized: boolean) => {
    setInitialized(isInitialized);
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    setUser(null);
    setLoading(false);
  }, []);

  return {
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
  };
};
