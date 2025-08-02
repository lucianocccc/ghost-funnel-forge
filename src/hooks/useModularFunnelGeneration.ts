import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ModularFunnelGeneration {
  id?: string;
  user_id?: string;
  config_id?: string | null;
  generated_funnel_data: any; // JSONB type
  ai_optimization_suggestions?: any; // JSONB type
  performance_predictions?: any; // JSONB type
  generation_status: string; // Changed from union type to string to match DB
  interactive_funnel_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FunnelGenerationRequest {
  config_id?: string;
  custom_prompt?: string;
  target_audience?: string;
  industry?: string;
  objectives?: string[];
  advanced_options?: {
    tone?: string;
    style?: string;
    complexity?: 'beginner' | 'intermediate' | 'advanced';
    include_analytics?: boolean;
    mobile_optimized?: boolean;
  };
}

export const useModularFunnelGeneration = () => {
  const [generations, setGenerations] = useState<ModularFunnelGeneration[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState<ModularFunnelGeneration | null>(null);
  const { toast } = useToast();

  const loadGenerations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('modular_funnel_generations')
        .select(`
          *,
          modular_funnel_configs(config_name, industry, target_audience)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGenerations(data || []);
    } catch (error) {
      console.error('Error loading generations:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le generazioni",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateFunnel = async (request: FunnelGenerationRequest): Promise<ModularFunnelGeneration | null> => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // First, create the generation record
      const { data: generationData, error: generationError } = await supabase
        .from('modular_funnel_generations')
        .insert({
          user_id: user.user.id,
          config_id: request.config_id,
          generated_funnel_data: {} as any,
          generation_status: 'pending'
        })
        .select()
        .single();

      if (generationError) throw generationError;

      setCurrentGeneration(generationData);
      setGenerations(prev => [generationData, ...prev]);

      // Call the AI generation edge function
      const { data: aiResult, error: aiError } = await supabase.functions.invoke(
        'generate-modular-funnel-ai',
        {
          body: {
            generation_id: generationData.id,
            config_id: request.config_id,
            custom_prompt: request.custom_prompt,
            target_audience: request.target_audience,
            industry: request.industry,
            objectives: request.objectives,
            advanced_options: request.advanced_options
          }
        }
      );

      if (aiError) {
        // Update status to failed
        await updateGenerationStatus(generationData.id!, 'failed');
        throw aiError;
      }

      toast({
        title: "Generazione avviata",
        description: "La generazione del funnel è in corso. Riceverai una notifica quando sarà completata."
      });

      return generationData;
    } catch (error) {
      console.error('Error generating funnel:', error);
      toast({
        title: "Errore",
        description: "Impossibile avviare la generazione del funnel",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateGenerationStatus = async (
    generationId: string, 
    status: ModularFunnelGeneration['generation_status'],
    funnelData?: any,
    optimizationSuggestions?: any,
    performancePredictions?: any
  ) => {
    try {
      const updateData: any = { generation_status: status };
      
      if (funnelData) updateData.generated_funnel_data = funnelData;
      if (optimizationSuggestions) updateData.ai_optimization_suggestions = optimizationSuggestions;
      if (performancePredictions) updateData.performance_predictions = performancePredictions;

      const { data, error } = await supabase
        .from('modular_funnel_generations')
        .update(updateData)
        .eq('id', generationId)
        .select()
        .single();

      if (error) throw error;

      setGenerations(prev => 
        prev.map(gen => gen.id === generationId ? data : gen)
      );

      if (currentGeneration?.id === generationId) {
        setCurrentGeneration(data);
      }

      return data;
    } catch (error) {
      console.error('Error updating generation status:', error);
      throw error;
    }
  };

  const saveAsInteractiveFunnel = async (generationId: string): Promise<string | null> => {
    setLoading(true);
    try {
      const generation = generations.find(g => g.id === generationId);
      if (!generation) throw new Error('Generation not found');

      const { data, error } = await supabase.functions.invoke(
        'save-modular-funnel-as-interactive',
        {
          body: {
            generation_id: generationId,
            funnel_data: generation.generated_funnel_data
          }
        }
      );

      if (error) throw error;

      // Update the generation record with the interactive funnel ID
      await supabase
        .from('modular_funnel_generations')
        .update({
          interactive_funnel_id: data.interactive_funnel_id
        })
        .eq('id', generationId);

      toast({
        title: "Successo",
        description: "Funnel salvato come funnel interattivo"
      });

      return data.interactive_funnel_id;
    } catch (error) {
      console.error('Error saving as interactive funnel:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare come funnel interattivo",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const regenerateWithModifications = async (
    generationId: string, 
    modifications: string
  ): Promise<ModularFunnelGeneration | null> => {
    setLoading(true);
    try {
      const originalGeneration = generations.find(g => g.id === generationId);
      if (!originalGeneration) throw new Error('Original generation not found');

      // Create new generation based on the original
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: newGeneration, error } = await supabase
        .from('modular_funnel_generations')
        .insert({
          user_id: user.user.id,
          config_id: originalGeneration.config_id,
          generated_funnel_data: {} as any,
          generation_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setGenerations(prev => [newGeneration, ...prev]);

      // Call AI function with modifications
      const { data: aiResult, error: aiError } = await supabase.functions.invoke(
        'regenerate-modular-funnel-ai',
        {
          body: {
            generation_id: newGeneration.id,
            original_funnel_data: originalGeneration.generated_funnel_data,
            modifications: modifications
          }
        }
      );

      if (aiError) {
        await updateGenerationStatus(newGeneration.id!, 'failed');
        throw aiError;
      }

      toast({
        title: "Rigenerazione avviata",
        description: "La rigenerazione del funnel con le modifiche è in corso."
      });

      return newGeneration;
    } catch (error) {
      console.error('Error regenerating funnel:', error);
      toast({
        title: "Errore",
        description: "Impossibile rigenerare il funnel",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteGeneration = async (generationId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('modular_funnel_generations')
        .delete()
        .eq('id', generationId);

      if (error) throw error;

      setGenerations(prev => prev.filter(gen => gen.id !== generationId));
      
      if (currentGeneration?.id === generationId) {
        setCurrentGeneration(null);
      }

      toast({
        title: "Successo",
        description: "Generazione eliminata con successo"
      });
    } catch (error) {
      console.error('Error deleting generation:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la generazione",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription to generation status updates
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const subscription = supabase
        .channel('modular_funnel_generations')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'modular_funnel_generations',
            filter: `user_id=eq.${user.user.id}`
          },
          (payload) => {
            const updatedGeneration = payload.new as ModularFunnelGeneration;
            setGenerations(prev => 
              prev.map(gen => 
                gen.id === updatedGeneration.id ? updatedGeneration : gen
              )
            );

            if (currentGeneration?.id === updatedGeneration.id) {
              setCurrentGeneration(updatedGeneration);
            }

            // Show notification when generation is completed
            if (updatedGeneration.generation_status === 'completed') {
              toast({
                title: "Generazione completata",
                description: "Il tuo funnel è pronto!"
              });
            } else if (updatedGeneration.generation_status === 'failed') {
              toast({
                title: "Generazione fallita",
                description: "Si è verificato un errore durante la generazione",
                variant: "destructive"
              });
            }
          }
        )
        .subscribe();

      return subscription;
    };

    setupSubscription().then((subscription) => {
      return () => {
        subscription?.unsubscribe();
      };
    });
  }, [currentGeneration, toast]);

  useEffect(() => {
    loadGenerations();
  }, []);

  return {
    generations,
    loading,
    currentGeneration,
    setCurrentGeneration,
    loadGenerations,
    generateFunnel,
    updateGenerationStatus,
    saveAsInteractiveFunnel,
    regenerateWithModifications,
    deleteGeneration
  };
};