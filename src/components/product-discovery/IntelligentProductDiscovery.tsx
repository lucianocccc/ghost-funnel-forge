
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Users, 
  Zap,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  Eye,
  Rocket
} from 'lucide-react';

interface IntelligentQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'scale';
  options?: string[];
  required: boolean;
  category: 'product' | 'market' | 'audience' | 'goals';
  followUp?: string;
  aiContext: string;
}

interface DiscoveryResponse {
  questionId: string;
  answer: string | string[] | number;
  confidence: number;
}

interface IntelligentProductDiscoveryProps {
  onComplete: (data: any) => void;
}

const IntelligentProductDiscovery: React.FC<IntelligentProductDiscoveryProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<DiscoveryResponse[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [intelligentQuestions, setIntelligentQuestions] = useState<IntelligentQuestion[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>('');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(true);

  const baseQuestions: IntelligentQuestion[] = [
    {
      id: 'product_name',
      question: 'Qual è il nome del tuo prodotto o servizio?',
      type: 'text',
      required: true,
      category: 'product',
      aiContext: 'Nome del prodotto per personalizzazione completa'
    },
    {
      id: 'product_description',
      question: 'Descrivi il tuo prodotto/servizio in modo dettagliato',
      type: 'textarea',
      required: true,
      category: 'product',
      aiContext: 'Descrizione dettagliata per analisi approfondita'
    },
    {
      id: 'target_audience',
      question: 'Chi è il tuo cliente ideale?',
      type: 'textarea',
      required: true,
      category: 'audience',
      aiContext: 'Target audience per personalizzazione del messaging'
    },
    {
      id: 'industry_sector',
      question: 'In quale settore operi?',
      type: 'select',
      options: [
        'Tecnologia/Software',
        'E-commerce',
        'Servizi Professionali',
        'Salute e Benessere',
        'Finanza',
        'Istruzione',
        'Marketing',
        'Immobiliare',
        'Manifatturiero',
        'Altro'
      ],
      required: true,
      category: 'market',
      aiContext: 'Settore per analisi competitiva e positioning'
    }
  ];

  useEffect(() => {
    generateIntelligentQuestions();
  }, []);

  const generateIntelligentQuestions = async () => {
    setIsGeneratingQuestions(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-intelligent-questions', {
        body: { 
          baseQuestions,
          context: 'product_discovery',
          intelligenceLevel: 'advanced'
        }
      });

      if (error) throw error;

      setIntelligentQuestions(data.questions || baseQuestions);
    } catch (error) {
      console.error('Errore nella generazione delle domande:', error);
      setIntelligentQuestions(baseQuestions);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAnswer = (answer: string | string[]) => {
    setCurrentAnswer(answer);
  };

  const handleNext = async () => {
    const currentQuestion = intelligentQuestions[currentStep];
    
    if (currentQuestion.required && !currentAnswer) {
      toast({
        title: "Risposta richiesta",
        description: "Per favore rispondi a questa domanda per continuare",
        variant: "destructive"
      });
      return;
    }

    const response: DiscoveryResponse = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      confidence: 0.9
    };

    const newResponses = [...responses, response];
    setResponses(newResponses);
    setCurrentAnswer('');

    // Genera domande di follow-up intelligenti se necessario
    if (currentStep === 3) { // Dopo le domande base
      const followUpQuestions = await generateFollowUpQuestions(newResponses);
      setIntelligentQuestions([...intelligentQuestions, ...followUpQuestions]);
    }

    if (currentStep < intelligentQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeDiscovery(newResponses);
    }
  };

  const generateFollowUpQuestions = async (responses: DiscoveryResponse[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-follow-up-questions', {
        body: { 
          responses,
          currentQuestions: intelligentQuestions
        }
      });

      if (error) throw error;

      return data.followUpQuestions || [];
    } catch (error) {
      console.error('Errore nella generazione delle domande di follow-up:', error);
      return [];
    }
  };

  const completeDiscovery = async (allResponses: DiscoveryResponse[]) => {
    setIsAnalyzing(true);
    
    try {
      // Trasforma le risposte in un formato strutturato
      const structuredData = allResponses.reduce((acc, response) => {
        acc[response.questionId] = response.answer;
        return acc;
      }, {} as any);

      // Esegui analisi intelligente
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-product-intelligence', {
        body: {
          responses: structuredData,
          userId: user?.id,
          analysisType: 'comprehensive'
        }
      });

      if (analysisError) throw analysisError;

      setAnalysisResult(analysisData);
      
      // Genera il funnel personalizzato
      const productData = {
        productName: structuredData.product_name,
        description: structuredData.product_description,
        targetAudience: {
          primary: structuredData.target_audience,
          industry: structuredData.industry_sector
        },
        uniqueValue: structuredData.unique_value || 'Valore unico identificato dall\'AI',
        keyBenefits: structuredData.key_benefits || ['Beneficio 1', 'Beneficio 2', 'Beneficio 3']
      };

      const { data: funnelData, error: funnelError } = await supabase.functions.invoke('generate-cinematic-product-funnel', {
        body: {
          productData,
          userId: user?.id,
          generateVisuals: true,
          optimizeForConversion: true
        }
      });

      if (funnelError) throw funnelError;

      toast({
        title: "🎉 Analisi Completata!",
        description: "Il tuo funnel cinematico personalizzato è stato generato con successo",
      });

      onComplete({
        responses: allResponses,
        analysis: analysisData,
        funnel: funnelData.funnel,
        intelligence: funnelData
      });

    } catch (error) {
      console.error('Errore nell\'analisi:', error);
      toast({
        title: "Errore",
        description: "Errore nell'analisi del prodotto. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isGeneratingQuestions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            🧠 Generazione Domande Intelligenti
          </h3>
          <p className="text-gray-600">
            L'AI sta preparando le domande perfette per il tuo prodotto...
          </p>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-pulse">
            <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            🔬 Analisi Intelligente in Corso
          </h3>
          <p className="text-gray-600 mb-4">
            L'AI sta analizzando le tue risposte per creare il funnel perfetto...
          </p>
          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-1" />
              Analisi Target
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Market Intelligence
            </div>
            <div className="flex items-center">
              <Sparkles className="w-4 h-4 mr-1" />
              Personalizzazione
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = intelligentQuestions[currentStep];
  const progress = ((currentStep + 1) / intelligentQuestions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              Analisi Intelligente del Prodotto
            </h2>
            <p className="text-gray-600 mt-1">
              Risposta {currentStep + 1} di {intelligentQuestions.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-purple-100 text-purple-700">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Current Question */}
      <Card className="border-2 border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
              {currentStep + 1}
            </div>
            {currentQuestion?.question}
          </CardTitle>
          {currentQuestion?.category && (
            <Badge variant="secondary" className="bg-white/20 text-white w-fit">
              {currentQuestion.category === 'product' && <Rocket className="w-3 h-3 mr-1" />}
              {currentQuestion.category === 'market' && <TrendingUp className="w-3 h-3 mr-1" />}
              {currentQuestion.category === 'audience' && <Users className="w-3 h-3 mr-1" />}
              {currentQuestion.category === 'goals' && <Target className="w-3 h-3 mr-1" />}
              {currentQuestion.category}
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            {currentQuestion?.type === 'text' && (
              <Input
                placeholder="Scrivi la tua risposta..."
                value={currentAnswer as string}
                onChange={(e) => handleAnswer(e.target.value)}
                className="text-lg p-4"
              />
            )}
            
            {currentQuestion?.type === 'textarea' && (
              <Textarea
                placeholder="Descrivi in dettaglio..."
                value={currentAnswer as string}
                onChange={(e) => handleAnswer(e.target.value)}
                className="min-h-[120px] text-lg p-4"
              />
            )}
            
            {currentQuestion?.type === 'select' && (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options?.map((option, index) => (
                  <Button
                    key={index}
                    variant={currentAnswer === option ? "default" : "outline"}
                    onClick={() => handleAnswer(option)}
                    className="p-4 h-auto text-left justify-start"
                  >
                    <CheckCircle className={`w-4 h-4 mr-2 ${currentAnswer === option ? 'text-white' : 'text-gray-400'}`} />
                    {option}
                  </Button>
                ))}
              </div>
            )}
            
            {currentQuestion?.type === 'multiselect' && (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options?.map((option, index) => {
                  const isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(option);
                  return (
                    <Button
                      key={index}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => {
                        const current = Array.isArray(currentAnswer) ? currentAnswer : [];
                        if (isSelected) {
                          handleAnswer(current.filter(item => item !== option));
                        } else {
                          handleAnswer([...current, option]);
                        }
                      }}
                      className="p-4 h-auto text-left justify-start"
                    >
                      <CheckCircle className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                      {option}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div className="text-sm text-gray-500">
              {currentQuestion?.required && (
                <span className="text-red-500">* Risposta richiesta</span>
              )}
            </div>
            
            <Button
              onClick={handleNext}
              disabled={currentQuestion?.required && !currentAnswer}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
            >
              {currentStep === intelligentQuestions.length - 1 ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Genera Funnel AI
                </>
              ) : (
                <>
                  Avanti
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicators */}
      <div className="grid grid-cols-4 gap-4">
        {['Prodotto', 'Mercato', 'Audience', 'Strategia'].map((category, index) => {
          const isActive = currentStep >= index;
          const isCompleted = currentStep > index;
          
          return (
            <div
              key={category}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                isCompleted 
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : isActive
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-bold ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isActive
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-300 text-gray-500'
              }`}>
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
              </div>
              <span className="text-sm font-medium">{category}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IntelligentProductDiscovery;
