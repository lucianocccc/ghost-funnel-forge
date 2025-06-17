
import { useState, useEffect } from 'react';
import { GeneratedFunnel } from '@/types/chatbotFunnel';
import { fetchGeneratedFunnels } from '@/services/chatbotFunnelService';

export const useChatBotFunnelData = (userId: string | undefined, sessionId: string) => {
  const [generatedFunnels, setGeneratedFunnels] = useState<GeneratedFunnel[]>([]);
  const [loading, setLoading] = useState(false);

  const loadGeneratedFunnels = async () => {
    if (!userId || !sessionId) return;

    try {
      setLoading(true);
      const funnels = await fetchGeneratedFunnels(userId, sessionId);
      setGeneratedFunnels(funnels);
    } catch (error) {
      console.error('Error loading generated funnels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGeneratedFunnels();
  }, [userId, sessionId]);

  return {
    generatedFunnels,
    setGeneratedFunnels,
    loading,
    loadGeneratedFunnels
  };
};
