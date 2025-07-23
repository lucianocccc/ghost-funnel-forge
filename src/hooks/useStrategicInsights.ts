
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
      
      // Query using raw SQL to bypass TypeScript type checking
      let query = `
        SELECT * FROM market_intelligence 
        WHERE expires_at >= NOW()
        ORDER BY analyzed_at DESC
        LIMIT 10
      `;
      
      if (industry) {
        query = `
          SELECT * FROM market_intelligence 
          WHERE expires_at >= NOW() AND industry = '${industry}'
          ORDER BY analyzed_at DESC
          LIMIT 10
        `;
      }

      const { data, error } = await supabase.rpc('execute_sql', { sql_query: query }) as any;
      
      if (error) {
        console.error('Error loading market intelligence:', error);
        setMarketData([]);
        return;
      }
      
      // Transform data to match expected interface
      const transformedData: MarketIntelligence[] = (data || []).map((item: any) => ({
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
      }));
      
      setMarketData(transformedData);
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
      // Use direct table access with type assertion
      const { data, error } = await (supabase as any)
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
        const { data: newCredits, error: createError } = await (supabase as any)
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
        
        // Transform to expected interface
        const transformedCredits: AICredits = {
          id: newCredits.id,
          user_id: newCredits.user_id,
          credits_available: newCredits.credits_available,
          credits_used: newCredits.credits_used || 0,
          credits_purchased: newCredits.credits_purchased || 0,
          last_purchase_at: newCredits.last_purchase_at,
          reset_date: newCredits.reset_date,
          created_at: newCredits.created_at,
          updated_at: newCredits.updated_at,
        };
        
        setAiCredits(transformedCredits);
      } else {
        // Transform existing data
        const transformedCredits: AICredits = {
          id: data.id,
          user_id: data.user_id,
          credits_available: data.credits_available,
          credits_used: data.credits_used || 0,
          credits_purchased: data.credits_purchased || 0,
          last_purchase_at: data.last_purchase_at,
          reset_date: data.reset_date,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        
        setAiCredits(transformedCredits);
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
      
      // Transform data to match expected interface
      const transformedPlans: SubscriptionPlan[] = (data || []).map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        tier: plan.plan_type || 'starter', // Map plan_type to tier
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly,
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
      const { error } = await (supabase as any)
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
      await (supabase as any)
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
