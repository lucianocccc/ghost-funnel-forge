
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

  console.log('EngagingFunnelPlayer rendered:', {
    funnelId: funnel.id,
    currentSection,
    stepsCount: funnel.interactive_funnel_steps?.length || 0
  });

  // Smooth scroll to top when section changes
  useEffect(() => {
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
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1]);
    }
  };

  const handleInteractiveComplete = () => {
    console.log('Interactive section completed');
    setIsInteractiveComplete(true);
    goToNextSection();
  };

  const handleFinalComplete = () => {
    console.log('Funnel completed successfully');
    onComplete();
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'hero':
        return (
          <EngagingHeroSection
            funnel={funnel}
            onContinue={goToNextSection}
          />
        );
      
      case 'attraction':
        return (
          <AttractionSection
            onContinue={goToNextSection}
          />
        );
      
      case 'urgency':
        return (
          <UrgencySection
            onContinue={goToNextSection}
          />
        );
      
      case 'benefits':
        return (
          <BenefitsSection
            onContinue={goToNextSection}
          />
        );
      
      case 'interactive':
        return (
          <InteractiveStepsSection
            funnel={funnel}
            onComplete={handleInteractiveComplete}
            onContinue={goToNextSection}
          />
        );
      
      case 'quality':
        return (
          <QualityJourneySection
            onContinue={goToNextSection}
          />
        );
      
      case 'final-cta':
        return (
          <FinalCTASection
            onComplete={handleFinalComplete}
          />
        );
      
      default:
        return (
          <EngagingHeroSection
            funnel={funnel}
            onContinue={goToNextSection}
          />
        );
    }
  };

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
