
import React from 'react';
import { StaticCinematicFunnel } from '@/components/dynamic-funnel/cinematic/simplified/StaticCinematicFunnel';
import { PerformanceMonitor } from '@/components/dynamic-funnel/performance/PerformanceMonitor';

const CinematicFunnelDemo: React.FC = () => {
  const handleLeadCapture = (data: any) => {
    console.log('Lead captured:', data);
    alert('Grazie per il tuo interesse! I tuoi dati sono stati registrati.');
  };

  const handlePerformanceUpdate = (metrics: any) => {
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance metrics:', metrics);
    }
  };

  const productContext = {
    name: "Innovation Pro",
    description: "Un prodotto rivoluzionario che trasforma la tua esperienza con tecnologia all'avanguardia e design premium.",
    targetAudience: "Professionisti e innovatori",
    industry: "Technology",
    visualStyle: "dynamic" as const
  };

  return (
    <>
      <PerformanceMonitor onMetricsUpdate={handlePerformanceUpdate} />
      <StaticCinematicFunnel
        productContext={productContext}
        onLeadCapture={handleLeadCapture}
      />
    </>
  );
};

export default CinematicFunnelDemo;
