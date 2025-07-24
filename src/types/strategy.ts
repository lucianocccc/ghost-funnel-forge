
export interface MarketIntelligence {
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

export interface AICredits {
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

export interface PremiumTemplate {
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

export interface SubscriptionPlan {
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
