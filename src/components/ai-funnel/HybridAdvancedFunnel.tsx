import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Import advanced components from AdvancedDynamicFunnel
import { AdvancedHeroSection } from '../dynamic-funnel/advanced/AdvancedHeroSection';
import { AdvancedBenefitsSection } from '../dynamic-funnel/advanced/AdvancedBenefitsSection';
import { AdvancedSocialProof } from '../dynamic-funnel/advanced/AdvancedSocialProof';
import { AdvancedInteractiveDemo } from '../dynamic-funnel/advanced/AdvancedInteractiveDemo';
import { AdvancedConversionForm } from '../dynamic-funnel/advanced/AdvancedConversionForm';
import { PersonalizationEngine } from '../dynamic-funnel/advanced/PersonalizationEngine';
import { AnalyticsTracker, useAnalytics } from '../dynamic-funnel/advanced/AnalyticsTracker';
import { DynamicParallaxBackground } from '../dynamic-funnel/advanced/DynamicParallaxBackground';
import { ScrollTracker } from '../dynamic-funnel/advanced/ScrollTracker';

interface GeneratedFunnel {
  id: string;
  name: string;
  description: string;
  share_token: string;
  steps: any[];
  settings: any;
  advanced_funnel_data?: any;
  customer_facing?: any;
  target_audience?: any;
  industry?: string;
}

interface HybridAdvancedFunnelProps {
  funnel: GeneratedFunnel;
  onLeadCapture?: (data: any) => void;
}

