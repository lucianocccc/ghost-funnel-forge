
import React, { useState } from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import ConsumerFriendlyFunnelPlayer from './components/ConsumerFriendlyFunnelPlayer';
import ProductLandingPage from './ProductLandingPage';

interface InteractiveFunnelPlayerProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

const InteractiveFunnelPlayer: React.FC<InteractiveFunnelPlayerProps> = ({ funnel, onComplete }) => {
  console.log('InteractiveFunnelPlayer rendered with funnel:', {
    funnelId: funnel.id,
    funnelName: funnel.name,
    isPublic: funnel.is_public,
    stepsCount: funnel.interactive_funnel_steps?.length || 0,
    steps: funnel.interactive_funnel_steps,
    isProductSpecific: funnel.settings?.productSpecific,
    focusType: funnel.settings?.focusType,
    shareToken: funnel.share_token
  });

  // Verifica che ci siano degli steps
  if (!funnel.interactive_funnel_steps || funnel.interactive_funnel_steps.length === 0) {
    console.error('No steps available in funnel:', funnel);
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Funnel in costruzione
          </h2>
          <p className="text-gray-600 mb-4">
            Questo funnel non ha ancora contenuti configurati. Torna più tardi quando sarà completo.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Torna Indietro
          </button>
        </div>
      </div>
    );
  }

  // Use the new product landing page for product-specific funnels
  const isProductSpecific = funnel.settings?.productSpecific || funnel.settings?.focusType === 'product-centric';
  
  console.log('Choosing player type:', { isProductSpecific });

  if (isProductSpecific) {
    return (
      <ProductLandingPage
        funnel={funnel}
        onComplete={onComplete}
      />
    );
  }

  // Fall back to the original consumer-friendly version for other funnels
  return (
    <ConsumerFriendlyFunnelPlayer
      funnel={funnel}
      onComplete={onComplete}
    />
  );
};

export default InteractiveFunnelPlayer;
