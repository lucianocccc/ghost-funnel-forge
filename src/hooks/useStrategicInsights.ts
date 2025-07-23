
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MarketIntelligence {
  id: string;
  industry: string;
  competitive_data: any;
  market_trends: any;
  pricing_insights: any;
  opportunity_analysis: any;
  confidence_score: number;
  analyzed_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

interface AICredits {
  id: string;
  user_id: string;
  credits_available: number;
  credits_used: number;
  credits_purchased: number;
  last_purchase_at?: string;
  reset_date: string;
  created_at: string;
  updated_at: string;
}

interface PremiumTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  industry?: string;
  price: number;
  is_premium: boolean;
  template_data: any;
  performance_metrics: any;
  sales_count: number;
  rating: number;
  created_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'starter' | 'professional' | 'enterprise' | 'white_label';
  price_monthly: number;
  price_yearly?: number;
  features: string[];
  limits: {
    max_funnels: number;
    max_submissions: number;
    api_calls: number;
  };
  ai_credits_included: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useStrategicInsights = () => {
  const { user } = useAuth();
  const [marketData, setMarketData] = useState<MarketIntelligence[]>([]);
  const [aiCredits, setAiCredits] = useState<AICredits | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [premiumTemplates, setPremiumTemplates] = useState<PremiumTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMarketIntelligence = async (industry?: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('market_intelligence')
        .select('*')
        .order('analyzed_at', { ascending: false });

      if (industry) {
        query = query.eq('industry', industry);
      }

      const { data, error } = await query;

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
        .single();

      if (error) {
        // If no credits record exists, it will be created by the trigger
        if (error.code === 'PGRST116') {
          // No record found, the trigger should create one
          console.log('No AI credits record found, will be created automatically');
          return;
        }
        console.error('Error loading AI credits:', error);
        return;
      }

      setAiCredits(data);
    } catch (error) {
      console.error('Error loading AI credits:', error);
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
        tier: plan.tier || 'starter',
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly || null,
        features: Array.isArray(plan.features) ? plan.features : [],
        limits: plan.limits || {
          max_funnels: 5,
          max_submissions: 1000,
          api_calls: 10000,
        },
        ai_credits_included: plan.ai_credits_included || 100,
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

  const loadPremiumTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('premium_templates')
        .select('*')
        .not('approved_at', 'is', null)
        .order('rating', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading premium templates:', error);
        setPremiumTemplates([]);
        return;
      }

      setPremiumTemplates(data || []);
    } catch (error) {
      console.error('Error loading premium templates:', error);
      setPremiumTemplates([]);
    }
  };

  const consumeAICredits = async (amount: number = 1) => {
    if (!user || !aiCredits) return false;

    if (aiCredits.credits_available < amount) {
      throw new Error('Insufficient AI credits');
    }

    try {
      const { data, error } = await supabase
        .from('ai_credits')
        .update({
          credits_available: aiCredits.credits_available - amount,
          credits_used: aiCredits.credits_used + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error consuming AI credits:', error);
        return false;
      }

      setAiCredits(data);
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
      loadPremiumTemplates();
      
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
    premiumTemplates,
    loading,
    loadMarketIntelligence,
    loadAICredits,
    consumeAICredits,
    trackBehavior,
  };
};
