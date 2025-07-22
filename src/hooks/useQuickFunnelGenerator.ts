import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { funnelGenerationService, GeneratedFunnel } from '@/services/funnelGenerationService';

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
      // First try the enhanced intelligent orchestrator
      const productInfo = await extractProductInfo(prompt);
      
      const { data, error } = await supabase.functions.invoke('intelligent-funnel-orchestrator', {
        body: {
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
          includeCompetitorAnalysis: true,
          userId: user.id,
          saveToDatabase: true
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        // Convert the intelligent experience to compatible format
        const funnel: GeneratedFunnel = {
          id: data.databaseRecord?.id || crypto.randomUUID(),
          name: data.experience.name,
          description: data.experience.description,
          share_token: data.databaseRecord?.shareToken || '',
          steps: data.experience.steps.map((step: any) => ({
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
            ...data.experience.settings,
            theme: data.experience.theme,
            narrative: data.experience.narrative,
            conversionOptimization: data.experience.conversionOptimization,
            generatedBy: 'intelligent_orchestrator_v2',
            generatedAt: new Date().toISOString(),
            metadata: data.metadata
          },
          advanced_funnel_data: data.experience
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
          stepsCount: funnel.steps.length
        });
        
        return funnel;
      } else {
        throw new Error('Generazione non riuscita');
      }

    } catch (error) {
      console.error('💥 Enhanced funnel generation failed:', error);
      
      // Fallback to centralized service
      console.log('🔄 Falling back to centralized generation service...');
      return await generateWithCentralizedService(prompt);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWithCentralizedService = async (prompt: string): Promise<GeneratedFunnel | null> => {
    try {
      console.log('🔄 Using centralized generation service as fallback...');
      
      const funnel = await funnelGenerationService.generateFunnel({
        prompt: prompt.trim(),
        userId: user!.id,
        saveToLibrary: true,
        timeout: 30000,
        retries: 1
      });

      if (funnel) {
        setGeneratedFunnel(funnel);
        
        toast({
          title: "🎉 Successo!",
          description: "Esperienza generata con successo!",
        });
        
        console.log('✅ Fallback generation successful');
        return funnel;
      }

      return null;

    } catch (error) {
      console.error('💥 Centralized service also failed:', error);
      
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
