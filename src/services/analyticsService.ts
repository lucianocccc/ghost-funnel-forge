
import { supabase } from '@/integrations/supabase/client';

export interface FunnelAnalyticsEvent {
  id?: string;
  funnel_id: string;
  step_id?: string;
  event_type: 'view' | 'start' | 'complete' | 'abandon' | 'conversion';
  session_id?: string;
  user_id?: string;
  user_email?: string;
  event_data?: Record<string, any>;
  created_at?: string;
}

export interface FunnelAnalyticsData {
  total_views: number;
  total_submissions: number;
  conversion_rate: number;
  step_analytics: Array<{
    step_id: string;
    step_title: string;
    views: number;
    completions: number;
    abandons: number;
    conversion_rate: number;
  }>;
  daily_stats: Array<{
    date: string;
    views: number;
    submissions: number;
  }>;
}

class AnalyticsService {
  // Track funnel events
  async trackEvent(event: Omit<FunnelAnalyticsEvent, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('funnel_analytics_events')
        .insert(event);

      if (error) {
        console.error('Error tracking analytics event:', error);
        throw error;
      }
    } catch (error) {
      console.error('Analytics tracking failed:', error);
      // Don't throw error to prevent breaking the user experience
    }
  }

  // Get comprehensive analytics for a funnel
  async getFunnelAnalytics(funnelId: string): Promise<FunnelAnalyticsData> {
    try {
      // Get basic funnel stats
      const { data: funnelData, error: funnelError } = await supabase
        .from('interactive_funnels')
        .select('views_count, submissions_count')
        .eq('id', funnelId)
        .single();

      if (funnelError) throw funnelError;

      // Get events for detailed analytics
      const { data: events, error: eventsError } = await supabase
        .from('funnel_analytics_events')
        .select('*')
        .eq('funnel_id', funnelId)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Get funnel steps for step-by-step analysis
      const { data: steps, error: stepsError } = await supabase
        .from('interactive_funnel_steps')
        .select('id, title, step_order')
        .eq('funnel_id', funnelId)
        .order('step_order');

      if (stepsError) throw stepsError;

      // Calculate step analytics
      const stepAnalytics = (steps || []).map(step => {
        const stepViews = events?.filter(e => e.step_id === step.id && e.event_type === 'view').length || 0;
        const stepCompletions = events?.filter(e => e.step_id === step.id && e.event_type === 'complete').length || 0;
        const stepAbandons = events?.filter(e => e.step_id === step.id && e.event_type === 'abandon').length || 0;

        return {
          step_id: step.id,
          step_title: step.title,
          views: stepViews,
          completions: stepCompletions,
          abandons: stepAbandons,
          conversion_rate: stepViews > 0 ? (stepCompletions / stepViews) * 100 : 0
        };
      });

      // Calculate daily stats for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailyStats = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayViews = events?.filter(e => 
          e.created_at?.startsWith(dateStr) && e.event_type === 'view'
        ).length || 0;

        const daySubmissions = events?.filter(e => 
          e.created_at?.startsWith(dateStr) && e.event_type === 'conversion'
        ).length || 0;

        dailyStats.push({
          date: dateStr,
          views: dayViews,
          submissions: daySubmissions
        });
      }

      const totalViews = funnelData?.views_count || 0;
      const totalSubmissions = funnelData?.submissions_count || 0;

      return {
        total_views: totalViews,
        total_submissions: totalSubmissions,
        conversion_rate: totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0,
        step_analytics: stepAnalytics,
        daily_stats: dailyStats
      };
    } catch (error) {
      console.error('Error fetching funnel analytics:', error);
      throw error;
    }
  }

  // Track funnel view
  async trackFunnelView(funnelId: string, sessionId?: string, userEmail?: string): Promise<void> {
    await this.trackEvent({
      funnel_id: funnelId,
      event_type: 'view',
      session_id: sessionId,
      user_email: userEmail
    });
  }

  // Track funnel start
  async trackFunnelStart(funnelId: string, stepId: string, sessionId?: string, userEmail?: string): Promise<void> {
    await this.trackEvent({
      funnel_id: funnelId,
      step_id: stepId,
      event_type: 'start',
      session_id: sessionId,
      user_email: userEmail
    });
  }

  // Track step completion
  async trackStepComplete(funnelId: string, stepId: string, sessionId?: string, userEmail?: string, formData?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      funnel_id: funnelId,
      step_id: stepId,
      event_type: 'complete',
      session_id: sessionId,
      user_email: userEmail,
      event_data: formData
    });
  }

  // Track funnel conversion (completion)
  async trackFunnelConversion(funnelId: string, sessionId?: string, userEmail?: string, conversionValue?: number): Promise<void> {
    await this.trackEvent({
      funnel_id: funnelId,
      event_type: 'conversion',
      session_id: sessionId,
      user_email: userEmail,
      event_data: { conversion_value: conversionValue }
    });
  }

  // Track funnel abandon
  async trackFunnelAbandon(funnelId: string, stepId: string, sessionId?: string, userEmail?: string): Promise<void> {
    await this.trackEvent({
      funnel_id: funnelId,
      step_id: stepId,
      event_type: 'abandon',
      session_id: sessionId,
      user_email: userEmail
    });
  }
}

export const analyticsService = new AnalyticsService();
