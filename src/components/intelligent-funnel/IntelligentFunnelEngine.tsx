// Ghost Funnel Revolution - Intelligent Funnel Engine (FIXED)

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useBehavioralIntelligence } from '@/hooks/useBehavioralIntelligence';
import { 
  Brain, 
  Mail, 
  Calendar,
  Star,
  Users,
  Heart,
  ArrowRight,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface IntelligentFunnelEngineProps {
  funnelId: string;
  funnelData: any;
  onConversion?: (data: any) => void;
  onLeadCapture?: (data: any) => void;
}

export const IntelligentFunnelEngine: React.FC<IntelligentFunnelEngineProps> = ({
  funnelId,
  funnelData,
  onConversion,
  onLeadCapture
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    engagementScore,
    conversionIntent,
    behaviorPattern,
    trackFormInteraction
  } = useBehavioralIntelligence({ 
    trackingEnabled: true, 
    funnelId 
  });

  // Fixed: Static funnel steps - NO MORE INFINITE LOOPS!
  const getFunnelSteps = useCallback(() => {
    // Determine funnel path based on behavior (ONE TIME ONLY)
    if (conversionIntent > 0.7) {
      // High-intent: Direct to booking
      return [
        {
          id: 'intro',
          type: 'capture',
          title: 'Scopri la Soluzione Perfetta',
          content: {
            headline: 'Trasforma la Tua Idea in Realtà',
            description: 'Raccontaci di te per una proposta personalizzata'
          }
        },
        {
          id: 'high-value-offer',
          type: 'convert',
          title: '🚀 Opportunità Esclusiva',
          content: {
            headline: 'Prenota una Consultazione Gratuita',
            description: 'Basandoci sul tuo profilo, abbiamo una proposta speciale per te',
            cta: 'Prenota Ora',
            urgency: 'Solo per utenti qualificati come te'
          }
        }
      ];
    } else if (conversionIntent < 0.4) {
      // Low-intent: Email capture
      return [
        {
          id: 'intro',
          type: 'capture',
          title: 'Scopri la Soluzione Perfetta',
          content: {
            headline: 'Trasforma la Tua Idea in Realtà',
            description: 'Raccontaci di te e ricevi contenuti esclusivi'
          }
        },
        {
          id: 'email-capture',
          type: 'marketing',
          title: '📧 Resta Aggiornato',
          content: {
            headline: 'Ricevi Contenuti Esclusivi',
            description: 'Ti invieremo guide, casi studio e aggiornamenti personalizzati',
            cta: 'Iscriviti Gratuitamente',
            incentive: 'Guida gratuita in omaggio'
          }
        }
      ];
    } else {
      // Medium-intent: Nurture path
      return [
        {
          id: 'intro',
          type: 'capture',
          title: 'Scopri la Soluzione Perfetta',
          content: {
            headline: 'Trasforma la Tua Idea in Realtà',
            description: 'Raccontaci di te e scopri i nostri risultati'
          }
        },
        {
          id: 'social-proof',
          type: 'nurture',
          title: '⭐ Storie di Successo',
          content: {
            headline: 'Guarda i Risultati dei Nostri Clienti',
            testimonials: [
              { name: 'Marco R.', result: '+150% conversioni', company: 'E-commerce' },
              { name: 'Sara L.', result: '+80% lead qualificati', company: 'Consulenza' }
            ]
          }
        },
        {
          id: 'qualify',
          type: 'qualify',
          title: '🎯 Personalizza la Tua Esperienza',
          content: {
            headline: 'Dimmi di più sui tuoi obiettivi',
            description: 'Per offrirti la soluzione più adatta'
          }
        }
      ];
    }
  }, [conversionIntent]);

  const funnelSteps = getFunnelSteps();

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Track form interaction for behavioral analysis
    trackFormInteraction({ field, value, step: currentStep });
  };

  const handleNext = async () => {
    if (currentStep < funnelSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const currentStepData = funnelSteps[currentStep];
      
      if (currentStepData.type === 'convert') {
        // High-intent conversion
        onConversion?.({
          ...formData,
          conversionType: 'booking',
          engagementScore,
          conversionIntent,
          behaviorPattern
        });
        
        toast({
          title: "🎉 Perfetto!",
          description: "La tua richiesta è stata inviata. Ti contatteremo entro 24 ore.",
        });
      } else {
        // Lead capture for marketing
        onLeadCapture?.({
          ...formData,
          leadType: 'marketing_qualified',
          engagementScore,
          conversionIntent,
          behaviorPattern
        });
        
        toast({
          title: "✅ Iscrizione Completata",
          description: "Riceverai contenuti personalizzati basati sui tuoi interessi.",
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step: any) => {
    switch (step.type) {
      case 'capture':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                {step.content.headline}
              </h2>
              <p className="text-muted-foreground text-lg">
                {step.content.description}
              </p>
            </div>
            
            <div className="space-y-4">
              <Input
                placeholder="Il tuo nome"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              <Input
                type="email"
                placeholder="La tua email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              <Textarea
                placeholder="Descrivi brevemente il tuo progetto o obiettivo"
                value={formData.project || ''}
                onChange={(e) => handleInputChange('project', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 'convert':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {step.content.headline}
              </h2>
              <p className="text-muted-foreground text-lg">
                {step.content.description}
              </p>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                {step.content.urgency}
              </Badge>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Prenota la Tua Consultazione
              </h3>
              <div className="space-y-4">
                <Input
                  type="tel"
                  placeholder="Il tuo numero di telefono"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                <Input
                  placeholder="Settore di attività"
                  value={formData.industry || ''}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                />
                <Textarea
                  placeholder="Quali sono le tue principali sfide?"
                  value={formData.challenges || ''}
                  onChange={(e) => handleInputChange('challenges', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 'marketing':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {step.content.headline}
              </h2>
              <p className="text-muted-foreground text-lg">
                {step.content.description}
              </p>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                {step.content.incentive}
              </Badge>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Contenuti esclusivi</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Strategie avanzate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Community esclusiva</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Supporto personalizzato</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Nome"
                    value={formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                  <Input
                    placeholder="Cognome"
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
                <Input
                  type="email"
                  placeholder="Email (richiesta)"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
                <Input
                  placeholder="Azienda (opzionale)"
                  value={formData.company || ''}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'nurture':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                {step.content.headline}
              </h2>
            </div>
            
            <div className="grid gap-4">
              {step.content.testimonials?.map((testimonial: any, index: number) => (
                <Card key={index} className="p-4">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {testimonial.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                        <div className="text-green-600 font-medium">{testimonial.result}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'qualify':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                {step.content.headline}
              </h2>
              <p className="text-muted-foreground text-lg">
                {step.content.description}
              </p>
            </div>
            
            <div className="space-y-4">
              <Input
                placeholder="Qual è il tuo obiettivo principale?"
                value={formData.mainGoal || ''}
                onChange={(e) => handleInputChange('mainGoal', e.target.value)}
              />
              <Input
                placeholder="Budget indicativo"
                value={formData.budget || ''}
                onChange={(e) => handleInputChange('budget', e.target.value)}
              />
              <Textarea
                placeholder="Cosa ti ha spinto a cercare questa soluzione?"
                value={formData.motivation || ''}
                onChange={(e) => handleInputChange('motivation', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepData = funnelSteps[currentStep];
  const progress = ((currentStep + 1) / funnelSteps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Intelligence Dashboard */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-indigo-600" />
          <span className="font-medium text-indigo-800">AI Behavioral Intelligence</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Engagement</div>
            <div className="font-semibold">{engagementScore}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Intent</div>
            <div className="font-semibold">{Math.round(conversionIntent * 100)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">Pattern</div>
            <div className="font-semibold capitalize">{behaviorPattern.replace('_', ' ')}</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Passaggio {currentStep + 1} di {funnelSteps.length}
          </span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {currentStepData && renderStepContent(currentStepData)}
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleNext}
          disabled={isSubmitting || !formData.email}
          size="lg"
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Elaborazione...
            </div>
          ) : currentStep < funnelSteps.length - 1 ? (
            <div className="flex items-center gap-2">
              Continua
              <ArrowRight className="w-4 h-4" />
            </div>
          ) : currentStepData?.type === 'convert' ? (
            (currentStepData.content as any).cta || 'Prenota Ora'
          ) : currentStepData?.type === 'marketing' ? (
            (currentStepData.content as any).cta || 'Iscriviti'
          ) : (
            'Continua'
          )}
        </Button>
      </div>
    </div>
  );
};