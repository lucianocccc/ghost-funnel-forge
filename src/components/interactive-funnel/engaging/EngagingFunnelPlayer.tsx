
import React, { useState, useEffect, useRef } from 'react';
import { ShareableFunnel } from '@/types/interactiveFunnel';
import EngagingHeroSection from './EngagingHeroSection';
import AttractionSection from './AttractionSection';
import UrgencySection from './UrgencySection';
import BenefitsSection from './BenefitsSection';
import InteractiveStepsSection from './InteractiveStepsSection';
import QualityJourneySection from './QualityJourneySection';
import FinalCTASection from './FinalCTASection';

interface EngagingFunnelPlayerProps {
  funnel: ShareableFunnel;
  onComplete: () => void;
}

type FunnelSection = 
  | 'hero'
  | 'attraction' 
  | 'urgency'
  | 'benefits'
  | 'interactive'
  | 'quality'
  | 'final-cta';

const EngagingFunnelPlayer: React.FC<EngagingFunnelPlayerProps> = ({ 
  funnel, 
  onComplete 
}) => {
  const [currentSection, setCurrentSection] = useState<FunnelSection>('hero');
  const [isInteractiveComplete, setIsInteractiveComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log('🎯 EngagingFunnelPlayer RENDERING START:', {
    funnelId: funnel?.id,
    funnelName: funnel?.name,
    currentSection,
    stepsCount: funnel?.interactive_funnel_steps?.length || 0,
    hasSteps: !!funnel?.interactive_funnel_steps,
    steps: funnel?.interactive_funnel_steps,
    personalizedSections: funnel?.settings?.personalizedSections
  });

  // Smooth scroll to top when section changes
  useEffect(() => {
    console.log('🔄 Section changed to:', currentSection);
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [currentSection]);

  const goToNextSection = () => {
    const sections: FunnelSection[] = [
      'hero', 'attraction', 'urgency', 'benefits', 
      'interactive', 'quality', 'final-cta'
    ];
    
    const currentIndex = sections.indexOf(currentSection);
    console.log('⏭️ Going to next section from:', currentSection, 'index:', currentIndex);
    
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      console.log('✅ Next section will be:', nextSection);
      setCurrentSection(nextSection);
    } else {
      console.log('❌ Already at last section');
    }
  };

  const handleInteractiveComplete = () => {
    console.log('✅ Interactive section completed');
    setIsInteractiveComplete(true);
    goToNextSection();
  };

  const handleFinalComplete = () => {
    console.log('🎉 Funnel completed successfully');
    onComplete();
  };

  const renderCurrentSection = () => {
    console.log('🎨 Rendering section:', currentSection);
    
    try {
      switch (currentSection) {
        case 'hero':
          console.log('🏠 Rendering EngagingHeroSection');
          return (
            <EngagingHeroSection
              funnel={funnel}
              onContinue={goToNextSection}
            />
          );
        
        case 'attraction':
          console.log('🎯 Rendering AttractionSection');
          return (
            <AttractionSection
              funnel={funnel}
              onContinue={goToNextSection}
            />
          );
        
        case 'urgency':
          console.log('⚡ Rendering UrgencySection');
          return (
            <UrgencySection
              funnel={funnel}
              onContinue={goToNextSection}
            />
          );
        
        case 'benefits':
          console.log('💎 Rendering BenefitsSection');
          return (
            <BenefitsSection
              funnel={funnel}
              onContinue={goToNextSection}
            />
          );
        
        case 'interactive':
          console.log('🔄 Rendering InteractiveStepsSection');
          return (
            <InteractiveStepsSection
              funnel={funnel}
              onComplete={handleInteractiveComplete}
              onContinue={goToNextSection}
            />
          );
        
        case 'quality':
          console.log('⭐ Rendering QualityJourneySection');
          return (
            <QualityJourneySection
              onContinue={goToNextSection}
            />
          );
        
        case 'final-cta':
          console.log('🎯 Rendering FinalCTASection');
          return (
            <FinalCTASection
              onComplete={handleFinalComplete}
            />
          );
        
        default:
          console.log('❓ Unknown section, rendering default EngagingHeroSection');
          return (
            <EngagingHeroSection
              funnel={funnel}
              onContinue={goToNextSection}
            />
          );
      }
    } catch (error) {
      console.error('❌ Error rendering section:', currentSection, error);
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Errore nel rendering
            </h2>
            <p className="text-red-800">
              Sezione: {currentSection}
            </p>
            <p className="text-red-600 mt-2">
              {error instanceof Error ? error.message : 'Errore sconosciuto'}
            </p>
          </div>
        </div>
      );
    }
  };

  console.log('🚀 About to render container with section:', currentSection);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen overflow-auto"
      style={{ scrollBehavior: 'smooth' }}
    >
      {renderCurrentSection()}
      
      {/* Progress indicator (optional) */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
          Sezione {['hero', 'attraction', 'urgency', 'benefits', 'interactive', 'quality', 'final-cta'].indexOf(currentSection) + 1} di 7
        </div>
      </div>
    </div>
  );
};

export default EngagingFunnelPlayer;
