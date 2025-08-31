import { supabase } from '@/integrations/supabase/client';
import { PremiumTemplate } from '@/types/strategy';

export interface PremiumTemplatePurchase {
  id: string;
  user_id: string;
  template_id: string;
  purchase_date: string;
  purchase_amount: number;
  stripe_payment_intent_id?: string;
  created_at: string;
}

// Get preview data for browsing (no sensitive content)
export const getPremiumTemplatePreview = async (): Promise<PremiumTemplate[]> => {
  try {
    const { data, error } = await supabase.rpc('get_premium_template_preview');
    
    if (error) {
      console.error('Error fetching premium templates preview:', error);
      return [];
    }
    
    // Transform to match PremiumTemplate interface
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name || 'Unnamed Template',
      description: item.description,
      category: item.category || 'General',
      industry: item.industry,
      price: item.price || 0,
      is_premium: true,
      template_data: {}, // Empty for security - only available after purchase
      performance_metrics: {}, // Empty for security - only available after purchase
      sales_count: item.sales_count || 0,
      rating: item.rating || 0,
      created_by: '', // Hidden for security
      approved_at: item.approved_at,
      created_at: item.created_at,
      updated_at: null,
    }));
  } catch (error) {
    console.error('Error in getPremiumTemplatePreview:', error);
    return [];
  }
};

// Get full template data (only for purchased templates)
export const getPurchasedTemplate = async (templateId: string): Promise<PremiumTemplate | null> => {
  try {
    const { data, error } = await supabase.rpc('get_purchased_premium_template', {
      template_id_param: templateId
    });
    
    if (error) {
      console.error('Error fetching purchased template:', error);
      throw new Error('Access denied: Template not purchased or not found');
    }
    
    if (!data || data.length === 0) {
      throw new Error('Template not found or not purchased');
    }
    
    const template = data[0];
    
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      industry: template.industry,
      price: template.price,
      is_premium: true,
      template_data: template.template_data || {},
      performance_metrics: template.performance_metrics || {},
      sales_count: template.sales_count || 0,
      rating: template.rating || 0,
      created_by: '', // Still hidden for security
      approved_at: null,
      created_at: template.created_at,
      updated_at: null,
    };
  } catch (error) {
    console.error('Error in getPurchasedTemplate:', error);
    throw error;
  }
};

// Record a premium template purchase
export const recordTemplatePurchase = async (
  templateId: string,
  amount: number,
  stripePaymentIntentId?: string
): Promise<PremiumTemplatePurchase> => {
  try {
    const { data: authUser } = await supabase.auth.getUser();
    
    if (!authUser.user) {
      throw new Error('User must be authenticated to purchase templates');
    }
    
    const { data, error } = await supabase
      .from('premium_template_purchases')
      .insert({
        user_id: authUser.user.id,
        template_id: templateId,
        purchase_amount: amount,
        stripe_payment_intent_id: stripePaymentIntentId,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error recording template purchase:', error);
      throw new Error('Failed to record purchase');
    }
    
    return data;
  } catch (error) {
    console.error('Error in recordTemplatePurchase:', error);
    throw error;
  }
};

// Check if user has purchased a specific template
export const hasUserPurchasedTemplate = async (templateId: string): Promise<boolean> => {
  try {
    const { data: authUser } = await supabase.auth.getUser();
    
    if (!authUser.user) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('premium_template_purchases')
      .select('id')
      .eq('user_id', authUser.user.id)
      .eq('template_id', templateId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking template purchase:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in hasUserPurchasedTemplate:', error);
    return false;
  }
};

// Get user's purchased templates
export const getUserPurchasedTemplates = async (): Promise<PremiumTemplatePurchase[]> => {
  try {
    const { data: authUser } = await supabase.auth.getUser();
    
    if (!authUser.user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('premium_template_purchases')
      .select('*')
      .eq('user_id', authUser.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user purchases:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUserPurchasedTemplates:', error);
    return [];
  }
};