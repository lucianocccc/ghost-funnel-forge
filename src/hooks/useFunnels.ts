import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Funnel = Database['public']['Tables']['funnels']['Row'];
type FunnelTemplate = Database['public']['Tables']['funnel_templates']['Row'];
type FunnelStep = Database['public']['Tables']['funnel_steps']['Row'];
type TemplateStep = Database['public']['Tables']['template_steps']['Row'];

interface FunnelWithSteps extends Funnel {
  funnel_steps: FunnelStep[];
  funnel_templates?: FunnelTemplate | null;
}

export const useFunnels = () => {
  const [funnels, setFunnels] = useState<FunnelWithSteps[]>([]);
  const [templates, setTemplates] = useState<FunnelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFunnels = async () => {
    try {
      const { data, error } = await supabase
        .from('funnels')
        .select(`
          *,
          funnel_steps (*),
          funnel_templates!template_id (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching funnels:', error);
        toast({
          title: "Errore",
          description: "Errore nel caricamento dei funnel",
          variant: "destructive",
        });
        return;
      }

      setFunnels(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore generale nel caricamento dei funnel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('funnel_templates')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching templates:', error);
        return;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const createFunnelFromTemplate = async (
    templateId: string, 
    name: string, 
    leadId?: string
  ) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per creare un funnel",
          variant: "destructive",
        });
        return null;
      }

      // Get template steps
      const { data: templateSteps, error: stepsError } = await supabase
        .from('template_steps')
        .select('*')
        .eq('template_id', templateId)
        .order('step_number');

      if (stepsError) {
        throw stepsError;
      }

      // Create funnel
      const { data: funnel, error: funnelError } = await supabase
        .from('funnels')
        .insert({
          name,
          template_id: templateId,
          lead_id: leadId,
          created_by: user.user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (funnelError) {
        throw funnelError;
      }

      // Create funnel steps from template
      if (templateSteps && templateSteps.length > 0) {
        const funnelSteps = templateSteps.map(step => ({
          funnel_id: funnel.id,
          step_number: step.step_number,
          step_type: step.step_type,
          title: step.title,
          description: step.description,
          content: step.default_content
        }));

        const { error: stepsInsertError } = await supabase
          .from('funnel_steps')
          .insert(funnelSteps);

        if (stepsInsertError) {
          throw stepsInsertError;
        }
      }

      toast({
        title: "Successo",
        description: `Funnel "${name}" creato con successo`,
      });

      await fetchFunnels();
      return funnel;
    } catch (error) {
      console.error('Error creating funnel:', error);
      toast({
        title: "Errore",
        description: "Errore nella creazione del funnel",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateFunnelStatus = async (funnelId: string, status: Funnel['status']) => {
    try {
      const { error } = await supabase
        .from('funnels')
        .update({ status })
        .eq('id', funnelId);

      if (error) {
        throw error;
      }

      setFunnels(prev =>
        prev.map(funnel =>
          funnel.id === funnelId ? { ...funnel, status } : funnel
        )
      );

      toast({
        title: "Successo",
        description: "Status del funnel aggiornato",
      });
    } catch (error) {
      console.error('Error updating funnel status:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento dello status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFunnels();
    fetchTemplates();
  }, []);

  return {
    funnels,
    templates,
    loading,
    createFunnelFromTemplate,
    updateFunnelStatus,
    refetchFunnels: fetchFunnels
  };
};
