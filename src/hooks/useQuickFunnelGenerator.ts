
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { IntelligentFunnelOrchestrator } from '@/services/intelligentFunnelOrchestrator';

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

export const useQuickFunnelGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFunnel, setGeneratedFunnel] = useState<GeneratedFunnel | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateFunnel = async (prompt: string): Promise<GeneratedFunnel | null> => {
    if (!prompt.trim() || !user) {
      console.error('Missing prompt or user:', { prompt: !!prompt.trim(), user: !!user });
      toast({
        title: "Errore",
        description: "Prompt e autenticazione richiesti",
        variant: "destructive",
      });
      return null;
    }

    console.log('🚀 Starting enhanced funnel generation with intelligent orchestrator:', { 
      prompt: prompt.substring(0, 100) + '...', 
      userId: user.id,
      promptLength: prompt.length,
      timestamp: new Date().toISOString()
    });

    setIsGenerating(true);
    
    try {
      // Usa il nuovo orchestratore intelligente
      const orchestrator = IntelligentFunnelOrchestrator.getInstance();
      
      // Estrai informazioni basilari dal prompt
      const productInfo = await extractProductInfo(prompt);
      
      const response = await orchestrator.generateIntelligentFunnel({
        userPrompt: prompt,
        productName: productInfo.name || 'Prodotto',
        productDescription: productInfo.description || prompt,
        category: productInfo.category,
        industry: productInfo.industry,
        targetAudience: productInfo.targetAudience,
        analysisDepth: 'comprehensive',
        personalizationLevel: 'maximum',
        includeWebResearch: true,
        includeMarketAnalysis: true,
        includeCompetitorAnalysis: true
      });

      if (response.success) {
        // Converti l'esperienza personalizzata nel formato compatibile
        const funnel: GeneratedFunnel = {
          id: response.databaseRecord?.id || crypto.randomUUID(),
          name: response.experience.name,
          description: response.experience.description,
          share_token: response.databaseRecord?.shareToken || '',
          steps: response.experience.steps.map(step => ({
            id: crypto.randomUUID(),
            step_order: step.stepOrder,
            step_type: step.stepType,
            title: step.title,
            description: step.description,
            fields_config: step.fieldsConfig,
            settings: step.settings,
            is_required: step.stepType === 'lead_capture'
          })),
          settings: {
            ...response.experience.settings,
            theme: response.experience.theme,
            narrative: response.experience.narrative,
            conversionOptimization: response.experience.conversionOptimization,
            generatedBy: 'intelligent_orchestrator_v2',
            generatedAt: new Date().toISOString(),
            metadata: response.metadata
          },
          advanced_funnel_data: response.experience,
          customer_facing: response.experience.narrative,
          target_audience: productInfo.targetAudience,
          industry: productInfo.industry
        };

        setGeneratedFunnel(funnel);
        
        toast({
          title: "🎉 Successo!",
          description: `Esperienza intelligente generata: "${funnel.name}" con ${funnel.steps.length} step personalizzati!`,
          duration: 5000,
        });
        
        console.log('✅ Enhanced funnel generated successfully:', {
          funnelId: funnel.id,
          funnelName: funnel.name,
          stepsCount: funnel.steps.length,
          personalizationScore: response.experience.personalizationScore,
          uniquenessScore: response.experience.uniquenessScore,
          confidenceScore: response.metadata.confidenceScore
        });
        
        return funnel;
      } else {
        throw new Error('Generazione non riuscita');
      }

    } catch (error) {
      console.error('💥 Enhanced funnel generation failed:', error);
      
      // Fallback al sistema precedente in caso di errore
      console.log('🔄 Falling back to legacy system...');
      return await generateLegacyFunnel(prompt);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLegacyFunnel = async (prompt: string): Promise<GeneratedFunnel | null> => {
    try {
      console.log('🔄 Using legacy funnel generation system...');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Errore di autenticazione');
      }

      const payload = { 
        prompt: prompt.trim(),
        userId: user.id,
        saveToLibrary: true
      };

      const { data, error } = await supabase.functions.invoke('generate-interactive-funnel-ai', {
        body: payload
      });

      if (error) {
        console.error('❌ Legacy system error:', error);
        throw new Error(error.message || 'Errore nella generazione');
      }

      if (data?.success && data?.funnel) {
        console.log('✅ Legacy funnel generated successfully');
        
        setGeneratedFunnel(data.funnel);
        
        toast({
          title: "🎉 Successo!",
          description: "Esperienza generata con successo (sistema legacy)!",
        });
        
        return data.funnel;
      } else {
        throw new Error(data?.error || 'Errore nella generazione del funnel');
      }

    } catch (error) {
      console.error('💥 Legacy system also failed:', error);
      
      toast({
        title: "Errore",
        description: "Errore nella generazione dell'esperienza. Riprova più tardi.",
        variant: "destructive",
      });
      
      return null;
    }
  };

  const extractProductInfo = async (prompt: string): Promise<any> => {
    // Estrazione basilare di informazioni dal prompt
    const lowerPrompt = prompt.toLowerCase();
    
    let category = '';
    let industry = '';
    let targetAudience = '';
    let name = '';
    let description = prompt;

    // Estrazione categoria
    if (lowerPrompt.includes('corso') || lowerPrompt.includes('formazione')) {
      category = 'corso';
    } else if (lowerPrompt.includes('servizio') || lowerPrompt.includes('consulenza')) {
      category = 'servizio';
    } else if (lowerPrompt.includes('prodotto') || lowerPrompt.includes('vendita')) {
      category = 'prodotto';
    } else if (lowerPrompt.includes('software') || lowerPrompt.includes('app')) {
      category = 'software';
    }

    // Estrazione settore
    if (lowerPrompt.includes('marketing') || lowerPrompt.includes('pubblicità')) {
      industry = 'marketing';
    } else if (lowerPrompt.includes('tecnologia') || lowerPrompt.includes('tech')) {
      industry = 'tecnologia';
    } else if (lowerPrompt.includes('salute') || lowerPrompt.includes('benessere')) {
      industry = 'salute';
    } else if (lowerPrompt.includes('finanza') || lowerPrompt.includes('investimenti')) {
      industry = 'finanza';
    } else if (lowerPrompt.includes('immobili') || lowerPrompt.includes('casa')) {
      industry = 'immobiliare';
    }

    // Estrazione pubblico target
    if (lowerPrompt.includes('imprenditori') || lowerPrompt.includes('ceo')) {
      targetAudience = 'imprenditori';
    } else if (lowerPrompt.includes('professionisti') || lowerPrompt.includes('manager')) {
      targetAudience = 'professionisti';
    } else if (lowerPrompt.includes('studenti') || lowerPrompt.includes('giovani')) {
      targetAudience = 'studenti';
    } else if (lowerPrompt.includes('aziende') || lowerPrompt.includes('b2b')) {
      targetAudience = 'aziende';
    }

    // Estrazione nome (prendendo le prime parole significative)
    const words = prompt.split(' ').filter(word => word.length > 3);
    if (words.length > 0) {
      name = words.slice(0, 3).join(' ');
    }

    return {
      name,
      description,
      category,
      industry,
      targetAudience
    };
  };

  const clearGeneratedFunnel = () => {
    setGeneratedFunnel(null);
  };

  return {
    isGenerating,
    generatedFunnel,
    generateFunnel,
    clearGeneratedFunnel
  };
};
