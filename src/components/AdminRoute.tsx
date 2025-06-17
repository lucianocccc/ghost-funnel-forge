
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, loading, profile } = useAuth();

  // Debug logs per capire cosa sta succedendo
  console.log('AdminRoute - Security Check:', {
    user: user ? { 
      id: user.id, 
      email: user.email, 
      emailConfirmed: user.email_confirmed_at,
      lastSignIn: user.last_sign_in_at 
    } : null,
    profile: profile,
    isAdmin,
    loading,
    timestamp: new Date().toISOString()
  });

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSignOut = async () => {
    try {
      console.log('AdminRoute: Forcing complete sign out...');
      await supabase.auth.signOut({ scope: 'global' });
      // Clear all local storage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/auth';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Verifica autenticazione in corso...</span>
        </div>
      </div>
    );
  }

  // CRITICAL SECURITY CHECK: Must have valid user
  if (!user) {
    console.log('AdminRoute: SECURITY VIOLATION - No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // CRITICAL SECURITY CHECK: Email must be confirmed
  if (!user.email_confirmed_at) {
    console.log('AdminRoute: SECURITY VIOLATION - Email not confirmed');
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="bg-white max-w-md w-full">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-black mb-2">Email non confermata</h2>
            <p className="text-gray-600 mb-4">
              Devi confermare la tua email prima di accedere all'area amministrativa.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Controlla la tua casella email e clicca sul link di conferma.
            </p>
            <Button 
              onClick={handleSignOut}
              className="w-full bg-golden hover:bg-yellow-600 text-black"
            >
              Torna al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // CRITICAL SECURITY CHECK: Must have profile loaded
  if (!profile) {
    console.log('AdminRoute: SECURITY VIOLATION - No profile loaded');
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="bg-white max-w-md w-full">
          <CardContent className="text-center py-8">
            <Loader2 className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-black mb-2">Caricamento Profilo</h2>
            <p className="text-gray-600 mb-4">
              Stiamo verificando i tuoi permessi...
            </p>
            <div className="space-y-2">
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Ricarica
              </Button>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="w-full"
              >
                Effettua nuovo accesso
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // CRITICAL SECURITY CHECK: Must be admin
  if (!isAdmin || profile.role !== 'admin') {
    console.log('AdminRoute: SECURITY VIOLATION - User is not admin', { 
      profileRole: profile?.role,
      isAdmin,
      userId: user.id,
      userEmail: user.email
    });
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="bg-white max-w-md w-full">
          <CardContent className="text-center py-8">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-black mb-2">Accesso Negato</h2>
            <p className="text-gray-600 mb-4">
              Non hai i permessi necessari per accedere a questa pagina.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Solo gli amministratori possono accedere a questa sezione.
            </p>
            
            <div className="text-xs text-left bg-gray-100 p-3 rounded mb-4">
              <strong>Informazioni Account:</strong><br/>
              Email: {user?.email}<br/>
              Ruolo: {profile?.role || 'Non definito'}<br/>
              Profilo caricato: {profile ? 'Sì' : 'No'}<br/>
              ID Utente: {user?.id}<br/>
              Email confermata: {user?.email_confirmed_at ? 'Sì' : 'No'}
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleSignOut}
                className="w-full bg-golden hover:bg-yellow-600 text-black"
              >
                Cambia Account
              </Button>
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Ricarica Pagina
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All security checks passed
  console.log('AdminRoute: All security checks passed for admin:', user.email);
  return <>{children}</>;
};

export default AdminRoute;
