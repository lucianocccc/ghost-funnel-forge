
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FunnelHealthResult {
  funnelsChecked: number;
  funnelsRepaired: number;
  errors: string[];
  details: Array<{
    funnelId: string;
    funnelName: string;
    action: 'ok' | 'repaired' | 'error';
    message: string;
  }>;
}

export const useFunnelHealthCheck = () => {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<FunnelHealthResult | null>(null);
  const { toast } = useToast();

  const runHealthCheck = async (): Promise<FunnelHealthResult | null> => {
    setLoading(true);
    
    try {
      console.log('🔥 Starting funnel health check...');
      
      const { data, error } = await supabase.functions.invoke('funnel-health-check', {
        body: { trigger: 'manual' }
      });

      if (error) {
        console.error('❌ Health check error:', error);
        toast({
          title: "Errore Health Check",
          description: `Errore durante il controllo: ${error.message}`,
          variant: "destructive",
        });
        return null;
      }

      const result = data?.result;
      setLastResult(result);

      if (result) {
        const { funnelsChecked, funnelsRepaired, errors } = result;
        
        if (errors.length > 0) {
          toast({
            title: "Health Check Completato con Errori",
            description: `${funnelsRepaired} funnel riparati su ${funnelsChecked}. ${errors.length} errori riscontrati.`,
            variant: "destructive",
          });
        } else if (funnelsRepaired > 0) {
          toast({
            title: "Health Check Completato",
            description: `${funnelsRepaired} funnel riparati su ${funnelsChecked} controllati.`,
          });
        } else {
          toast({
            title: "Health Check Completato",
            description: `Tutti i ${funnelsChecked} funnel controllati sono già in buone condizioni.`,
          });
        }
      }

      console.log('✅ Health check completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      toast({
        title: "Errore Health Check",
        description: "Errore imprevisto durante il controllo dei funnel",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    runHealthCheck,
    loading,
    lastResult
  };
};
