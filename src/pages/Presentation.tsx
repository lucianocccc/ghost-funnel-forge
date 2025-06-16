
import React from 'react';
import PresentationHeader from './presentation/components/PresentationHeader';
import HeroSection from './presentation/components/HeroSection';
import FeaturesSection from './presentation/components/FeaturesSection';
import PricingSection from './presentation/components/PricingSection';
import CTASection from './presentation/components/CTASection';
import PresentationFooter from './presentation/components/PresentationFooter';

const Presentation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <PresentationHeader />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <PresentationFooter />
    </div>
  );
};

export default Presentation;
