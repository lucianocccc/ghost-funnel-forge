import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ModularFunnelConfig {
  id?: string;
  user_id?: string;
  config_name: string;
  industry?: string | null;
  target_audience?: string | null;
  funnel_objective?: string | null;
  sections_config: any; // JSONB type
  global_settings: any; // JSONB type
  is_template?: boolean;
  is_active?: boolean;
  performance_metrics?: any; // JSONB type
  created_at?: string;
  updated_at?: string;
}

export interface FunnelSection {
  id: string;
  section_type: string;
  position: number;
  config: Record<string, any>;
  is_enabled: boolean;
}

// Type for creating/updating configs
export interface ModularFunnelConfigInput {
  config_name: string;
  industry?: string;
  target_audience?: string;
  funnel_objective?: string;
  sections_config: FunnelSection[];
  global_settings: Record<string, any>;
  is_template?: boolean;
  is_active?: boolean;
  performance_metrics?: Record<string, any>;
}

export const useModularFunnelConfig = () => {
  const [configs, setConfigs] = useState<ModularFunnelConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ModularFunnelConfig | null>(null);
  const { toast } = useToast();

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('modular_funnel_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error loading configs:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le configurazioni",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createConfig = async (config: ModularFunnelConfigInput) => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('modular_funnel_configs')
        .insert({
          config_name: config.config_name,
          industry: config.industry,
          target_audience: config.target_audience,
          funnel_objective: config.funnel_objective,
          sections_config: config.sections_config as any,
          global_settings: config.global_settings as any,
          is_template: config.is_template,
          is_active: config.is_active,
          performance_metrics: config.performance_metrics as any,
          user_id: user.user.id
        })
        .select()
        .single();

      if (error) throw error;

      setConfigs(prev => [data, ...prev]);
      toast({
        title: "Successo",
        description: "Configurazione creata con successo"
      });

      return data;
    } catch (error) {
      console.error('Error creating config:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare la configurazione",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (id: string, updates: Partial<ModularFunnelConfig>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('modular_funnel_configs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setConfigs(prev => prev.map(config => config.id === id ? data : config));
      
      if (selectedConfig?.id === id) {
        setSelectedConfig(data);
      }

      toast({
        title: "Successo",
        description: "Configurazione aggiornata con successo"
      });

      return data;
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la configurazione",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteConfig = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('modular_funnel_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConfigs(prev => prev.filter(config => config.id !== id));
      
      if (selectedConfig?.id === id) {
        setSelectedConfig(null);
      }

      toast({
        title: "Successo",
        description: "Configurazione eliminata con successo"
      });
    } catch (error) {
      console.error('Error deleting config:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la configurazione",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const duplicateConfig = async (configId: string, newName: string) => {
    setLoading(true);
    try {
      const original = configs.find(c => c.id === configId);
      if (!original) throw new Error('Configuration not found');

      const { id, user_id, created_at, updated_at, ...configToDuplicate } = original;
      
      const duplicated = await createConfig({
        ...configToDuplicate,
        config_name: newName
      });

      return duplicated;
    } catch (error) {
      console.error('Error duplicating config:', error);
      toast({
        title: "Errore",
        description: "Impossibile duplicare la configurazione",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  return {
    configs,
    loading,
    selectedConfig,
    setSelectedConfig,
    loadConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    duplicateConfig
  };
};