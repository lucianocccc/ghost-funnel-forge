
import { supabase } from '@/integrations/supabase/client';

export const cleanupAuthState = () => {
  try {
    console.log('Cleaning up auth state...');
    
    // Remove all Supabase auth keys from localStorage
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.startsWith('supabase.auth.') || 
      key.includes('sb-') ||
      key.includes('supabase-auth')
    );
    
    keysToRemove.forEach(key => {
      console.log('Removing localStorage key:', key);
      localStorage.removeItem(key);
    });

    // Also try sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      const sessionKeysToRemove = Object.keys(sessionStorage).filter(key => 
        key.startsWith('supabase.auth.') || 
        key.includes('sb-') ||
        key.includes('supabase-auth')
      );
      
      sessionKeysToRemove.forEach(key => {
        console.log('Removing sessionStorage key:', key);
        sessionStorage.removeItem(key);
      });
    }

    console.log('Auth state cleanup completed');
  } catch (error) {
    console.error('Error during auth state cleanup:', error);
  }
};

export const forceAuthReset = async () => {
  try {
    console.log('Forcing complete auth reset...');
    
    // Clean up state
    cleanupAuthState();
    
    // Force global sign out
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.log('Sign out error during reset (expected):', err);
    }
    
    // Additional cleanup - remove any remaining auth-related items
    ['supabase.auth.token', 'supabase.auth.refreshToken', 'supabase.auth.user'].forEach(key => {
      localStorage.removeItem(key);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('Complete auth reset finished');
    return true;
  } catch (error) {
    console.error('Error during force auth reset:', error);
    return false;
  }
};
