
import React from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import EngagingFunnelPlayer from './engaging/EngagingFunnelPlayer';

interface ProductLandingPageProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

const ProductLandingPage: React.FC<ProductLandingPageProps> = ({ 
  funnel, 
  onComplete 
}) => {
  console.log('ProductLandingPage rendered with funnel:', {
    funnelId: funnel.id,
    name: funnel.name,
    isProductSpecific: funnel.settings?.productSpecific,
    focusType: funnel.settings?.focusType
  });

  // Use the new engaging funnel player for all product-specific funnels
  return (
    <EngagingFunnelPlayer
      funnel={funnel}
      onComplete={onComplete}
    />
  );
};

export default ProductLandingPage;
