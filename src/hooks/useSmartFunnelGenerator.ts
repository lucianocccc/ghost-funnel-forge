import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
// Removed dependency
import { generateBrandVisualTheme, type VisualStyle } from '@/theme/visualTheme';
import { generateBrandAssets } from '@/services/brandAssets';
import DynamicSectionEngine from '@/services/dynamicSectionEngine';

export interface SmartFunnelRequest {
  initialPrompt: string;
  answers?: Record<string, string>;
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  context: string;
  required: boolean;
}

export interface PromptAnalysis {
  missingInfo: string[];
  questions: GeneratedQuestion[];
  readyToGenerate: boolean;
  confidence: number;
}

export interface SmartFunnelState {
  analysis: PromptAnalysis | null;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  isAnalyzing: boolean;
  isGenerating: boolean;
  generatedFunnel: any | null;
  initialPrompt: string;
  isSaving: boolean;
  savedFunnel: any | null;
}

export function useSmartFunnelGenerator() {
  const [state, setState] = useState<SmartFunnelState>({
    analysis: null,
    currentQuestionIndex: 0,
    answers: {},
    isAnalyzing: false,
    isGenerating: false,
    generatedFunnel: null,
    initialPrompt: '',
    isSaving: false,
    savedFunnel: null
  });

  const analyzePrompt = async (initialPrompt: string): Promise<PromptAnalysis | null> => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('smart-funnel-analyzer', {
        body: {
          initialPrompt,
          userId: user?.id
        }
      });

      if (error) {
        console.error('Errore analisi prompt:', error);
        toast.error('Errore durante l\'analisi del prompt');
        return null;
      }

      const analysis = data as PromptAnalysis;
      setState(prev => ({ 
        ...prev, 
        analysis,
        currentQuestionIndex: 0,
        answers: {},
        initialPrompt
      }));
      
      if (analysis.readyToGenerate) {
        toast.success('Prompt completo! Pronto per generare il funnel');
      } else {
        toast.success(`${analysis.questions.length} domande generate per completare il funnel`);
      }
      
      return analysis;
    } catch (error) {
      console.error('Errore durante l\'analisi:', error);
      toast.error('Errore durante l\'analisi del prompt');
      return null;
    } finally {
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const answerQuestion = (questionId: string, answer: string) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer },
      currentQuestionIndex: prev.currentQuestionIndex + 1
    }));
  };

  const generateFunnel = async (): Promise<any | null> => {
    if (!state.analysis) {
      toast.error('Nessuna analisi disponibile');
      return null;
    }

    setState(prev => ({ ...prev, isGenerating: true }));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('smart-funnel-generator', {
        body: {
          analysis: state.analysis,
          answers: state.answers,
          userId: user?.id
        }
      });

      if (error) {
        console.error('Errore generazione funnel:', error);
        toast.error('Errore durante la generazione del funnel');
        return null;
      }

      let enrichedData = data;
      try {
        const productName = data?.name || state.answers?.productName || 'Progetto';
        const productDescription = data?.description || state.answers?.productDescription;
        const industry = (state.answers?.industry as string) || 'general';
        const visualStyle = (state.answers?.visualStyle as VisualStyle) || 'dynamic';
        const theme = generateBrandVisualTheme(productName, industry, visualStyle);

        const assetsRes = await generateBrandAssets({
          productName,
          productDescription,
          industry,
          visualStyle,
          theme,
          assets: ['hero', 'pattern'],
          quality: 'medium',
        });

        const combinedPrompt = `${state.initialPrompt || ''} ${Object.values(state.answers || {}).join(' ')}`.trim();
        let modularResult: any = null;
        if (combinedPrompt) {
          modularResult = DynamicSectionEngine.generateDynamicFunnelStructure(
            combinedPrompt,
            industry,
            (state.answers?.objectives ? String(state.answers.objectives).split(',').map(s=>s.trim()).filter(Boolean) : []),
            String(state.answers?.targetAudience || '')
          );
        }

        enrichedData = {
          ...data,
          style: {
            ...(data?.style || {}),
            visualStyle,
            visualTheme: theme,
            industry,
            assets: assetsRes?.success ? assetsRes.assets : undefined,
          },
          modularStructure: modularResult?.structure,
          modularAnalysis: modularResult?.analysis,
          modularRules: modularResult?.appliedRules,
        };
      } catch (e) {
        console.error('Post-processing (theme/assets/structure) failed:', e);
      }

      setState(prev => ({ ...prev, generatedFunnel: enrichedData }));
      toast.success('Funnel generato con successo!');
      
      return enrichedData;
    } catch (error) {
      console.error('Errore durante la generazione:', error);
      toast.error('Errore durante la generazione del funnel');
      return null;
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const getCurrentQuestion = (): GeneratedQuestion | null => {
    if (!state.analysis || state.currentQuestionIndex >= state.analysis.questions.length) {
      return null;
    }
    return state.analysis.questions[state.currentQuestionIndex];
  };

  const isComplete = (): boolean => {
    if (!state.analysis) return false;
    return state.analysis.readyToGenerate || state.currentQuestionIndex >= state.analysis.questions.length;
  };

  const getProgress = (): number => {
    if (!state.analysis) return 0;
    if (state.analysis.readyToGenerate) return 100;
    return (state.currentQuestionIndex / state.analysis.questions.length) * 100;
  };

  const saveFunnel = async (): Promise<{ funnel: any; shareUrl: string } | null> => {
    if (!state.generatedFunnel) {
      toast.error('Nessun funnel da salvare');
      return null;
    }

    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('ai_generated_funnels')
        .insert({
          name: state.generatedFunnel.name || 'Smart Funnel Generato',
          description: state.generatedFunnel.description,
          funnel_data: state.generatedFunnel,
          user_id: user?.id,
          source: 'smart_generator',
          interview_id: crypto.randomUUID()
        })
        .select()
        .single();

      if (error) throw error;

      const shareUrl = `${window.location.origin}/funnel/${data.share_token}`;
      
      setState(prev => ({ ...prev, savedFunnel: data }));
      toast.success('Funnel salvato con successo!');
      
      return { funnel: data, shareUrl };
    } catch (error) {
      console.error('Error saving funnel:', error);
      toast.error('Errore nel salvataggio del funnel');
      return null;
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  };

  const reset = () => {
    setState({
      analysis: null,
      currentQuestionIndex: 0,
      answers: {},
      isAnalyzing: false,
      isGenerating: false,
      generatedFunnel: null,
      initialPrompt: '',
      isSaving: false,
      savedFunnel: null
    });
  };

  return {
    state,
    analyzePrompt,
    answerQuestion,
    generateFunnel,
    saveFunnel,
    getCurrentQuestion,
    isComplete,
    getProgress,
    reset
  };
}