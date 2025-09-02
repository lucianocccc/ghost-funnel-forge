import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, MessageSquare, ArrowRight, CheckCircle, Save, Share } from 'lucide-react';
import { useSmartFunnelGenerator } from '@/hooks/useSmartFunnelGenerator';
import { applyBrandStyles } from '@/config/brandStyles';
import { PremiumCard } from '@/components/premium-ui/PremiumCard';
import { PremiumButton } from '@/components/premium-ui/PremiumButton';
import BrandStyleIndicator from '@/components/BrandStyleIndicator';
import BrandAssetsHero from '@/components/brand/BrandAssetsHero';
import FunnelHTMLPreview from '@/components/smart-funnel/FunnelHTMLPreview';

const SmartFunnelGenerator = () => {
  const [initialPrompt, setInitialPrompt] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const navigate = useNavigate();
  
  const {
    state,
    analyzePrompt,
    answerQuestion,
    generateFunnel,
    saveFunnel,
    getCurrentQuestion,
    isComplete,
    getProgress,
    reset
  } = useSmartFunnelGenerator();

  const handleStartAnalysis = async () => {
    if (initialPrompt.trim().length < 10) {
      return;
    }
    await analyzePrompt(initialPrompt);
  };

  const handleAnswerQuestion = () => {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion && currentAnswer.trim()) {
      answerQuestion(currentQuestion.id, currentAnswer);
      setCurrentAnswer('');
    }
  };

  const handleGenerateFunnel = async () => {
    const result = await generateFunnel();
    if (result?.style) {
      const brandId = typeof result.style === 'string' ? result.style.toLowerCase() : 'apple';
      applyBrandStyles(brandId as any);
    }
  };

  const handleSaveAndPublish = async () => {
    const result = await saveFunnel();
    if (result) {
      // Redirect to Revolution Funnels List after successful save
      setTimeout(() => {
        navigate('/revolution/funnels');
      }, 2000);
    }
  };

  const handleReset = () => {
    reset();
    setInitialPrompt('');
    setCurrentAnswer('');
  };

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-purple-900">Smart Funnel Generator</h2>
              <p className="text-purple-700 font-normal text-sm">
                Genera un funnel conversion-killer con neuro-copywriting + max 5 domande intelligenti
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Step 1: Initial Prompt */}
      {!state.analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Descrivi il tuo progetto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Raccontaci del tuo business, prodotto o servizio
              </label>
              <Textarea
                placeholder="Es: Sono un consulente di marketing digitale che offre servizi di lead generation per PMI nel settore B2B. Il mio target sono aziende manifatturiere del Nord Italia con 50-200 dipendenti che vogliono aumentare le vendite online..."
                value={initialPrompt}
                onChange={(e) => setInitialPrompt(e.target.value)}
                rows={6}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Più dettagli fornisci, meno domande dovrai rispondere
              </p>
            </div>
            
            <Button 
              onClick={handleStartAnalysis}
              disabled={state.isAnalyzing || initialPrompt.trim().length < 10}
              className="w-full"
            >
              {state.isAnalyzing ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-pulse" />
                  Analizzando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analizza e Genera Domande
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Questions Flow */}
      {state.analysis && !isComplete() && (
        <div className="space-y-4">
          {/* Progress Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progresso completamento</span>
                  <span className="text-muted-foreground">
                    {state.currentQuestionIndex}/{state.analysis.questions.length} domande
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Current Question */}
          {currentQuestion && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <MessageSquare className="w-5 h-5" />
                  Domanda {state.currentQuestionIndex + 1}
                  {currentQuestion.required && (
                    <Badge variant="destructive" className="ml-2">Obbligatoria</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-lg font-medium text-blue-900">
                    {currentQuestion.question}
                  </p>
                  <p className="text-sm text-blue-700 bg-blue-100 p-2 rounded">
                    💡 {currentQuestion.context}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Textarea
                    placeholder="La tua risposta..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    rows={3}
                    className="border-blue-200 focus:ring-blue-500"
                  />
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAnswerQuestion}
                      disabled={!currentAnswer.trim()}
                      className="flex-1"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Prossima Domanda
                    </Button>
                    
                    {!currentQuestion.required && (
                      <Button 
                        variant="outline"
                        onClick={() => answerQuestion(currentQuestion.id, '')}
                      >
                        Salta
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Previous Answers Preview */}
          {Object.keys(state.answers).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Risposte precedenti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(state.answers).map(([questionId, answer]) => {
                    const question = state.analysis?.questions.find(q => q.id === questionId);
                    return answer ? (
                      <div key={questionId} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-green-900">{question?.question}</p>
                          <p className="text-green-700">{answer}</p>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 3: Generate Funnel */}
      {isComplete() && !state.generatedFunnel && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="w-5 h-5" />
              Pronto per generare il tuo funnel!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-800">
              Abbiamo raccolto tutte le informazioni necessarie. 
              {state.analysis?.readyToGenerate 
                ? " Il tuo prompt iniziale era già molto completo!"
                : ` Risposte raccolte: ${Object.values(state.answers).filter(Boolean).length}`
              }
            </p>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleGenerateFunnel}
                disabled={state.isGenerating}
                className="flex-1"
              >
                {state.isGenerating ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-pulse" />
                    Generando Funnel...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Genera il Mio Funnel
                  </>
                )}
              </Button>
              
              <Button variant="outline" onClick={handleReset}>
                Ricomincia
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Generated Funnel Preview */}
      {state.generatedFunnel && (
        <div className="space-y-6">
          {/* Generation Success */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h3 className="font-semibold text-green-900">Funnel Conversion-Killer Generato!</h3>
                  <p className="text-green-700 text-sm">
                    Il tuo funnel con neuro-copywriting ottimizzato è pronto. 
                    Stile: {typeof state.generatedFunnel.style === 'object' ? state.generatedFunnel.style.visualStyle : state.generatedFunnel.style}
                    {state.generatedFunnel.smart_generation_metadata?.buyer_persona && (
                      <> • Persona: {state.generatedFunnel.smart_generation_metadata.buyer_persona}</>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hero Visivo Generato */}
          <BrandAssetsHero
            productName={state.generatedFunnel.name ?? 'Progetto'}
            productDescription={state.generatedFunnel.description}
            industry={typeof state.generatedFunnel.style === 'object' ? state.generatedFunnel.style.industry : undefined}
            visualStyle={typeof state.generatedFunnel.style === 'object' ? state.generatedFunnel.style.visualStyle : undefined}
            className="rounded-xl animate-fade-in"
          />

          {/* Funnel Preview */}
          {state.generatedFunnel.html_content ? (
            /* New HTML-based funnel */
            <div className="space-y-6">
              <FunnelHTMLPreview 
                htmlContent={state.generatedFunnel.html_content}
                funnelData={state.generatedFunnel}
                metadata={state.generatedFunnel.metadata}
              />
            </div>
          ) : state.generatedFunnel.hero ? (
            /* Legacy funnel structure */
            <PremiumCard 
              variant={(typeof state.generatedFunnel.style === 'string' ? state.generatedFunnel.style.toLowerCase() : 'apple') as 'apple' | 'nike' | 'amazon'} 
              size="lg" 
              animation="glow"
            >
              <div className="text-center space-y-6">
                {/* Hero Section */}
                <div className="space-y-4">
                  <h1 
                    className="text-4xl font-bold leading-tight"
                    style={{ 
                      fontFamily: 'var(--brand-font-heading)', 
                      fontWeight: 'var(--brand-weight-heading)',
                      color: `hsl(var(--brand-text))`
                    }}
                  >
                    {state.generatedFunnel.hero.headline}
                  </h1>
                  <p 
                    className="text-xl opacity-90"
                    style={{ 
                      fontFamily: 'var(--brand-font-body)',
                      color: `hsl(var(--brand-muted))`
                    }}
                  >
                    {state.generatedFunnel.hero.subheadline}
                  </p>
                  <div className="mt-6">
                    <PremiumButton 
                      variant={(typeof state.generatedFunnel.style === 'string' ? state.generatedFunnel.style.toLowerCase() : 'apple') as 'apple' | 'nike' | 'amazon'} 
                      size="lg" 
                      animation="glow"
                    >
                      {state.generatedFunnel.hero.cta_text}
                    </PremiumButton>
                  </div>
                </div>

                {/* Advantages Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  {state.generatedFunnel.advantages?.slice(0, 3).map((advantage: any, index: number) => (
                    <PremiumCard 
                      key={index} 
                      variant={(typeof state.generatedFunnel.style === 'string' ? state.generatedFunnel.style.toLowerCase() : 'apple') as 'apple' | 'nike' | 'amazon'} 
                      size="md" 
                      animation="scale"
                      className="text-center hover-scale"
                    >
                      <div className="space-y-3">
                        <h3 
                          className="font-semibold text-lg"
                          style={{ 
                            fontFamily: 'var(--brand-font-heading)',
                            color: `hsl(var(--brand-text))`
                          }}
                        >
                          {advantage.title}
                        </h3>
                        <p 
                          className="text-sm"
                          style={{ color: `hsl(var(--brand-muted))` }}
                        >
                          {advantage.description}
                        </p>
                      </div>
                    </PremiumCard>
                  ))}
                </div>
              </div>
            </PremiumCard>
          ) : (
            /* Fallback if no data */
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Struttura funnel non disponibile
                </p>
              </CardContent>
            </Card>
          )}

          {Array.isArray(state.generatedFunnel.modularStructure) && state.generatedFunnel.modularStructure.length > 0 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Struttura Modulare Generata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {state.generatedFunnel.modularStructure.map((section: any, idx: number) => (
                    <PremiumCard
                      key={section.id || idx}
                      variant={(typeof state.generatedFunnel.style === 'string' ? state.generatedFunnel.style.toLowerCase() : 'apple') as 'apple' | 'nike' | 'amazon'}
                      size="md"
                      animation="scale"
                      className="hover-scale"
                    >
                      <article className="space-y-2">
                        <h4 className="text-base font-semibold">{section.config?.template || section.section_type}</h4>
                        <p className="text-sm text-muted-foreground">{section.section_type}</p>
                        {section.config?.microcopy?.headline && (
                          <p className="text-sm">{section.config.microcopy.headline}</p>
                        )}
                        {section.config?.microcopy?.description && (
                          <p className="text-xs text-muted-foreground">{section.config.microcopy.description}</p>
                        )}
                        {section.config?.microcopy?.cta && (
                          <span className="inline-block text-xs story-link mt-1">{section.config.microcopy.cta}</span>
                        )}
                      </article>
                    </PremiumCard>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generation Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Dettagli Generazione Smart</span>
                <BrandStyleIndicator style={state.generatedFunnel.style} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.generatedFunnel.smart_generation_metadata && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium">Domande Poste</h4>
                    <p className="text-muted-foreground">
                      {state.generatedFunnel.smart_generation_metadata.questions_asked}/5
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Confidence Score</h4>
                    <p className="text-muted-foreground">
                      {Math.round(state.generatedFunnel.smart_generation_metadata.confidence_score * 100)}%
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Buyer Persona</h4>
                    <p className="text-muted-foreground">
                      {state.generatedFunnel.smart_generation_metadata.buyer_persona || 'Professional'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Neuro-Copy</h4>
                    <p className="text-green-600 font-medium">
                      {state.generatedFunnel.smart_generation_metadata.conversion_optimized ? '✅ Attivo' : '❌ Disattivo'}
                    </p>
                  </div>
                </div>
              )}
              
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  Genera Nuovo Funnel
                </Button>
                <Button 
                  onClick={handleSaveAndPublish}
                  disabled={state.isSaving}
                  className="flex-1"
                >
                  {state.isSaving ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-pulse" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Share className="w-4 h-4 mr-2" />
                      Salva e Pubblica
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SmartFunnelGenerator;