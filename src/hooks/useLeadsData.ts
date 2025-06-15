
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdminLead } from './useLeadTypes';

interface LeadFilters {
  status?: 'nuovo' | 'contattato' | 'in_trattativa' | 'chiuso_vinto' | 'chiuso_perso' | 'all';
  searchQuery?: string;
  hasAnalysis?: boolean;
}

export const useLeadsData = () => {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LeadFilters>({});
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.searchQuery) {
        query = query.or(`nome.ilike.%${filters.searchQuery}%,email.ilike.%${filters.searchQuery}%`);
      }

      if (filters.hasAnalysis !== undefined) {
        if (filters.hasAnalysis) {
          query = query.not('gpt_analysis', 'is', null);
        } else {
          query = query.is('gpt_analysis', null);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        toast({
          title: "Errore",
          description: "Errore nel caricamento dei leads",
          variant: "destructive",
        });
        return;
      }

      setLeads(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Errore generale nel caricamento dei leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  return {
    leads,
    setLeads,
    loading,
    filters,
    setFilters,
    refetchLeads: fetchLeads
  };
};
