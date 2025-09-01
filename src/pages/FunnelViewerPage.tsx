
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSharedInteractiveFunnelWithRetry } from '@/hooks/useSharedInteractiveFunnelWithRetry';
import InteractiveFunnelPlayer from '@/components/interactive-funnel/InteractiveFunnelPlayer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2,
  ArrowLeft,
  Heart
} from 'lucide-react';

const FunnelViewerPage = () => {
  const { shareToken } = useParams();
  const [completed, setCompleted] = useState(false);

  const {
    funnel,
    loading,
    error,
    isValidating,
    retryCount,
    maxRetries,
    retryLoadFunnel,
    hasSteps
  } = useSharedInteractiveFunnelWithRetry(shareToken);

  // Handle completion
  const handleComplete = () => {
    setCompleted(true);
  };

  // Handle invalid share token
  if (!shareToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Link Non Valido</h3>
            <p className="text-muted-foreground mb-6">
              Il link che hai seguito non è valido o è scaduto.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-primary hover:bg-primary/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state with validation indicator
  if (loading || isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              {isValidating && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse" />
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {isValidating ? 'Preparazione Funnel...' : 'Caricamento...'}
            </h3>
            <p className="text-muted-foreground">
              {isValidating 
                ? 'Stiamo preparando la migliore esperienza per te' 
                : 'Caricamento del funnel in corso...'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Errore di Caricamento</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            
            {retryCount < maxRetries && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Tentativo {retryCount + 1} di {maxRetries + 1}
                </p>
                <Button 
                  onClick={retryLoadFunnel}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Riprova
                </Button>
              </div>
            )}
            
            <Button 
              onClick={() => window.location.href = '/'}
              variant="ghost"
              className="w-full mt-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Funnel not found
  if (!funnel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Funnel Non Trovato</h3>
            <p className="text-muted-foreground mb-6">
              Questo funnel non è disponibile o è stato reso privato.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-primary hover:bg-primary/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Funnel preparation state (no valid steps)
  if (!hasSteps) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-500" />
              <div className="absolute -top-1 -right-1">
                <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Funnel in Preparazione</h3>
            <p className="text-muted-foreground mb-6">
              Questo funnel sta ancora completando la sua configurazione. 
              Riprova tra qualche minuto.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={retryLoadFunnel}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Riprova Ora
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="ghost"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna alla Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completion state
  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Grazie!</h3>
            <p className="text-muted-foreground mb-6">
              La tua richiesta è stata inviata con successo. Ci metteremo in contatto con te presto.
            </p>
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Ricomincia
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="ghost"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna alla Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main funnel player with all advanced features
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      <InteractiveFunnelPlayer
        funnel={funnel as any} // Temporary type casting - data structure is compatible
        onComplete={handleComplete}
      />
    </div>
  );
};

export default FunnelViewerPage;
