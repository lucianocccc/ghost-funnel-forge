
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
      
      // Since market_intelligence table doesn't exist in the schema, 
      // we'll return empty data for now
      console.log('Market intelligence feature not yet implemented - table not found in schema');
      setMarketData([]);
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
      // Since ai_credits table doesn't exist in the schema,
      // we'll create a mock credits object for now
      console.log('AI credits feature not yet implemented - table not found in schema');
      
      const mockCredits: AICredits = {
        id: 'mock-id',
        user_id: user.id,
        credits_available: 10,
        credits_used: 0,
        credits_purchased: 0,
        last_purchase_at: null,
        reset_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setAiCredits(mockCredits);
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
      
      // Transform data to match expected interface
      const transformedPlans: SubscriptionPlan[] = (data || []).map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        tier: plan.plan_type || 'starter', // Map plan_type to tier
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly || null,
        features: Array.isArray(plan.features) ? plan.features : [],
        limits: {
          max_funnels: 5,
          max_submissions: 1000,
          api_calls: 10000,
        },
        ai_credits_included: 100,
        is_active: plan.is_active,
        created_at: plan.created_at,
        updated_at: plan.updated_at,
      }));
      
      setSubscriptionPlans(transformedPlans);
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
      // Since ai_credits table doesn't exist, we'll simulate consumption
      console.log('AI credits consumption simulated - table not found in schema');
      
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
      const { error } = await supabase
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

      if (error) {
        console.error('Error tracking behavior:', error);
      }
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
