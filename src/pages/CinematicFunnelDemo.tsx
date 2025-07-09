import React from 'react';
import { ProductAwareFunnelContainer } from '@/components/dynamic-funnel/cinematic/enhanced/ProductAwareFunnelContainer';

const CinematicFunnelDemo: React.FC = () => {
  const handleLeadCapture = (data: any) => {
    console.log('Lead captured:', data);
    alert('Grazie per il tuo interesse! I tuoi dati sono stati registrati.');
  };

  const productContext = {
    name: "Innovation Pro",
    description: "Un prodotto rivoluzionario che trasforma la tua esperienza con tecnologia all'avanguardia e design premium.",
    targetAudience: "Professionisti e innovatori",
    industry: "Technology",
    visualStyle: "dynamic" as const
  };

  return (
    <div className="min-h-screen bg-black">
      <ProductAwareFunnelContainer
        productContext={productContext}
        onLeadCapture={handleLeadCapture}
      />
    </div>
  );
};

export default CinematicFunnelDemo;