export const HybridAdvancedFunnel: React.FC<HybridAdvancedFunnelProps> = ({
  funnel,
  onLeadCapture
}) => {
  const { toast } = useToast();
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
    trackPageView();
    setupBehaviorTracking();
    
    // Apply dynamic theme if available
    if (funnel.advanced_funnel_data?.visualTheme) {
      applyDynamicTheme(funnel.advanced_funnel_data.visualTheme);
    }
  }, [funnel]);

  const applyDynamicTheme = (theme: any) => {
    const root = document.documentElement;
    if (theme.primaryColor) root.style.setProperty('--funnel-primary', theme.primaryColor);
    if (theme.secondaryColor) root.style.setProperty('--funnel-secondary', theme.secondaryColor);
    if (theme.accentColor) root.style.setProperty('--funnel-accent', theme.accentColor);
    if (theme.backgroundColor) root.style.setProperty('--funnel-background', theme.backgroundColor);
    if (theme.textColor) root.style.setProperty('--funnel-text', theme.textColor);
    if (theme.borderRadius) root.style.setProperty('--funnel-radius', theme.borderRadius);
  };

  const trackPageView = () => {
    trackEvent('hybrid_funnel_view', {
      funnelId: funnel.id,
      funnelName: funnel.name,
      industry: funnel.industry,
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
      if (e.clientY <= 0 && !userBehavior.exitIntentShown && 
          funnel.advanced_funnel_data?.advancedFeatures?.exitIntent?.enabled) {
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
    
    const exitIntent = funnel.advanced_funnel_data?.advancedFeatures?.exitIntent;
    if (exitIntent) {
      toast({
        title: "🎯 Aspetta!",
        description: `${exitIntent.offer} - Sconto ${exitIntent.discount}`,
        duration: 8000,
      });
      
      trackEvent('exit_intent_triggered', {
        step: currentStep,
        timeOnPage: userBehavior.timeOnPage,
        scrollDepth: userBehavior.scrollDepth,
        funnelId: funnel.id
      });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      trackEvent('step_progression', {
        from: steps[currentStep],
        to: steps[currentStep + 1],
        timeOnStep: userBehavior.timeOnPage,
        funnelId: funnel.id
      });
    }
  };

  const handleFormSubmit = async (finalData: any) => {
    setSubmitting(true);
    try {
      const leadData = {
        ...finalData,
        funnelId: funnel.id,
        funnelName: funnel.name,
        industry: funnel.industry,
        generatedAt: new Date().toISOString(),
        funnelType: 'hybrid_advanced',
        userBehavior,
        visualTheme: funnel.advanced_funnel_data?.visualTheme,
        targetAudience: funnel.target_audience
      };

      onLeadCapture?.(leadData);
      trackConversion('hybrid_lead_capture', leadData);

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

  const renderCurrentStep = () => {
    const advancedData = funnel.advanced_funnel_data;
    
    // Fallback data in case advanced_funnel_data is not available
    const fallbackData = {
      heroSection: {
        headline: funnel.customer_facing?.hero_title || funnel.name,
        subheadline: funnel.customer_facing?.hero_subtitle || funnel.description,
        animation: "fade-in-up",
        backgroundGradient: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
        ctaText: "Scopri di più",
        ctaStyle: "primary"
      },
      visualTheme: {
        primaryColor: funnel.customer_facing?.brand_colors?.primary || "hsl(var(--primary))",
        secondaryColor: funnel.customer_facing?.brand_colors?.secondary || "hsl(var(--secondary))",
        accentColor: funnel.customer_facing?.brand_colors?.accent || "hsl(var(--accent))",
        backgroundColor: "hsl(var(--background))",
        textColor: "hsl(var(--foreground))",
        fontPrimary: "Inter",
        borderRadius: "12px",
        spacing: "normal"
      },
      productBenefits: [
        {
          title: "Innovazione",
          description: "Soluzioni all'avanguardia per il tuo business",
          icon: "zap",
          animation: "fade-in",
          highlight: true
        },
        {
          title: "Qualità",
          description: "Standard elevati per risultati superiori",
          icon: "shield",
          animation: "fade-in"
        },
        {
          title: "Risultati",
          description: "Performance misurabili e crescita costante",
          icon: "trending-up",
          animation: "fade-in"
        }
      ],
      socialProof: {
        testimonials: [
          {
            name: "Marco Rossi",
            text: "Una soluzione che ha rivoluzionato il nostro approccio al business.",
            rating: 5,
            role: "CEO",
            verified: true
          }
        ],
        trustIndicators: ["Certificazione ISO", "Oltre 1000+ clienti soddisfatti"],
        statistics: [
          {
            number: "98%",
            label: "Clienti soddisfatti",
            icon: "heart"
          }
        ]
      },
      interactiveDemo: {
        type: "preview",
        title: "Prova l'esperienza",
        description: "Scopri come funziona nella pratica",
        content: "demo interattiva"
      },
      conversionForm: {
        title: "Inizia subito",
        description: "Compila il form per ricevere maggiori informazioni",
        steps: [
          {
            title: "Informazioni di contatto",
            fields: [
              {
                name: "name",
                label: "Nome e Cognome",
                type: "text",
                placeholder: "Il tuo nome completo",
                required: true
              },
              {
                name: "email",
                label: "Email",
                type: "email",
                placeholder: "La tua email",
                required: true
              }
            ]
          }
        ],
        submitText: "Richiedi informazioni",
        incentive: "Ricevi una consulenza gratuita",
        progressBar: true
      }
    };

    const data = advancedData || fallbackData;

    switch (steps[currentStep]) {
      case 'hero':
        return (
          <AdvancedHeroSection
            data={data.heroSection}
            theme={data.visualTheme}
            productImage={data.productImage}
            onNext={handleNext}
          />
        );
      case 'benefits':
        return (
          <AdvancedBenefitsSection
            data={data.productBenefits}
            theme={data.visualTheme}
            productName={funnel.name}
            onNext={handleNext}
          />
        );
      case 'proof':
        return (
          <AdvancedSocialProof
            data={data.socialProof}
            theme={data.visualTheme}
            urgencyMechanics={data.advancedFeatures?.urgencyMechanics}
            onNext={handleNext}
          />
        );
      case 'demo':
        return (
          <AdvancedInteractiveDemo
            data={data.interactiveDemo}
            theme={data.visualTheme}
            productName={funnel.name}
            onNext={handleNext}
            onInteraction={() => setUserBehavior(prev => ({ ...prev, interactions: prev.interactions + 1 }))}
          />
        );
      case 'form':
        return (
          <AdvancedConversionForm
            data={data.conversionForm}
            theme={data.visualTheme}
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
        productName={funnel.name}
        industry={funnel.industry || ''}
        theme={funnel.advanced_funnel_data?.visualTheme || {}}
        scrollPosition={scrollPosition}
      />
      <PersonalizationEngine 
        userBehavior={userBehavior}
        personalizationConfig={funnel.advanced_funnel_data?.advancedFeatures?.personalization}
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
      
      {/* Floating insights panel in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs">
          <h4 className="font-semibold text-sm mb-2">🧠 Hybrid Funnel Insights</h4>
          <div className="text-xs space-y-1">
            <div>Funnel: {funnel.name}</div>
            <div>Scroll: {userBehavior.scrollDepth}%</div>
            <div>Time: {Math.round(userBehavior.timeOnPage / 1000)}s</div>
            <div>Interactions: {userBehavior.interactions}</div>
            <div>Step: {steps[currentStep]}</div>
            <div>AI Data: {funnel.advanced_funnel_data ? '✅' : '❌'}</div>
          </div>
        </div>
      )}
    </div>
  );
};