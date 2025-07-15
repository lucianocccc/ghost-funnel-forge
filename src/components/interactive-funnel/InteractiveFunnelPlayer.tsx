
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
    isProductSpecific: funnel.settings?.productSpecific,
    focusType: funnel.settings?.focusType
  });

  // Use the new product landing page for product-specific funnels
  const isProductSpecific = funnel.settings?.productSpecific || funnel.settings?.focusType === 'product-centric';
  
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
