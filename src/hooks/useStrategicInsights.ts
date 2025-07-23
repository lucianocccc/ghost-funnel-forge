
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
      
      // Using type assertion to work with the current schema
      const query = supabase
        .from('market_intelligence' as any)
        .select('*')
        .gte('expires_at', new Date().toISOString())
        .order('analyzed_at', { ascending: false });

      const finalQuery = industry 
        ? query.eq('industry', industry)
        : query;

      const { data, error } = await finalQuery.limit(10);
      if (error) {
        console.error('Error loading market intelligence:', error);
        return;
      }
      
      setMarketData((data as any[])?.map(item => ({
        id: item.id,
        industry: item.industry,
        competitive_data: item.competitive_data || {},
        market_trends: item.market_trends || {},
        pricing_insights: item.pricing_insights || {},
        opportunity_analysis: item.opportunity_analysis || {},
        confidence_score: item.confidence_score || 0,
        analyzed_at: item.analyzed_at,
        expires_at: item.expires_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })) || []);
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
        .from('ai_credits' as any)
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading AI credits:', error);
        return;
      }

      if (!data) {
        // Create initial AI credits record
        const { data: newCredits, error: createError } = await supabase
          .from('ai_credits' as any)
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
        
        setAiCredits({
          id: newCredits.id,
          user_id: newCredits.user_id,
          credits_available: newCredits.credits_available || 10,
          credits_used: newCredits.credits_used || 0,
          credits_purchased: newCredits.credits_purchased || 0,
          last_purchase_at: newCredits.last_purchase_at,
          reset_date: newCredits.reset_date,
          created_at: newCredits.created_at,
          updated_at: newCredits.updated_at,
        });
      } else {
        setAiCredits({
          id: data.id,
          user_id: data.user_id,
          credits_available: data.credits_available || 0,
          credits_used: data.credits_used || 0,
          credits_purchased: data.credits_purchased || 0,
          last_purchase_at: data.last_purchase_at,
          reset_date: data.reset_date,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      }
    } catch (error) {
      console.error('Error managing AI credits:', error);
    }
  };

  const loadSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans' as any)
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) {
        console.error('Error loading subscription plans:', error);
        return;
      }
      
      setSubscriptionPlans((data as any[])?.map(plan => ({
        id: plan.id,
        name: plan.name,
        tier: plan.tier as 'starter' | 'professional' | 'enterprise' | 'white_label',
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly,
        features: Array.isArray(plan.features) ? plan.features : [],
        limits: plan.limits || { max_funnels: 0, max_submissions: 0, api_calls: 0 },
        ai_credits_included: plan.ai_credits_included || 0,
        is_active: plan.is_active,
        created_at: plan.created_at,
        updated_at: plan.updated_at,
      })) || []);
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
        .from('ai_credits' as any)
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
        .from('user_behavioral_data' as any)
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
