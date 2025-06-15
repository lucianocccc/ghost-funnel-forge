
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Caricamento...</span>
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
            <div className="text-xs text-left bg-gray-100 p-2 rounded">
              <strong>Debug Info:</strong><br/>
              Email: {user?.email}<br/>
              Ruolo: {profile?.role || 'Non definito'}<br/>
              Profilo caricato: {profile ? 'Sì' : 'No'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
