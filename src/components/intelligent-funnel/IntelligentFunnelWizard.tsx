
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, Target, Lightbulb, Rocket, TrendingUp, Users, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ObjectiveAnalysis {
  primaryGoal: string;
  secondaryGoals: string[];
  targetAudience: string;
  urgency: 'low' | 'medium' | 'high';
  budget: string;
  timeline: string;
  industry: string;
  businessStage: string;
  currentChallenges: string[];
  successMetrics: string[];
}

interface IntelligentFunnelWizardProps {
  onFunnelGenerated?: (funnel: any) => void;
  onClose?: () => void;
}

export const IntelligentFunnelWizard: React.FC<IntelligentFunnelWizardProps> = ({
  onFunnelGenerated,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [objectiveAnalysis, setObjectiveAnalysis] = useState<ObjectiveAnalysis>({
    primaryGoal: '',
    secondaryGoals: [],
    targetAudience: '',
    urgency: 'medium',
    budget: '',
    timeline: '',
    industry: '',
    businessStage: '',
    currentChallenges: [],
    successMetrics: []
  });
  const [dynamicQuestions, setDynamicQuestions] = useState<any[]>([]);
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, any>>({});
  const [suggestedFunnelTypes, setSuggestedFunnelTypes] = useState<any[]>([]);
  const [selectedFunnelType, setSelectedFunnelType] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const renderObjectiveStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <Brain className="w-16 h-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold">Analisi Obiettivi Intelligente</h2>
        <p className="text-muted-foreground">
          Aiutami a comprendere i tuoi obiettivi specifici per creare il funnel perfetto
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="primaryGoal">Obiettivo Principale *</Label>
            <Textarea
              id="primaryGoal"
              placeholder="Es: Aumentare le vendite del 30% entro 3 mesi per il mio corso online di marketing digitale..."
              value={objectiveAnalysis.primaryGoal}
              onChange={(e) => setObjectiveAnalysis(prev => ({ ...prev, primaryGoal: e.target.value }))}
              className="min-h-24"
            />
          </div>

          <div>
            <Label htmlFor="targetAudience">Target Audience Specifico *</Label>
            <Textarea
              id="targetAudience"
              placeholder="Es: Imprenditori digitali 25-45 anni, fatturato 50k-200k€, che vogliono automatizzare il marketing..."
              value={objectiveAnalysis.targetAudience}
              onChange={(e) => setObjectiveAnalysis(prev => ({ ...prev, targetAudience: e.target.value }))}
              className="min-h-20"
            />
          </div>

          <div>
            <Label htmlFor="industry">Settore di Riferimento *</Label>
            <Select 
              value={objectiveAnalysis.industry} 
              onValueChange={(value) => setObjectiveAnalysis(prev => ({ ...prev, industry: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona settore" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">Tecnologia & Software</SelectItem>
                <SelectItem value="education">Formazione & Corsi Online</SelectItem>
                <SelectItem value="consulting">Consulenza & Servizi</SelectItem>
                <SelectItem value="ecommerce">E-commerce & Retail</SelectItem>
                <SelectItem value="finance">Finanza & Investimenti</SelectItem>
                <SelectItem value="health">Salute & Benessere</SelectItem>
                <SelectItem value="realestate">Immobiliare</SelectItem>
                <SelectItem value="marketing">Marketing & Pubblicità</SelectItem>
                <SelectItem value="food">Food & Beverage</SelectItem>
                <SelectItem value="other">Altro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="businessStage">Fase del Business</Label>
            <Select 
              value={objectiveAnalysis.businessStage} 
              onValueChange={(value) => setObjectiveAnalysis(prev => ({ ...prev, businessStage: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startup">Startup (0-1 anno)</SelectItem>
                <SelectItem value="growth">Crescita (1-3 anni)</SelectItem>
                <SelectItem value="established">Consolidato (3+ anni)</SelectItem>
                <SelectItem value="scaling">Scaling (espansione)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="urgency">Urgenza</Label>
              <Select 
                value={objectiveAnalysis.urgency} 
                onValueChange={(value: 'low' | 'medium' | 'high') => {
                  setObjectiveAnalysis(prev => ({ ...prev, urgency: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Bassa</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timeline">Timeline</Label>
              <Select 
                value={objectiveAnalysis.timeline} 
                onValueChange={(value) => setObjectiveAnalysis(prev => ({ ...prev, timeline: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 mese</SelectItem>
                  <SelectItem value="3months">3 mesi</SelectItem>
                  <SelectItem value="6months">6 mesi</SelectItem>
                  <SelectItem value="12months">12+ mesi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="budget">Budget Marketing Mensile</Label>
            <Select 
              value={objectiveAnalysis.budget} 
              onValueChange={(value) => setObjectiveAnalysis(prev => ({ ...prev, budget: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Range budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<1000">< €1.000</SelectItem>
                <SelectItem value="1000-5000">€1.000 - €5.000</SelectItem>
                <SelectItem value="5000-10000">€5.000 - €10.000</SelectItem>
                <SelectItem value="10000-25000">€10.000 - €25.000</SelectItem>
                <SelectItem value="25000+">€25.000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderDynamicQuestionsStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <Lightbulb className="w-16 h-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold">Domande Personalizzate</h2>
        <p className="text-muted-foreground">
          Basandomi sui tuoi obiettivi, ho generato queste domande specifiche
        </p>
      </div>

      {dynamicQuestions.map((question, index) => (
        <Card key={index} className="p-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">{question.question}</Label>
            {question.type === 'text' && (
              <Input
                value={dynamicAnswers[question.id] || ''}
                onChange={(e) => setDynamicAnswers(prev => ({
                  ...prev,
                  [question.id]: e.target.value
                }))}
                placeholder={question.placeholder}
              />
            )}
            {question.type === 'textarea' && (
              <Textarea
                value={dynamicAnswers[question.id] || ''}
                onChange={(e) => setDynamicAnswers(prev => ({
                  ...prev,
                  [question.id]: e.target.value
                }))}
                placeholder={question.placeholder}
                className="min-h-20"
              />
            )}
            {question.type === 'select' && (
              <Select 
                value={dynamicAnswers[question.id] || ''} 
                onValueChange={(value) => setDynamicAnswers(prev => ({
                  ...prev,
                  [question.id]: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona..." />
                </SelectTrigger>
                <SelectContent>
                  {question.options?.map((option: string, optIndex: number) => (
                    <SelectItem key={optIndex} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {question.type === 'multiselect' && (
              <div className="space-y-2">
                {question.options?.map((option: string, optIndex: number) => (
                  <div key={optIndex} className="flex items-center space-x-2">
                    <Checkbox
                      checked={(dynamicAnswers[question.id] || []).includes(option)}
                      onCheckedChange={(checked) => {
                        const current = dynamicAnswers[question.id] || [];
                        setDynamicAnswers(prev => ({
                          ...prev,
                          [question.id]: checked 
                            ? [...current, option]
                            : current.filter((item: string) => item !== option)
                        }));
                      }}
                    />
                    <Label>{option}</Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      ))}
    </motion.div>
  );

  const renderFunnelTypeStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <Target className="w-16 h-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold">Tipologie Funnel Suggerite</h2>
        <p className="text-muted-foreground">
          Basandomi sulla tua analisi, questi sono i funnel più efficaci per i tuoi obiettivi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestedFunnelTypes.map((funnelType, index) => (
          <Card 
            key={index}
            className={`cursor-pointer transition-all border-2 ${
              selectedFunnelType === funnelType.id 
                ? 'border-primary bg-primary/5' 
                : 'border-muted hover:border-primary/50'
            }`}
            onClick={() => setSelectedFunnelType(funnelType.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{funnelType.name}</CardTitle>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>{funnelType.matchScore}% match</span>
                </div>
              </div>
              <CardDescription>{funnelType.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Conversion Rate Attesa:</span>
                  <span className="font-medium">{funnelType.expectedConversion}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Complessità:</span>
                  <span className="font-medium">{funnelType.complexity}</span>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground">Vantaggi chiave:</div>
                  <ul className="text-xs space-y-1 mt-1">
                    {funnelType.benefits?.map((benefit: string, bIndex: number) => (
                      <li key={bIndex} className="flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-primary" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );

  const renderReviewStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <Rocket className="w-16 h-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold">Revisione & Personalizzazione</h2>
        <p className="text-muted-foreground">
          Controlla e personalizza gli ultimi dettagli prima della generazione
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Obiettivo Principale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{objectiveAnalysis.primaryGoal}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target Audience</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{objectiveAnalysis.targetAudience}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funnel Selezionato</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {suggestedFunnelTypes.find(f => f.id === selectedFunnelType)?.name || 'Nessuno selezionato'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parametri</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div>Settore: {objectiveAnalysis.industry}</div>
            <div>Timeline: {objectiveAnalysis.timeline}</div>
            <div>Budget: {objectiveAnalysis.budget}</div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );

  const renderGenerationStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 text-center"
    >
      <Brain className="w-24 h-24 mx-auto text-primary animate-pulse" />
      <h2 className="text-2xl font-bold">Generazione Funnel Intelligente</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Sto creando il tuo funnel personalizzato basandomi su:
        <br />✓ Analisi comportamentale del target
        <br />✓ Ricerca competitiva in tempo reale  
        <br />✓ Ottimizzazione copy personalizzata
        <br />✓ Strategia di conversione avanzata
      </p>
      
      {isGenerating && (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Generazione in corso...</span>
          </div>
          <Progress value={75} className="max-w-md mx-auto" />
        </div>
      )}
    </motion.div>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return objectiveAnalysis.primaryGoal.length > 20 && 
               objectiveAnalysis.targetAudience.length > 10 && 
               objectiveAnalysis.industry;
      case 2:
        return dynamicQuestions.length === 0 || 
               dynamicQuestions.every(q => dynamicAnswers[q.id]);
      case 3:
        return selectedFunnelType;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      await generateDynamicQuestions();
    } else if (currentStep === 2) {
      await analyzeFunnelTypes();
    } else if (currentStep === 4) {
      await handleGeneration();
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const generateDynamicQuestions = async () => {
    setIsAnalyzing(true);
    try {
      const questions = [
        {
          id: 'current_marketing',
          question: 'Quali canali di marketing stai utilizzando attualmente?',
          type: 'multiselect',
          options: ['Social Media', 'Email Marketing', 'SEO', 'Paid Ads', 'Content Marketing', 'Referral']
        },
        {
          id: 'main_challenge',
          question: 'Qual è la principale sfida che stai affrontando?',
          type: 'select',
          options: ['Generare lead', 'Convertire lead', 'Aumentare AOV', 'Retention clienti']
        },
        {
          id: 'unique_value',
          question: 'Cosa ti differenzia dalla concorrenza?',
          type: 'textarea',
          placeholder: 'Descrivi la tua unique value proposition...'
        }
      ];
      
      setDynamicQuestions(questions);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeFunnelTypes = async () => {
    setIsAnalyzing(true);
    try {
      const suggestions = [
        {
          id: 'lead_magnet',
          name: 'Lead Magnet Funnel',
          description: 'Cattura lead con contenuto di valore, poi nutri con email sequence',
          matchScore: 95,
          expectedConversion: 15,
          complexity: 'Media',
          benefits: ['Alto engagement', 'Costruisce authority', 'Nurturing automatico']
        },
        {
          id: 'tripwire',
          name: 'Tripwire Funnel',
          description: 'Offerta irresistibile a basso prezzo per qualificare buyer',
          matchScore: 88,
          expectedConversion: 8,
          complexity: 'Bassa',
          benefits: ['Qualifica buyer', 'ROI immediato', 'Upsell opportunità']
        }
      ];

      setSuggestedFunnelTypes(suggestions);
    } catch (error) {
      console.error('Error analyzing funnel types:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGeneration = async () => {
    setIsGenerating(true);
    try {
      const selectedFunnel = suggestedFunnelTypes.find(f => f.id === selectedFunnelType);
      
      const mockResult = {
        id: 'generated-funnel-' + Date.now(),
        name: `Funnel ${selectedFunnel?.name || 'Personalizzato'}`,
        description: objectiveAnalysis.primaryGoal,
        steps: [
          { name: 'Landing Page', type: 'landing' },
          { name: 'Lead Capture', type: 'capture' },
          { name: 'Thank You Page', type: 'thankyou' }
        ]
      };

      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (onFunnelGenerated) {
        onFunnelGenerated(mockResult);
      }

      toast({
        title: "Funnel Generato!",
        description: "Il tuo funnel intelligente è stato creato con successo",
      });
    } catch (error) {
      console.error('Error generating funnel:', error);
      toast({
        title: "Errore",
        description: "Errore nella generazione del funnel",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderObjectiveStep();
      case 2: return renderDynamicQuestionsStep();
      case 3: return renderFunnelTypeStep();
      case 4: return renderReviewStep();
      case 5: return renderGenerationStep();
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Wizard Funnel Intelligente</h1>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Chiudi
            </Button>
          )}
        </div>
        
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>Passo {currentStep} di {totalSteps}</span>
          <span>{Math.round(progress)}% completato</span>
        </div>
      </div>

      <Card className="min-h-96">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            {renderCurrentStep()}
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1 || isGenerating}
        >
          Indietro
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!canProceed() || isAnalyzing || isGenerating}
          className="min-w-32"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analizzando...
            </>
          ) : isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generando...
            </>
          ) : currentStep === totalSteps ? (
            'Completa'
          ) : (
            'Continua'
          )}
        </Button>
      </div>
    </div>
  );
};
