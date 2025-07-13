
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, ArrowRight, Brain, Target, Zap, CheckCircle } from 'lucide-react';

import AIInterviewChat from './components/AIInterviewChat';
import ProductAnalysisDisplay from './components/ProductAnalysisDisplay';
import CinematicFunnelPreview from './components/CinematicFunnelPreview';

interface ProductDiscoveryEngineProps {
  onFunnelGenerated?: (funnelData: any) => void;
}

const ProductDiscoveryEngine: React.FC<ProductDiscoveryEngineProps> = ({
  onFunnelGenerated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentPhase, setCurrentPhase] = useState<'discovery' | 'analysis' | 'generation' | 'preview'>('discovery');
  const [interviewData, setInterviewData] = useState<any>(null);
  const [productAnalysis, setProductAnalysis] = useState<any>(null);
  const [generatedFunnel, setGeneratedFunnel] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const phases = [
    { key: 'discovery', label: 'Product Discovery', icon: Brain, description: 'AI scopre il tuo prodotto' },
    { key: 'analysis', label: 'Smart Analysis', icon: Target, description: 'Analisi intelligente del mercato' },
    { key: 'generation', label: 'Content Generation', icon: Zap, description: 'Generazione contenuti specifici' },
    { key: 'preview', label: 'Cinematic Preview', icon: CheckCircle, description: 'Anteprima del funnel' }
  ];

  const currentPhaseIndex = phases.findIndex(p => p.key === currentPhase);
  const progress = ((currentPhaseIndex + 1) / phases.length) * 100;

  const handleInterviewComplete = async (data: any) => {
    setInterviewData(data);
    setIsProcessing(true);
    
    try {
      // Avvia l'analisi AI del prodotto
      const { data: analysisResult, error } = await supabase.functions.invoke('product-intelligence-analysis', {
        body: {
          interviewData: data,
          userId: user?.id
        }
      });

      if (error) throw error;

      setProductAnalysis(analysisResult.analysis);
      setCurrentPhase('analysis');
      
      toast({
        title: "🧠 Analisi Completata",
        description: "Ho analizzato il tuo prodotto e identificato le opportunità chiave",
      });

    } catch (error) {
      console.error('Error in product analysis:', error);
      toast({
        title: "Errore",
        description: "Errore nell'analisi del prodotto. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateFunnel = async () => {
    setIsProcessing(true);
    
    try {
      // Genera il funnel cinematico con contenuti specifici
      const { data: funnelResult, error } = await supabase.functions.invoke('generate-cinematic-product-funnel', {
        body: {
          productAnalysis,
          interviewData,
          userId: user?.id,
          generateVisuals: true,
          optimizeForConversion: true
        }
      });

      if (error) throw error;

      setGeneratedFunnel(funnelResult.funnel);
      setCurrentPhase('generation');
      
      // Procedi automaticamente alla preview
      setTimeout(() => {
        setCurrentPhase('preview');
      }, 2000);
      
      onFunnelGenerated?.(funnelResult.funnel);
      
      toast({
        title: "🎬 Funnel Cinematico Generato!",
        description: "Il tuo funnel personalizzato è pronto per conquistare il mercato",
      });

    } catch (error) {
      console.error('Error generating funnel:', error);
      toast({
        title: "Errore",
        description: "Errore nella generazione del funnel. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 'discovery':
        return (
          <AIInterviewChat
            onComplete={handleInterviewComplete}
            isProcessing={isProcessing}
          />
        );
      
      case 'analysis':
        return (
          <ProductAnalysisDisplay
            analysis={productAnalysis}
            onProceed={handleGenerateFunnel}
            isProcessing={isProcessing}
          />
        );
      
      case 'generation':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <Zap className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Generando il tuo Funnel Cinematico</h3>
            <p className="text-muted-foreground mb-6">
              Sto creando contenuti specifici per il tuo prodotto, ottimizzando per la conversione...
            </p>
            <div className="max-w-md mx-auto space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Analisi del target audience completata</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Generazione hero section personalizzata</span>
              </div>
              <div className="flex items-center gap-3 text-sm animate-pulse">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Ottimizzazione per conversione...</span>
              </div>
            </div>
          </div>
        );
      
      case 'preview':
        return (
          <CinematicFunnelPreview
            funnel={generatedFunnel}
            analysis={productAnalysis}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="w-6 h-6 text-primary" />
                Product Discovery Engine
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                AI-Powered Funnel Generation per il tuo prodotto specifico
              </p>
            </div>
            <Badge variant="outline" className="text-primary border-primary">
              Powered by AI
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso</span>
              <span>{Math.round(progress)}% completato</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            <div className="grid grid-cols-4 gap-4 mt-6">
              {phases.map((phase, index) => {
                const Icon = phase.icon;
                const isActive = currentPhase === phase.key;
                const isCompleted = currentPhaseIndex > index;
                
                return (
                  <div
                    key={phase.key}
                    className={`text-center p-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary/10 border-primary/20 border'
                        : isCompleted
                        ? 'bg-green-50 border-green-200 border'
                        : 'bg-gray-50 border-gray-200 border'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mx-auto mb-2 ${
                        isActive
                          ? 'text-primary animate-pulse'
                          : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <div className="text-xs font-medium">{phase.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {phase.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Phase Content */}
      <div>
        {renderCurrentPhase()}
      </div>

      {/* Quick Stats */}
      {productAnalysis && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(productAnalysis.marketOpportunity?.score * 100) || 85}%
                </div>
                <div className="text-sm text-muted-foreground">Market Opportunity</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {productAnalysis.targetAudience?.segments?.length || 3}
                </div>
                <div className="text-sm text-muted-foreground">Target Segments</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((productAnalysis.conversionPotential?.score || 0.75) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Conversion Potential</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductDiscoveryEngine;
