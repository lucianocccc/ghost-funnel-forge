/**
 * Utility per pulire completamente lo stato di autenticazione
 * Risolve problemi di "limbo" states e credenziali non valide
 */

export const cleanupAuthState = () => {
  console.log('🧹 Cleaning up auth state...');
  
  try {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        console.log('Removing localStorage key:', key);
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          console.log('Removing sessionStorage key:', key);
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('✅ Auth state cleanup completed');
  } catch (error) {
    console.error('❌ Error during auth cleanup:', error);
  }
};

export const forceSignOut = async () => {
  console.log('🚪 Force sign out...');
  
  try {
    // First cleanup the state
    cleanupAuthState();
    
    // Import supabase dynamically to avoid circular imports
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Attempt global sign out (ignore errors)
    try {
      await supabase.auth.signOut({ scope: 'global' });
      console.log('✅ Global sign out successful');
    } catch (err) {
      console.log('⚠️ Global sign out failed, continuing...');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error during force sign out:', error);
    return false;
  }
};

export const refreshAuthState = () => {
  console.log('🔄 Refreshing auth state...');
  
  // Force a complete page reload to ensure clean state
  window.location.href = window.location.pathname;
};