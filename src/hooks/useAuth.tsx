
import { useAuthState } from './auth/useAuthState';
import { signIn, signUp, signOut } from './auth/authOperations';

export const useAuth = () => {
  const { user, session, profile, loading, setUser, setSession, clearProfile } = useAuthState();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      clearProfile();
    }
    return { error };
  };

  const isAdmin = profile?.role === 'admin';

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
