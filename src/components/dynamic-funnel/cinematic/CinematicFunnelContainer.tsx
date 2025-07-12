import React from 'react';
import { StaticCinematicFunnel } from './simplified/StaticCinematicFunnel';

interface CinematicFunnelContainerProps {
  productName: string;
  productDescription?: string;
  targetAudience?: string;
  industry?: string;
  visualStyle?: 'minimal' | 'dynamic' | 'elegant' | 'technical';
  onLeadCapture?: (data: any) => void;
}

export const CinematicFunnelContainer: React.FC<CinematicFunnelContainerProps> = ({
  productName,
  productDescription,
  targetAudience,
  industry,
  visualStyle = 'dynamic',
  onLeadCapture
}) => {
  const productContext = {
    name: productName,
    description: productDescription || `Un prodotto innovativo che rivoluziona il settore con qualità superiore.`,
    targetAudience: targetAudience || 'Clienti che cercano qualità e innovazione',
    industry: industry || 'technology',
    visualStyle
  };

  return (
    <StaticCinematicFunnel
      productContext={productContext}
      onLeadCapture={onLeadCapture}
    />
  );
};