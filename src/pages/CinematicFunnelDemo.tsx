import React from 'react';
import { CinematicFunnelContainer } from '@/components/dynamic-funnel/cinematic/CinematicFunnelContainer';

const CinematicFunnelDemo: React.FC = () => {
  const handleLeadCapture = (data: any) => {
    console.log('Lead captured:', data);
    alert('Grazie per il tuo interesse! I tuoi dati sono stati registrati.');
  };

  return (
    <div className="min-h-screen bg-black">
      <CinematicFunnelContainer
        productName="Mountain Bike Pro X1"
        productDescription="La mountain bike più avanzata al mondo, progettata per conquistare ogni terreno con prestazioni superiori e tecnologia all'avanguardia."
        targetAudience="Appassionati di mountain bike e ciclisti professionisti"
        industry="Sport e Outdoor"
        onLeadCapture={handleLeadCapture}
      />
    </div>
  );
};

export default CinematicFunnelDemo;