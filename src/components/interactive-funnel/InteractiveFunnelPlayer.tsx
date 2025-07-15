
import React, { useState } from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import ConsumerFriendlyFunnelPlayer from './components/ConsumerFriendlyFunnelPlayer';

interface InteractiveFunnelPlayerProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

const InteractiveFunnelPlayer: React.FC<InteractiveFunnelPlayerProps> = ({ funnel, onComplete }) => {
  console.log('InteractiveFunnelPlayer rendered with funnel:', {
    funnelId: funnel.id,
    funnelName: funnel.name,
    isPublic: funnel.is_public
  });

  // Always use the consumer-friendly version for better UX
  return (
    <ConsumerFriendlyFunnelPlayer
      funnel={funnel}
      onComplete={onComplete}
    />
  );
};

export default InteractiveFunnelPlayer;
