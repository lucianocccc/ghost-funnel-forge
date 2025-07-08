import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Import advanced components
import { AdvancedHeroSection } from './advanced/AdvancedHeroSection';
import { AdvancedBenefitsSection } from './advanced/AdvancedBenefitsSection';
import { AdvancedSocialProof } from './advanced/AdvancedSocialProof';
import { AdvancedInteractiveDemo } from './advanced/AdvancedInteractiveDemo';
import { AdvancedConversionForm } from './advanced/AdvancedConversionForm';
import { PersonalizationEngine } from './advanced/PersonalizationEngine';
import { AnalyticsTracker, useAnalytics } from './advanced/AnalyticsTracker';
import { DynamicParallaxBackground } from './advanced/DynamicParallaxBackground';
import { ScrollTracker } from './advanced/ScrollTracker';

interface AdvancedFunnelData {
  heroSection: {
    headline: string;
    subheadline: string;
    animation: string;
    backgroundGradient: string;
    ctaText: string;
    ctaStyle?: string;
    urgencyText?: string;
  };
  visualTheme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontPrimary: string;
    fontSecondary: string;
    borderRadius: string;
    spacing: string;
  };
  productBenefits: Array<{
    title: string;
    description: string;
    icon: string;
    animation: string;
    highlight?: boolean;
    statistic?: string;
  }>;
  socialProof: {
    testimonials: Array<{
      name: string;
      text: string;
      rating: number;
      role?: string;
      verified?: boolean;
      image?: string;
    }>;
    trustIndicators: string[];
    statistics?: Array<{
      number: string;
      label: string;
      icon: string;
    }>;
  };
  interactiveDemo: {
    type: string;
    title: string;
    description: string;
    content: any;
  };
  conversionForm: {
    title: string;
    description: string;
    steps?: Array<{
      title: string;
      fields: Array<{
        name: string;
        label: string;
        type: string;
        placeholder: string;
        required: boolean;
        options?: string[];
        validation?: string;
      }>;
    }>;
    fields?: Array<any>; // backward compatibility
    submitText: string;
    incentive: string;
    progressBar?: boolean;
    socialProofInline?: string;
  };
  advancedFeatures?: {
    personalization?: {
      enabled: boolean;
      triggers: string[];
      messages: string[];
    };
    urgencyMechanics?: {
      type: string;
      message: string;
      expiresIn: string;
    };
    exitIntent?: {
      enabled: boolean;
      offer: string;
      discount: string;
    };
  };
  animations: {
    entrance: string;
    scroll: string;
    interactions: string;
    transitions?: string;
  };
  productImage?: string;
}

interface AdvancedDynamicFunnelProps {
  productName: string;
  productDescription?: string;
  targetAudience?: string;
  industry?: string;
  onLeadCapture?: (data: any) => void;
}

