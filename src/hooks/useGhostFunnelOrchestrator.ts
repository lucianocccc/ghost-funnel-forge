import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GhostFunnelRequest {
  business_name: string;
  business_type: string;
  description: string;
  tone: string;
  target_audience: string;
  language: string;
}

export interface GhostFunnelResponse {
  hero: {
    headline: string;
    subheadline: string;
    cta_text: string;
  };
  advantages: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  emotional: {
    story: string;
    pain_points: string[];
    transformation: string;
  };
  cta: {
    primary_text: string;
    secondary_text: string;
    urgency: string;
  };
  style: 'Apple' | 'Nike' | 'Amazon';
  images: Array<{
    type: string;
    description: string;
    alt_text: string;
  }>;
  saved_funnel_id?: string;
  execution_metadata?: {
    total_time_ms: number;
    phases_completed: number;
    models_used: string[];
    execution_log: string[];
    confidence_scores: {
      market_research: number;
      storytelling: number;
      orchestration: number;
    };
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
      
      if (data.saved_funnel_id) {
        toast.success('Ghost Funnel generato e salvato con successo! Visibile in /revolution/funnels');
      } else {
        toast.success('Ghost Funnel generato con successo!');
      }
      
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