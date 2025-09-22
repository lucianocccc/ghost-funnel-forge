
import React from 'react';
import { useAuthState } from './auth/useAuthState';
import { signIn, signUp, signOut } from './auth/authOperations';

export const useAuth = () => {
  const { user, session, profile, loading, setUser, setSession, clearProfile } = useAuthState();

  const handleSignOut = async () => {
    try {
      console.log('Signing out user...');
      const { error } = await signOut();
      if (!error) {
        setUser(null);
        setSession(null);
        clearProfile();
      }
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  const isAdmin = profile?.role === 'admin';

  // Debug logging
  console.log('useAuth state:', {
    user: user ? { id: user.id, email: user.email } : null,
    profile,
    isAdmin,
    loading
  });

  return {
    user,
    session,
    profile,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut: handleSignOut,
  };
};