export const AdvancedDynamicFunnel: React.FC<AdvancedDynamicFunnelProps> = ({
  productName,
  productDescription,
  targetAudience,
  industry,
  onLeadCapture
}) => {
  const { toast } = useToast();
  const [funnelData, setFunnelData] = useState<AdvancedFunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [userBehavior, setUserBehavior] = useState({
    scrollDepth: 0,
    timeOnPage: 0,
    interactions: 0,
    exitIntentShown: false
  });
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const startTime = useRef(Date.now());
  const { trackEvent, trackConversion } = useAnalytics();

  const steps = ['hero', 'benefits', 'proof', 'demo', 'form'];

  useEffect(() => {
    generateAdvancedFunnel();
    trackPageView();
    setupBehaviorTracking();
  }, [productName]);

  useEffect(() => {
    // Apply dynamic theme
    if (funnelData?.visualTheme) {
      applyDynamicTheme(funnelData.visualTheme);
    }
  }, [funnelData]);

  const generateAdvancedFunnel = async () => {
    setLoading(true);
    try {
      console.log('Generating advanced funnel for:', productName);
      
      const { data, error } = await supabase.functions.invoke('generate-dynamic-product-funnel', {
        body: {
          productName,
          productDescription,
          targetAudience,
          industry
        }
      });

      if (error) {
        throw new Error(`Function error: ${error.message || error}`);
      }

      if (data?.success) {
        console.log('Advanced funnel generated successfully');
        setFunnelData(data.funnelData);
        trackEvent('funnel_generated', { productName, industry, targetAudience });
      } else {
        throw new Error(data?.error || 'Failed to generate advanced funnel');
      }
    } catch (error) {
      console.error('Error generating advanced funnel:', error);
      toast({
        title: "Errore",
        description: "Impossibile generare il funnel avanzato. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyDynamicTheme = (theme: AdvancedFunnelData['visualTheme']) => {
    const root = document.documentElement;
    root.style.setProperty('--funnel-primary', theme.primaryColor);
    root.style.setProperty('--funnel-secondary', theme.secondaryColor);
    root.style.setProperty('--funnel-accent', theme.accentColor);
    root.style.setProperty('--funnel-background', theme.backgroundColor);
    root.style.setProperty('--funnel-text', theme.textColor);
    root.style.setProperty('--funnel-radius', theme.borderRadius);
  };

  const trackPageView = () => {
    trackEvent('page_view', {
      productName,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
  };

  const setupBehaviorTracking = () => {
    // Track scroll depth
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      setUserBehavior(prev => ({
        ...prev,
        scrollDepth: Math.max(prev.scrollDepth, scrollPercent)
      }));
    };

    // Track time on page
    const timeInterval = setInterval(() => {
      setUserBehavior(prev => ({
        ...prev,
        timeOnPage: Date.now() - startTime.current
      }));
    }, 1000);

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !userBehavior.exitIntentShown && funnelData?.advancedFeatures?.exitIntent?.enabled) {
        handleExitIntent();
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearInterval(timeInterval);
    };
  };

  const handleExitIntent = () => {
    setUserBehavior(prev => ({ ...prev, exitIntentShown: true }));
    
    if (funnelData?.advancedFeatures?.exitIntent) {
      toast({
        title: "🎯 Aspetta!",
        description: `${funnelData.advancedFeatures.exitIntent.offer} - Sconto ${funnelData.advancedFeatures.exitIntent.discount}`,
        duration: 8000,
      });
      
      trackEvent('exit_intent_triggered', {
        step: currentStep,
        timeOnPage: userBehavior.timeOnPage,
        scrollDepth: userBehavior.scrollDepth
      });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      trackEvent('step_progression', {
        from: steps[currentStep],
        to: steps[currentStep + 1],
        timeOnStep: userBehavior.timeOnPage
      });
    }
  };

  const handleFormSubmit = async (finalData: any) => {
    setSubmitting(true);
    try {
      const leadData = {
        ...finalData,
        productName,
        productDescription,
        generatedAt: new Date().toISOString(),
        funnelType: 'advanced_dynamic',
        userBehavior,
        visualTheme: funnelData?.visualTheme
      };

      onLeadCapture?.(leadData);
      trackConversion('lead_capture', leadData);

      toast({
        title: "🎉 Perfetto!",
        description: "Le tue informazioni sono state registrate con successo!",
      });

      setFormData({});
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Errore",
        description: "Errore nell'invio. Riprova.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium">Generando il tuo funnel avanzato...</p>
          <p className="text-sm text-muted-foreground">Sto creando un'esperienza premium personalizzata per {productName}</p>
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <span>✨ AI Design</span>
            <span>•</span>
            <span>🎨 Visual Theme</span>
            <span>•</span>
            <span>🧠 Personalization</span>
          </div>
        </div>
      </div>
    );
  }

  if (!funnelData) {
    return (
      <div className="text-center p-8">
        <p className="text-lg">Impossibile generare il funnel avanzato. Riprova più tardi.</p>
        <Button onClick={generateAdvancedFunnel} className="mt-4">
          Riprova
        </Button>
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (steps[currentStep]) {
      case 'hero':
        return (
          <AdvancedHeroSection
            data={funnelData.heroSection}
            theme={funnelData.visualTheme}
            productImage={funnelData.productImage}
            onNext={handleNext}
          />
        );
      case 'benefits':
        return (
          <AdvancedBenefitsSection
            data={funnelData.productBenefits}
            theme={funnelData.visualTheme}
            productName={productName}
            onNext={handleNext}
          />
        );
      case 'proof':
        return (
          <AdvancedSocialProof
            data={funnelData.socialProof}
            theme={funnelData.visualTheme}
            urgencyMechanics={funnelData.advancedFeatures?.urgencyMechanics}
            onNext={handleNext}
          />
        );
      case 'demo':
        return (
          <AdvancedInteractiveDemo
            data={funnelData.interactiveDemo}
            theme={funnelData.visualTheme}
            productName={productName}
            onNext={handleNext}
            onInteraction={() => setUserBehavior(prev => ({ ...prev, interactions: prev.interactions + 1 }))}
          />
        );
      case 'form':
        return (
          <AdvancedConversionForm
            data={funnelData.conversionForm}
            theme={funnelData.visualTheme}
            onSubmit={handleFormSubmit}
            submitting={submitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnalyticsTracker />
      <ScrollTracker onScrollChange={setScrollPosition} />
      <DynamicParallaxBackground 
        productName={productName}
        industry={industry || ''}
        theme={funnelData.visualTheme}
        scrollPosition={scrollPosition}
      />
      <PersonalizationEngine 
        userBehavior={userBehavior}
        personalizationConfig={funnelData.advancedFeatures?.personalization}
        onPersonalize={(message) => {
          toast({
            title: "💡 Suggerimento",
            description: message,
            duration: 5000
          });
        }}
      />
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Advanced Progress indicator */}
        <div className="pt-6 pb-4">
          <div className="flex justify-center items-center space-x-4 mb-4">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    index <= currentStep 
                      ? 'bg-gradient-to-r from-primary to-secondary scale-110' 
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentStep + 1} di {steps.length}
            </div>
          </div>
          
          <Progress 
            value={(currentStep + 1) / steps.length * 100} 
            className="h-2 transition-all duration-500"
          />
        </div>
        
        {renderCurrentStep()}
      </div>
      
      {/* Floating insights panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs">
          <h4 className="font-semibold text-sm mb-2">🧠 User Insights</h4>
          <div className="text-xs space-y-1">
            <div>Scroll: {userBehavior.scrollDepth}%</div>
            <div>Time: {Math.round(userBehavior.timeOnPage / 1000)}s</div>
            <div>Interactions: {userBehavior.interactions}</div>
            <div>Step: {steps[currentStep]}</div>
          </div>
        </div>
      )}
    </div>
  );
};