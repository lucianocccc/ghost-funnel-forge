
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, loading, profile } = useAuth();

  // Debug logs per capire cosa sta succedendo
  console.log('AdminRoute - Debug Info:', {
    user: user ? { id: user.id, email: user.email } : null,
    profile: profile,
    isAdmin,
    loading
  });

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Caricamento profilo utente...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('AdminRoute: Utente non autenticato, reindirizzamento a /auth');
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    console.log('AdminRoute: Utente non è admin', { 
      profileRole: profile?.role,
      isAdmin 
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
              <strong>Debug Info:</strong><br/>
              Email: {user?.email}<br/>
              Ruolo: {profile?.role || 'Non definito'}<br/>
              Profilo caricato: {profile ? 'Sì' : 'No'}<br/>
              ID Utente: {user?.id}
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleRefresh}
                className="w-full bg-golden hover:bg-yellow-600 text-black"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Ricarica Pagina
              </Button>
              <Button 
                onClick={() => window.location.href = '/auth'}
                variant="outline"
                className="w-full"
              >
                Vai al Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
