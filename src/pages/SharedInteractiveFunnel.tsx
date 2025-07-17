
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useSharedInteractiveFunnelWithRetry } from '@/hooks/useSharedInteractiveFunnelWithRetry';
import InteractiveFunnelPlayer from '@/components/interactive-funnel/InteractiveFunnelPlayer';
import FunnelPreparationState from '@/components/shared-funnel/FunnelPreparationState';
import { Sparkles, CheckCircle, ArrowRight, AlertTriangle, RefreshCw, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ErrorBoundary from '@/components/ErrorBoundary';

const SharedInteractiveFunnel: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
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
  const [completed, setCompleted] = useState(false);

  console.log('🌐 SharedInteractiveFunnel:', {
    shareToken,
    funnel: funnel ? { 
      id: funnel.id, 
      name: funnel.name, 
      isPublic: funnel.is_public,
      stepsCount: funnel.interactive_funnel_steps?.length || 0
    } : null,
    loading,
    error,
    isValidating,
    retryCount,
    hasSteps
  });

  // Validate shareToken
  if (!shareToken) {
    console.error('❌ No shareToken provided in URL');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-white">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Link Non Valido
            </h2>
            <p className="text-gray-600 mb-4">
              Il link che hai seguito non è valido o è malformato.
            </p>
            <Button onClick={() => window.history.back()} className="bg-blue-600 hover:bg-blue-700 text-white">
              Torna Indietro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || isValidating) {
    console.log('⏳ Still loading or validating...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          {isValidating ? (
            <div className="space-y-2">
              <p className="text-gray-600">Preparazione del contenuto in corso...</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Configurazione step interattivi</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Caricamento in corso...</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ Error loading funnel:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-white">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Contenuto non disponibile
            </h2>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <div className="text-sm text-gray-500 mb-6">
              <p>Possibili cause:</p>
              <ul className="mt-2 text-left space-y-1">
                <li>• Il funnel non è stato reso pubblico</li>
                <li>• Il link di condivisione è scaduto</li>
                <li>• Il funnel è stato rimosso</li>
                <li>• Errore di connessione</li>
              </ul>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.history.back()} variant="outline" className="border-gray-300 text-gray-700">
                Torna Indietro
              </Button>
              <Button onClick={retryLoadFunnel} className="bg-blue-600 hover:bg-blue-700 text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Ricarica
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!funnel) {
    console.error('❌ No funnel data received');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-white">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Funnel Non Trovato
            </h2>
            <p className="text-gray-600 mb-4">
              Il funnel che stai cercando non esiste o non è disponibile pubblicamente.
            </p>
            <Button onClick={() => window.history.back()} className="bg-blue-600 hover:bg-blue-700 text-white">
              Torna Indietro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se il funnel non ha step validi, mostra lo stato di preparazione
  if (!hasSteps) {
    console.warn('⚠️ Funnel has no valid steps, showing preparation state');
    
    return (
      <FunnelPreparationState
        funnelId={funnel.id}
        funnelName={funnel.name}
        onRetry={retryLoadFunnel}
        retryCount={retryCount}
        maxRetries={maxRetries}
      />
    );
  }

  const customerSettings = funnel.settings?.customer_facing;

  const handleComplete = () => {
    try {
      console.log('🎉 Funnel completed successfully');
      setCompleted(true);
    } catch (err) {
      console.error('❌ Error completing funnel:', err);
    }
  };

  if (completed) {
    console.log('✅ Showing completion screen');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto text-center bg-white">
          <CardContent className="py-12 px-8">
            <div className="text-6xl mb-6">🎉</div>
            <CheckCircle 
              className="w-16 h-16 mx-auto mb-6 text-green-500"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Perfetto! Abbiamo ricevuto le tue informazioni
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Grazie per aver completato il nostro questionario. Ti contatteremo presto con una proposta personalizzata!
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Sparkles className="w-4 h-4" />
              <span>Le tue informazioni sono al sicuro con noi</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('🎬 About to render main funnel interface');

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 rounded-full bg-blue-100">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              {customerSettings?.hero_title || funnel.name}
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              {customerSettings?.hero_subtitle || funnel.description}
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <ArrowRight className="w-4 h-4" />
              <span>Ci vorranno solo pochi minuti</span>
            </div>
          </div>
        </div>

        {/* Funnel Player */}
        <InteractiveFunnelPlayer 
          funnel={funnel} 
          onComplete={handleComplete}
        />

        {/* Trust Indicators */}
        <div className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>100% Sicuro</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Dati Protetti</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Nessun Spam</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SharedInteractiveFunnel;
