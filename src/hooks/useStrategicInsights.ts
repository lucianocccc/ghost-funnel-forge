
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MarketIntelligence, AICredits, SubscriptionPlan } from '@/types/strategy';

export const useStrategicInsights = () => {
  const { user } = useAuth();
  const [marketData, setMarketData] = useState<MarketIntelligence[]>([]);
  const [aiCredits, setAiCredits] = useState<AICredits | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMarketIntelligence = async (industry?: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('market_intelligence')
        .select('*')
        .gte('expires_at', new Date().toISOString())
        .order('analyzed_at', { ascending: false });

      if (industry) {
        query = query.eq('industry', industry);
      }

      const { data, error } = await query.limit(10);
      
      if (error) {
        console.error('Error loading market intelligence:', error);
        setMarketData([]);
        return;
      }
      
      setMarketData(data || []);
    } catch (error) {
      console.error('Error loading market intelligence:', error);
      setMarketData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAICredits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading AI credits:', error);
        return;
      }

      if (!data) {
        // Create initial AI credits record
        const { data: newCredits, error: createError } = await supabase
          .from('ai_credits')
          .insert({
            user_id: user.id,
            credits_available: 10, // Free starter credits
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating AI credits:', createError);
          return;
        }
        
        setAiCredits(newCredits);
      } else {
        setAiCredits(data);
      }
    } catch (error) {
      console.error('Error managing AI credits:', error);
    }
  };

  const loadSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) {
        console.error('Error loading subscription plans:', error);
        setSubscriptionPlans([]);
        return;
      }
      
      setSubscriptionPlans(data || []);
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      setSubscriptionPlans([]);
    }
  };

  const consumeAICredits = async (amount: number = 1) => {
    if (!user || !aiCredits) return false;

    if (aiCredits.credits_available < amount) {
      throw new Error('Insufficient AI credits');
    }

    try {
      const { error } = await supabase
        .from('ai_credits')
        .update({
          credits_available: aiCredits.credits_available - amount,
          credits_used: aiCredits.credits_used + amount,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error consuming AI credits:', error);
        return false;
      }

      setAiCredits(prev => prev ? {
        ...prev,
        credits_available: prev.credits_available - amount,
        credits_used: prev.credits_used + amount,
      } : null);

      return true;
    } catch (error) {
      console.error('Error consuming AI credits:', error);
      return false;
    }
  };

  const trackBehavior = async (eventType: string, eventData: any = {}) => {
    if (!user) return;

    try {
      await supabase
        .from('user_behavioral_data')
        .insert({
          user_id: user.id,
          session_id: sessionStorage.getItem('session_id') || 'anonymous',
          event_type: eventType,
          event_data: eventData,
          page_path: window.location.pathname,
          referrer: document.referrer,
          device_info: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
          },
        });
    } catch (error) {
      console.error('Error tracking behavior:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadAICredits();
      loadSubscriptionPlans();
      
      // Track page view
      trackBehavior('page_view', {
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
    }
  }, [user]);

  return {
    marketData,
    aiCredits,
    subscriptionPlans,
    loading,
    loadMarketIntelligence,
    loadAICredits,
    consumeAICredits,
    trackBehavior,
  };
};
