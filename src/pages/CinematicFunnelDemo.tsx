import React from 'react';
import { StaticCinematicFunnel } from '@/components/dynamic-funnel/cinematic/simplified/StaticCinematicFunnel';

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
    <StaticCinematicFunnel
      productContext={productContext}
      onLeadCapture={handleLeadCapture}
    />
  );
};

export default CinematicFunnelDemo;