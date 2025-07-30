import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GhostFunnelRequest {
  userPrompt: string;
  productName?: string;
  productDescription?: string;
  targetAudience?: string;
  industry?: string;
  analysisLevel: 'basic' | 'advanced' | 'comprehensive';
  includeMarketResearch: boolean;
  includePersonalization: boolean;
  saveToDatabase: boolean;
}

export interface GhostFunnelResponse {
  marketResearch?: any;
  copywriting?: any;
  coordination?: any;
  synthesizedResult: any;
  metadata: {
    executionTime: number;
    modelsUsed: string[];
    cacheHits: number;
    totalCost?: number;
  };
}

export function useGhostFunnelOrchestrator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [ghostFunnel, setGhostFunnel] = useState<GhostFunnelResponse | null>(null);

  const generateGhostFunnel = async (request: GhostFunnelRequest): Promise<GhostFunnelResponse | null> => {
    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('ghost-funnel-orchestrator', {
        body: {
          ...request,
          userId: user?.id
        }
      });

      if (error) {
        console.error('Ghost Funnel generation error:', error);
        toast.error('Failed to generate Ghost Funnel');
        return null;
      }

      setGhostFunnel(data);
      toast.success(`Ghost Funnel generated using ${data.metadata.modelsUsed.join(', ')}`);
      return data;
    } catch (error) {
      console.error('Error generating Ghost Funnel:', error);
      toast.error('An error occurred while generating the Ghost Funnel');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearResults = () => {
    setGhostFunnel(null);
  };

  return {
    isGenerating,
    ghostFunnel,
    generateGhostFunnel,
    clearResults
  };
}