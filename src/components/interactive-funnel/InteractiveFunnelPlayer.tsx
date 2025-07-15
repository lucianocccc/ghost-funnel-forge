
import React, { useState } from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import ConsumerFriendlyFunnelPlayer from './components/ConsumerFriendlyFunnelPlayer';
import EngagingFunnelPlayer from './engaging/EngagingFunnelPlayer';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InteractiveFunnelPlayerProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

const InteractiveFunnelPlayer: React.FC<InteractiveFunnelPlayerProps> = ({ funnel, onComplete }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  console.log('InteractiveFunnelPlayer rendered with funnel:', {
    funnelId: funnel.id,
    funnelName: funnel.name,
    isPublic: funnel.is_public,
    stepsCount: funnel.interactive_funnel_steps?.length || 0,
    steps: funnel.interactive_funnel_steps,
    isProductSpecific: funnel.settings?.productSpecific,
    focusType: funnel.settings?.focusType,
    shareToken: funnel.share_token,
    settings: funnel.settings
  });

  // Validate funnel structure
  if (!funnel || !funnel.id) {
    console.error('Invalid funnel structure:', funnel);
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

  // Validate that steps exist and are properly formatted
  if (!funnel.interactive_funnel_steps || !Array.isArray(funnel.interactive_funnel_steps)) {
    console.error('Invalid or missing funnel steps:', funnel.interactive_funnel_steps);
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Funnel Non Configurato
            </h2>
            <p className="text-gray-600 mb-4">
              Questo funnel non ha step configurati o la configurazione non è valida.
            </p>
            <Button onClick={() => window.history.back()}>
              Torna Indietro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if steps array is empty
  if (funnel.interactive_funnel_steps.length === 0) {
    console.warn('Funnel has no steps:', funnel);
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Funnel Vuoto
            </h2>
            <p className="text-gray-600 mb-4">
              Questo funnel non contiene ancora contenuti. Torna più tardi quando sarà completo.
            </p>
            <Button onClick={() => window.history.back()}>
              Torna Indietro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error boundary for rendering issues
  if (hasError) {
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

  // Determine which player to use based on funnel settings
  const isProductSpecific = funnel.settings?.productSpecific || funnel.settings?.focusType === 'product-centric';
  const useEngagingPlayer = true; // Always use the new engaging player for better UX
  
  console.log('Choosing player type:', { 
    isProductSpecific,
    useEngagingPlayer,
    settings: funnel.settings,
    productSpecific: funnel.settings?.productSpecific,
    focusType: funnel.settings?.focusType
  });

  try {
    if (useEngagingPlayer) {
      return (
        <EngagingFunnelPlayer
          funnel={funnel}
          onComplete={onComplete}
        />
      );
    }

    // Fall back to the original consumer-friendly version for compatibility
    return (
      <ConsumerFriendlyFunnelPlayer
        funnel={funnel}
        onComplete={onComplete}
      />
    );
  } catch (error) {
    console.error('Error rendering funnel player:', error);
    setHasError(true);
    setErrorMessage(error instanceof Error ? error.message : 'Errore sconosciuto');
    return null;
  }
};

export default InteractiveFunnelPlayer;
