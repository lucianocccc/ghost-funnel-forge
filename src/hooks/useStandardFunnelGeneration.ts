
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { StandardFunnelStructure } from '@/services/standardFunnelStructures';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedFunnel {
  id: string;
  name: string;
  description: string;
  share_token: string;
  steps: any[];
  settings: any;
}

export const useStandardFunnelGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [generatedFunnel, setGeneratedFunnel] = useState<GeneratedFunnel | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateStandardFunnel = async (structure: StandardFunnelStructure): Promise<GeneratedFunnel | null> => {
    if (!user) {
      console.error('❌ User not authenticated');
      toast({
        title: "Errore",
        description: "Devi essere autenticato per generare funnel",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Creating standardized funnel:', structure.name);

      // Generate a proper hex token that matches database format
      const generateHexToken = (): string => {
        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        return Array.from(bytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      };

      const shareToken = generateHexToken();

      // Create the funnel with standardized data
      const { data: funnel, error: funnelError } = await supabase
        .from('interactive_funnels')
        .insert({
          name: structure.name,
          description: structure.description,
          created_by: user.id,
          status: 'active',
          is_public: true,
          share_token: shareToken,
          settings: {
            industry: structure.industry,
            target_audience: structure.target_audience,
            complexity_level: structure.complexity_level,
            category: structure.category
          }
        })
        .select()
        .single();

      if (funnelError) {
        console.error('❌ Error creating funnel:', funnelError);
        throw funnelError;
      }

      console.log('📝 Created standardized funnel:', funnel.id);

      // Create steps from the standardized structure
      const stepsToInsert = structure.steps.map(step => ({
        funnel_id: funnel.id,
        title: step.title,
        description: step.description,
        step_type: step.step_type,
        step_order: step.step_order,
        is_required: step.is_required,
        fields_config: step.fields_config,
        settings: step.settings
      }));

      const { error: stepsError } = await supabase
        .from('interactive_funnel_steps')
        .insert(stepsToInsert);

      if (stepsError) {
        console.error('❌ Error creating steps:', stepsError);
        throw stepsError;
      }

      console.log('📋 Created standardized steps:', stepsToInsert.length);

      const generatedFunnelData: GeneratedFunnel = {
        id: funnel.id,
        name: funnel.name,
        description: funnel.description || '',
        share_token: funnel.share_token,
        steps: structure.steps.map((step, index) => ({
          ...step,
          id: `step_${index + 1}`,
          funnel_id: funnel.id
        })),
        settings: funnel.settings || {}
      };

      setGeneratedFunnel(generatedFunnelData);

      toast({
        title: "Successo!",
        description: `Funnel "${structure.name}" creato con successo utilizzando la struttura standardizzata!`,
      });

      console.log('✅ Standardized funnel generated successfully:', generatedFunnelData.name);
      return generatedFunnelData;

    } catch (error) {
      console.error('💥 Error generating standardized funnel:', error);
      
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nella generazione del funnel",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateCustomFunnel = async (prompt: string): Promise<GeneratedFunnel | null> => {
    if (!user) {
      console.error('❌ User not authenticated');
      toast({
        title: "Errore",
        description: "Devi essere autenticato per generare funnel",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Starting custom funnel generation via AI service:', {
        prompt: prompt.substring(0, 100) + '...'
      });

      const { data, error } = await supabase.functions.invoke('generate-interactive-funnel-ai', {
        body: {
          prompt,
          userId: user.id,
          saveToLibrary: true
        }
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(error.message || 'Errore nella chiamata alla funzione AI');
      }

      if (!data || !data.success) {
        console.error('❌ AI function returned error:', data?.error);
        throw new Error(data?.error || 'Errore nella generazione AI');
      }

      if (!data.funnel) {
        console.error('❌ No funnel in AI response');
        throw new Error('Dati del funnel mancanti dalla risposta AI');
      }

      setGeneratedFunnel(data.funnel);

      toast({
        title: "Successo!",
        description: "Funnel personalizzato generato con successo tramite AI!",
      });

      console.log('✅ Custom funnel generated successfully:', data.funnel.name);
      return data.funnel;

    } catch (error) {
      console.error('💥 Error generating custom funnel:', error);
      
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nella generazione del funnel personalizzato",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearGeneratedFunnel = () => {
    setGeneratedFunnel(null);
  };

  return {
    loading,
    generatedFunnel,
    generateStandardFunnel,
    generateCustomFunnel,
    clearGeneratedFunnel
  };
};
