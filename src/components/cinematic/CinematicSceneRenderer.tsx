
// Cinematic Scene Renderer - Individual Scene Component

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CinematicScene, IntelligentCinematicFunnel } from '@/services/intelligentCinematicService';
import { CinematicParallaxBackground } from './CinematicParallaxBackground';
import { CinematicParticleSystem } from './CinematicParticleSystem';
import { CinematicHeroScene } from './scenes/CinematicHeroScene';
import { CinematicBenefitsScene } from './scenes/CinematicBenefitsScene';
import { CinematicSocialProofScene } from './scenes/CinematicSocialProofScene';
import { CinematicConversionScene } from './scenes/CinematicConversionScene';

interface CinematicSceneRendererProps {
  scene: CinematicScene;
  funnel: IntelligentCinematicFunnel;
  onProgress: () => void;
  onLeadSubmit: (data: any) => void;
  performanceMode: 'high' | 'medium' | 'low';
  userInteractions: number;
}

export const CinematicSceneRenderer: React.FC<CinematicSceneRendererProps> = ({
  scene,
  funnel,
  onProgress,
  onLeadSubmit,
  performanceMode,
  userInteractions
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize scene-specific effects
    if (sceneRef.current) {
      applySceneTheme();
    }
  }, [scene]);

  const applySceneTheme = () => {
    const root = document.documentElement;
    
    // Apply scene-specific CSS variables
    root.style.setProperty('--scene-primary', scene.cinematicElements.lighting.ambient);
    root.style.setProperty('--scene-spotlight', scene.cinematicElements.lighting.spotlight);
    
    // Apply global theme
    root.style.setProperty('--funnel-color-scheme', funnel.globalTheme.colorScheme);
    root.style.setProperty('--funnel-typography', funnel.globalTheme.typography);
  };

  const renderSceneContent = () => {
    const commonProps = {
      scene,
      funnel,
      onProgress,
      onLeadSubmit,
      performanceMode,
      userInteractions
    };

    switch (scene.type) {
      case 'hero':
        return <CinematicHeroScene {...commonProps} />;
      case 'benefits':
        return <CinematicBenefitsScene {...commonProps} />;
      case 'social_proof':
        return <CinematicSocialProofScene {...commonProps} />;
      case 'conversion':
        return <CinematicConversionScene {...commonProps} />;
      default:
        return <CinematicHeroScene {...commonProps} />;
    }
  };

  return (
    <div 
      ref={sceneRef}
      className="relative min-h-screen overflow-hidden"
      style={{
        background: `var(--cinematic-bg-${scene.cinematicElements.background})`,
      }}
    >
      {/* Parallax Background */}
      <CinematicParallaxBackground 
        scene={scene}
        performanceMode={performanceMode}
      />

      {/* Particle System */}
      {performanceMode !== 'low' && (
        <CinematicParticleSystem 
          config={scene.cinematicElements.particles!}
          performanceMode={performanceMode}
        />
      )}

      {/* Scene Content */}
      <div className="relative z-10">
        {renderSceneContent()}
      </div>

      {/* Scene-specific overlays and effects */}
      {scene.cinematicElements.lighting.shadows && performanceMode === 'high' && (
        <div className="absolute inset-0 z-5 pointer-events-none">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at 50% 30%, transparent 40%, rgba(0,0,0,0.6) 100%)`
            }}
          />
        </div>
      )}
    </div>
  );
};
