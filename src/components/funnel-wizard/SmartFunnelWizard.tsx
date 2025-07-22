import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Brain, Target, Rocket, Lightbulb } from 'lucide-react';
import { useCreateSmartFunnel } from '@/integrations/supabase/hooks/useCreateSmartFunnel';
import { SmartFunnelRequest } from '@/types/interactiveFunnel';
import { toast } from '@/hooks/use-toast';

interface SmartFunnelWizardProps {
  onFunnelCreated?: (funnelId: string) => void;
}

export const SmartFunnelWizard: React.FC<SmartFunnelWizardProps> = ({ onFunnelCreated }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SmartFunnelRequest>({
    business_description: '',
    targetAudience: '',
    main_goal: '',
    budget_range: '',
    timeline: '',
    industry: '',
    experience_level: '',
    specific_requirements: '',
    preferred_style: '',
  });

  const createSmartFunnel = useCreateSmartFunnel();

  const handleInputChange = (field: keyof SmartFunnelRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.business_description.trim()) {
      toast({
        title: "Campo Obbligatorio",
        description: "La descrizione del business è richiesta",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createSmartFunnel.mutateAsync(formData);
      if (result.success && onFunnelCreated) {
        onFunnelCreated(result.funnel.id);
      }
    } catch (error) {
      console.error('Error creating smart funnel:', error);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.business_description.trim().length > 20;
      case 2:
        return formData.targetAudience.trim().length > 0 && formData.main_goal.trim().length > 0;
      case 3:
        return formData.industry.trim().length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const steps = [
    {
      number: 1,
      title: "Il Tuo Business",
      icon: <Brain className="w-5 h-5" />,
      description: "Parliamo del tuo business e dei tuoi obiettivi"
    },
    {
      number: 2,
      title: "Target & Obiettivi",
      icon: <Target className="w-5 h-5" />,
      description: "Chi sono i tuoi clienti ideali e cosa vuoi ottenere?"
    },
    {
      number: 3,
      title: "Contesto & Preferenze",
      icon: <Lightbulb className="w-5 h-5" />,
      description: "Dettagli su settore, budget e stile preferito"
    },
    {
      number: 4,
      title: "Personalizzazione Finale",
      icon: <Rocket className="w-5 h-5" />,
      description: "Ultimi dettagli per ottimizzare il tuo funnel"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  step >= s.number
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-muted bg-background'
                }`}
              >
                {s.icon}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 transition-all ${
                    step > s.number ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{steps[step - 1].title}</h2>
          <p className="text-muted-foreground">{steps[step - 1].description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {steps[step - 1].icon}
            Creazione Funnel Intelligente - Step {step} di 4
          </CardTitle>
          <CardDescription>
            Il nostro AI analizzerà le tue risposte per creare un funnel ultra-personalizzato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Business Description */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="business_description" className="text-base font-medium">
                  Descrivi il tuo business e cosa offri *
                </Label>
                <Textarea
                  id="business_description"
                  placeholder="Es: Sono un consulente di marketing digitale che aiuta le PMI a incrementare le vendite online attraverso strategie personalizzate. Offro audit completi, consulenze strategiche e implementazione di campagne..."
                  value={formData.business_description}
                  onChange={(e) => handleInputChange('business_description', e.target.value)}
                  className="min-h-32 mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Più dettagli fornisci, più personalizzato sarà il tuo funnel. Minimo 20 caratteri.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Target & Goals */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="targetAudience" className="text-base font-medium">
                  Chi è il tuo cliente ideale? *
                </Label>
                <Textarea
                  id="targetAudience"
                  placeholder="Es: Imprenditori di PMI tra i 35-55 anni, principalmente nel settore servizi, che fatturano tra 100k-1M€ annui e vogliono digitalizzare il loro business..."
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  className="min-h-24 mt-2"
                />
              </div>
              <div>
                <Label htmlFor="main_goal" className="text-base font-medium">
                  Qual è il tuo obiettivo principale? *
                </Label>
                <Textarea
                  id="main_goal"
                  placeholder="Es: Generare 50 lead qualificati al mese per consultazioni strategiche, con un tasso di conversione del 20% in clienti paganti..."
                  value={formData.main_goal}
                  onChange={(e) => handleInputChange('main_goal', e.target.value)}
                  className="min-h-24 mt-2"
                />
              </div>
            </div>
          )}

          {/* Step 3: Context & Preferences */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry" className="text-base font-medium">
                    Settore di riferimento *
                  </Label>
                  <Select 
                    value={formData.industry} 
                    onValueChange={(value) => handleInputChange('industry', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Seleziona il settore" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="consulenza">Consulenza</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="formazione">Formazione</SelectItem>
                      <SelectItem value="salute">Salute e Benessere</SelectItem>
                      <SelectItem value="finance">Finanza</SelectItem>
                      <SelectItem value="immobiliare">Immobiliare</SelectItem>
                      <SelectItem value="ristorazione">Ristorazione</SelectItem>
                      <SelectItem value="turismo">Turismo</SelectItem>
                      <SelectItem value="altro">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget_range" className="text-base font-medium">
                    Budget mensile marketing
                  </Label>
                  <Select 
                    value={formData.budget_range} 
                    onValueChange={(value) => handleInputChange('budget_range', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Seleziona il budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<1000">Meno di €1.000</SelectItem>
                      <SelectItem value="1000-5000">€1.000 - €5.000</SelectItem>
                      <SelectItem value="5000-10000">€5.000 - €10.000</SelectItem>
                      <SelectItem value="10000-25000">€10.000 - €25.000</SelectItem>
                      <SelectItem value="25000+">Più di €25.000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeline" className="text-base font-medium">
                    Timeline per risultati
                  </Label>
                  <Select 
                    value={formData.timeline} 
                    onValueChange={(value) => handleInputChange('timeline', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Seleziona timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Risultati immediati</SelectItem>
                      <SelectItem value="1-3months">1-3 mesi</SelectItem>
                      <SelectItem value="3-6months">3-6 mesi</SelectItem>
                      <SelectItem value="6-12months">6-12 mesi</SelectItem>
                      <SelectItem value="long-term">Crescita a lungo termine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experience_level" className="text-base font-medium">
                    Esperienza con funnel marketing
                  </Label>
                  <Select 
                    value={formData.experience_level} 
                    onValueChange={(value) => handleInputChange('experience_level', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Seleziona esperienza" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzato</SelectItem>
                      <SelectItem value="expert">Esperto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Final Customization */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="preferred_style" className="text-base font-medium">
                  Stile e tono preferito
                </Label>
                <Select 
                  value={formData.preferred_style} 
                  onValueChange={(value) => handleInputChange('preferred_style', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Seleziona lo stile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professionale</SelectItem>
                    <SelectItem value="friendly">Amichevole</SelectItem>
                    <SelectItem value="luxury">Lusso/Premium</SelectItem>
                    <SelectItem value="tech">Tecnologico</SelectItem>
                    <SelectItem value="creative">Creativo</SelectItem>
                    <SelectItem value="authoritative">Autorevole</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="specific_requirements" className="text-base font-medium">
                  Requisiti specifici o informazioni aggiuntive
                </Label>
                <Textarea
                  id="specific_requirements"
                  placeholder="Es: Devo integrare con il mio CRM esistente, ho bisogno di compliance GDPR, voglio includere video testimonial, etc..."
                  value={formData.specific_requirements}
                  onChange={(e) => handleInputChange('specific_requirements', e.target.value)}
                  className="min-h-24 mt-2"
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">🎯 Il tuo Funnel Intelligente includerà:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✨ Analisi psicologica del target</li>
                  <li>🎨 Design e colori ottimizzati per il settore</li>
                  <li>📊 Trigger di conversione personalizzati</li>
                  <li>🚀 Strategia di implementazione step-by-step</li>
                  <li>📈 Proiezioni ROI realistiche</li>
                  <li>🎪 Elementi di personalizzazione avanzata</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={step === 1}
            >
              Indietro
            </Button>
            
            {step < 4 ? (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Continua
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={createSmartFunnel.isPending || !canProceed()}
                className="min-w-40"
              >
                {createSmartFunnel.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creazione in corso...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Crea Funnel Intelligente
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
