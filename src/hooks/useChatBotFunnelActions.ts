
import { useToast } from '@/hooks/use-toast';
import { GeneratedFunnel } from '@/types/chatbotFunnel';
import { 
  updateFunnelStatus, 
  deleteFunnelById, 
  createMainFunnel, 
  copyShareUrl 
} from '@/services/chatbotFunnelService';

export const useChatBotFunnelActions = (
  userId: string | undefined,
  onFunnelUpdate: (updatedFunnels: GeneratedFunnel[] | ((prev: GeneratedFunnel[]) => GeneratedFunnel[])) => void
) => {
  const { toast } = useToast();

  const saveFunnel = async (funnelId: string) => {
    if (!userId) return;

    try {
      await updateFunnelStatus(funnelId, userId, true);

      onFunnelUpdate(prev => 
        prev.map(funnel => 
          funnel.id === funnelId 
            ? { ...funnel, is_active: true }
            : funnel
        )
      );

      toast({
        title: "Funnel salvato",
        description: "Il funnel è stato attivato con successo nella tua libreria",
      });
    } catch (error) {
      console.error('Error saving funnel:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio del funnel",
        variant: "destructive",
      });
    }
  };

  const deleteFunnel = async (funnelId: string) => {
    if (!userId) return;

    try {
      await deleteFunnelById(funnelId, userId);

      onFunnelUpdate(prev => 
        prev.filter(funnel => funnel.id !== funnelId)
      );

      toast({
        title: "Funnel eliminato",
        description: "Il funnel è stato eliminato con successo",
      });
    } catch (error) {
      console.error('Error deleting funnel:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del funnel",
        variant: "destructive",
      });
    }
  };

  const createActualFunnel = async (generatedFunnel: GeneratedFunnel) => {
    if (!userId) return;

    try {
      const funnel = await createMainFunnel(generatedFunnel, userId);

      // Mark the AI funnel as active
      await saveFunnel(generatedFunnel.id);

      toast({
        title: "Funnel creato",
        description: "Il funnel è stato creato con successo e aggiunto alla tua libreria principale",
      });

      return funnel;
    } catch (error) {
      console.error('Error creating actual funnel:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione del funnel",
        variant: "destructive",
      });
    }
  };

  const shareFunnel = async (funnelId: string, funnels: GeneratedFunnel[]) => {
    try {
      const funnel = funnels.find(f => f.id === funnelId);
      if (!funnel) return;

      const shareUrl = await copyShareUrl(funnel.share_token);
      
      toast({
        title: "Link copiato",
        description: "Il link di condivisione è stato copiato negli appunti",
      });

      return shareUrl;
    } catch (error) {
      console.error('Error sharing funnel:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la condivisione",
        variant: "destructive",
      });
    }
  };

  return {
    saveFunnel,
    deleteFunnel,
    createActualFunnel,
    shareFunnel
  };
};
