
import { useAuth } from '@/hooks/useAuth';
import { useChatBotFunnelData } from './useChatBotFunnelData';
import { useChatBotFunnelActions } from './useChatBotFunnelActions';

export type { GeneratedFunnel } from '@/types/chatbotFunnel';

export const useChatBotFunnels = (sessionId: string) => {
  const { user } = useAuth();
  
  const {
    generatedFunnels,
    setGeneratedFunnels,
    loading,
    loadGeneratedFunnels
  } = useChatBotFunnelData(user?.id, sessionId);

  const {
    saveFunnel,
    deleteFunnel,
    createActualFunnel,
    shareFunnel: shareGeneratedFunnel
  } = useChatBotFunnelActions(user?.id, setGeneratedFunnels);

  const shareFunnel = (funnelId: string) => {
    return shareGeneratedFunnel(funnelId, generatedFunnels);
  };

  return {
    generatedFunnels,
    loading,
    loadGeneratedFunnels,
    saveFunnel,
    deleteFunnel,
    createActualFunnel,
    shareFunnel
  };
};
