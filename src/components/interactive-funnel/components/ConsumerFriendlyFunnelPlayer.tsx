
import React from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import { CinematicFunnelPlayer } from '../cinematic/CinematicFunnelPlayer';

interface ConsumerFriendlyFunnelPlayerProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

const ConsumerFriendlyFunnelPlayer: React.FC<ConsumerFriendlyFunnelPlayerProps> = ({ 
  funnel, 
  onComplete 
}) => {
  return (
    <CinematicFunnelPlayer 
      funnel={funnel} 
      onComplete={onComplete} 
    />
  );
};

export default ConsumerFriendlyFunnelPlayer;
