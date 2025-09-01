
import React, { useState } from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import ConsumerFriendlyFunnelPlayer from './components/ConsumerFriendlyFunnelPlayer';
import ImmersiveEngagingFunnelPlayer from './engaging/ImmersiveEngagingFunnelPlayer';
import { CinematicFunnelPlayer } from './cinematic/CinematicFunnelPlayer';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Wrench, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InteractiveFunnelPlayerProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

const InteractiveFunnelPlayer: React.FC<InteractiveFunnelPlayerProps> = ({ funnel, onComplete }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  console.log('🎬 InteractiveFunnelPlayer START:', {
    funnelId: funnel?.id,
    funnelName: funnel?.name,
    isPublic: funnel?.is_public,
    stepsCount: funnel?.interactive_funnel_steps?.length || 0,
    steps: funnel?.interactive_funnel_steps,
    isProductSpecific: funnel?.settings?.productSpecific,
    focusType: funnel?.settings?.focusType,
    shareToken: funnel?.share_token,
    settings: funnel?.settings
  });

  // Validate funnel structure
  if (!funnel || !funnel.id) {
    console.error('❌ Invalid funnel structure:', funnel);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Funnel Non Valido
            </h2>
            <p className="text-gray-600 mb-4">
              La struttura del funnel non è valida. Per favore verifica la configurazione.
            </p>
            <Button onClick={() => window.history.back()}>
              Torna Indietro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Enhanced validation for steps
  const hasValidSteps = funnel.interactive_funnel_steps && 
                       Array.isArray(funnel.interactive_funnel_steps) && 
                       funnel.interactive_funnel_steps.length > 0;

  if (!hasValidSteps) {
    console.warn('⚠️ Funnel has no valid steps:', {
      funnelId: funnel.id,
      funnelName: funnel.name,
      steps: funnel.interactive_funnel_steps,
      stepsType: typeof funnel.interactive_funnel_steps
    });
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <Card className="max-w-lg mx-auto">
          <CardContent className="text-center py-8">
            <Wrench className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Funnel in Configurazione
            </h2>
            <p className="text-gray-600 mb-4">
              Il funnel "{funnel.name}" è attualmente in fase di configurazione e non ha ancora step interattivi disponibili.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-orange-800 mb-2">Cosa stiamo preparando:</h3>
              <ul className="text-left text-orange-700 text-sm space-y-1">
                <li>• Step interattivi personalizzati</li>
                <li>• Contenuti coinvolgenti</li>
                <li>• Esperienza utente ottimizzata</li>
                <li>• Test di qualità e funzionalità</li>
              </ul>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.history.back()} variant="outline">
                Torna Indietro
              </Button>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Ricarica Pagina
              </Button>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>Riprova tra qualche minuto o contattaci se il problema persiste</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error boundary for rendering issues
  if (hasError) {
    console.error('❌ Component in error state:', errorMessage);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Errore di Rendering
            </h2>
            <p className="text-gray-600 mb-4">
              {errorMessage || 'Si è verificato un errore nel caricamento del funnel.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.history.back()} variant="outline">
                Torna Indietro
              </Button>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Ricarica
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use the new cinematic scroll-based player for all funnels
  console.log('🎬 Using CinematicFunnelPlayer for Apple-like scroll experience');
  
  try {
    return (
      <CinematicFunnelPlayer
        funnel={funnel}
        onComplete={onComplete}
      />
    );
  } catch (error) {
    console.error('❌ Error rendering cinematic funnel player:', error);
    setHasError(true);
    setErrorMessage(error instanceof Error ? error.message : 'Errore sconosciuto');
    return null;
  }
};

export default InteractiveFunnelPlayer;
