
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { InteractiveFunnelWithSteps } from '@/types/interactiveFunnel';
import { 
  fetchInteractiveFunnels, 
  createInteractiveFunnel, 
  updateFunnelStatus,
  toggleFunnelPublic,
  regenerateShareToken,
  getFunnelAnalytics
} from '@/services/interactiveFunnelService';

export const useInteractiveFunnels = () => {
  const [funnels, setFunnels] = useState<InteractiveFunnelWithSteps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadFunnels = async () => {
    try {
      setError(null);
      console.log('🔄 Starting to load interactive funnels...');
      
      const data = await fetchInteractiveFunnels();
      console.log('✅ Interactive funnels loaded successfully:', data.length);
      console.log('📊 Funnel details:', data.map(f => ({ 
        id: f.id, 
        name: f.name, 
        aiGenerated: f.settings?.ai_generated,
        createdAt: f.created_at 
      })));
      
      setFunnels(data);
    } catch (error: any) {
      console.error('❌ Error loading interactive funnels:', error);
      setError(error.message || 'Failed to load funnels');
      
      if (error.message?.includes('not authenticated')) {
        toast({
          title: "Errore di Autenticazione",
          description: "Devi essere autenticato per visualizzare i funnel. Riprova il login.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Errore",
          description: "Errore nel caricamento dei funnel interattivi",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const createFunnel = async (name: string, description: string, aiGeneratedFunnelId?: string) => {
    try {
      console.log('Creating funnel:', { name, description });
      
      await createInteractiveFunnel(name, description, aiGeneratedFunnelId);
      await loadFunnels();
      
      toast({
        title: "Successo",
        description: "Funnel interattivo creato con successo",
      });
    } catch (error: any) {
      console.error('Error creating interactive funnel:', error);
      
      if (error.message?.includes('not authenticated')) {
        toast({
          title: "Errore di Autenticazione",
          description: "Devi essere autenticato per creare un funnel. Riprova il login.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Errore",
          description: error.message || "Errore nella creazione del funnel interattivo",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const updateStatus = async (funnelId: string, status: 'draft' | 'active' | 'archived') => {
    try {
      await updateFunnelStatus(funnelId, status);
      setFunnels(prev =>
        prev.map(funnel =>
          funnel.id === funnelId ? { ...funnel, status } : funnel
        )
      );
      toast({
        title: "Successo",
        description: "Status del funnel aggiornato",
      });
    } catch (error: any) {
      console.error('Error updating funnel status:', error);
      
      if (error.message?.includes('not authenticated')) {
        toast({
          title: "Errore di Autenticazione",
          description: "Devi essere autenticato per modificare il funnel.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Errore",
          description: error.message || "Errore nell'aggiornamento dello status",
          variant: "destructive",
        });
      }
    }
  };

  const togglePublic = async (funnelId: string, isPublic: boolean) => {
    try {
      await toggleFunnelPublic(funnelId, isPublic);
      setFunnels(prev =>
        prev.map(funnel =>
          funnel.id === funnelId ? { ...funnel, is_public: isPublic } : funnel
        )
      );
      toast({
        title: "Successo",
        description: isPublic ? "Funnel reso pubblico" : "Funnel reso privato",
      });
    } catch (error: any) {
      console.error('Error toggling funnel public status:', error);
      toast({
        title: "Errore",
        description: error.message || "Errore nell'aggiornamento dello status pubblico",
        variant: "destructive",
      });
    }
  };

  const regenerateToken = async (funnelId: string) => {
    try {
      const newToken = await regenerateShareToken(funnelId);
      setFunnels(prev =>
        prev.map(funnel =>
          funnel.id === funnelId ? { ...funnel, share_token: newToken } : funnel
        )
      );
      toast({
        title: "Successo",
        description: "Token di condivisione rigenerato",
      });
      return newToken;
    } catch (error: any) {
      console.error('Error regenerating share token:', error);
      toast({
        title: "Errore",
        description: error.message || "Errore nella rigenerazione del token",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getAnalytics = async (funnelId: string) => {
    try {
      return await getFunnelAnalytics(funnelId);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Errore",
        description: error.message || "Errore nel caricamento delle analytics",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadFunnels();
  }, []);

  return {
    funnels,
    loading,
    error,
    createFunnel,
    updateStatus,
    togglePublic,
    regenerateToken,
    getAnalytics,
    refetchFunnels: loadFunnels
  };
};
