
import { supabase } from '@/integrations/supabase/client';
import { LeadScoringEngine } from '@/components/interactive-funnel/components/LeadScoringEngine';

interface LeadSubmissionData {
  funnel_id: string;
  step_id: string;
  submission_data: Record<string, any>;
  user_email?: string;
  user_name?: string;
  session_id: string;
}

interface ProcessedLead {
  consolidated_lead_id: string;
  lead_score: number;
  qualification: string;
  insights: string[];
  follow_up_strategy: any;
  next_action: string;
}

export const intelligentLeadService = {
  async processLeadSubmission(submissionData: LeadSubmissionData): Promise<ProcessedLead> {
    console.log('🔍 Processing intelligent lead submission:', submissionData);
    
    try {
      // Get all submissions for this session to build complete lead profile
      const { data: sessionSubmissions, error: sessionError } = await supabase
        .from('funnel_submissions')
        .select('*')
        .eq('session_id', submissionData.session_id)
        .eq('funnel_id', submissionData.funnel_id)
        .order('created_at', { ascending: true });

      if (sessionError) {
        console.error('Error fetching session submissions:', sessionError);
        throw sessionError;
      }

      // Combine all submission data with proper type safety
      const combinedData = sessionSubmissions?.reduce((acc, submission) => {
        // Ensure submission_data is an object before spreading
        const submissionDataObj = submission.submission_data && 
          typeof submission.submission_data === 'object' && 
          submission.submission_data !== null &&
          !Array.isArray(submission.submission_data) 
            ? submission.submission_data as Record<string, any>
            : {};
        
        return { ...acc, ...submissionDataObj };
      }, {} as Record<string, any>) || {};

      console.log('📊 Combined lead data:', combinedData);

      // Calculate lead score using our intelligent engine
      const leadScore = LeadScoringEngine.calculateScore(combinedData);
      console.log('🎯 Lead score calculated:', leadScore);

      // Generate follow-up strategy
      const followUpStrategy = LeadScoringEngine.generateFollowUpStrategy(leadScore, combinedData);
      console.log('📋 Follow-up strategy:', followUpStrategy);

      // Find or create consolidated lead
      const email = combinedData.email || submissionData.user_email;
      if (!email) {
        throw new Error('Email is required for lead processing');
      }

      // Get funnel owner
      const { data: funnelData, error: funnelError } = await supabase
        .from('interactive_funnels')
        .select('created_by, name')
        .eq('id', submissionData.funnel_id)
        .single();

      if (funnelError) {
        console.error('Error fetching funnel data:', funnelError);
        throw funnelError;
      }

      // Check for existing consolidated lead
      let consolidatedLeadId: string;
      const { data: existingLead, error: leadError } = await supabase
        .from('consolidated_leads')
        .select('id')
        .eq('email', email)
        .eq('user_id', funnelData.created_by)
        .single();

      if (existingLead) {
        consolidatedLeadId = existingLead.id;
        
        // Update existing lead with new information
        const { error: updateError } = await supabase
          .from('consolidated_leads')
          .update({
            name: combinedData.nome || combinedData.name || submissionData.user_name,
            phone: combinedData.telefono || combinedData.phone,
            company: combinedData.nome_azienda || combinedData.company,
            lead_score: leadScore.total,
            priority_level: leadScore.qualification,
            ai_insights: leadScore.insights,
            ai_recommendations: [followUpStrategy.approach],
            last_interaction_at: new Date().toISOString(),
            ai_analysis: {
              score_breakdown: leadScore.breakdown,
              qualification: leadScore.qualification,
              follow_up_priority: followUpStrategy.priority,
              business_context: {
                ruolo: combinedData.ruolo_aziendale,
                dimensione: combinedData.dimensione_business,
                sfida: combinedData.principale_sfida,
                timeline: combinedData.timeline_implementazione,
                budget: combinedData.budget_indicativo
              }
            }
          })
          .eq('id', consolidatedLeadId);

        if (updateError) {
          console.error('Error updating consolidated lead:', updateError);
          throw updateError;
        }
      } else {
        // Create new consolidated lead
        const { data: newLead, error: createError } = await supabase
          .from('consolidated_leads')
          .insert({
            user_id: funnelData.created_by,
            source_funnel_id: submissionData.funnel_id,
            name: combinedData.nome || combinedData.name || submissionData.user_name,
            email: email,
            phone: combinedData.telefono || combinedData.phone,
            company: combinedData.nome_azienda || combinedData.company,
            lead_score: leadScore.total,
            priority_level: leadScore.qualification,
            status: 'new',
            ai_insights: leadScore.insights,
            ai_recommendations: [followUpStrategy.approach],
            last_interaction_at: new Date().toISOString(),
            ai_analysis: {
              score_breakdown: leadScore.breakdown,
              qualification: leadScore.qualification,
              follow_up_priority: followUpStrategy.priority,
              business_context: {
                ruolo: combinedData.ruolo_aziendale,
                dimensione: combinedData.dimensione_business,
                sfida: combinedData.principale_sfida,
                timeline: combinedData.timeline_implementazione,
                budget: combinedData.budget_indicativo
              }
            }
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating consolidated lead:', createError);
          throw createError;
        }

        consolidatedLeadId = newLead.id;
      }

      // Create enhanced analysis record
      const { error: analysisError } = await supabase
        .from('enhanced_lead_analysis')
        .upsert({
          consolidated_lead_id: consolidatedLeadId,
          funnel_context: {
            funnel_name: funnelData.name,
            funnel_id: submissionData.funnel_id,
            completion_step: submissionData.step_id
          },
          behavioral_analysis: {
            interaction_pattern: sessionSubmissions?.map(s => ({
              step: s.step_id,
              timestamp: s.created_at,
              completion_time: s.completion_time
            })),
            engagement_level: leadScore.qualification
          },
          engagement_patterns: {
            form_completion_rate: sessionSubmissions?.length || 1,
            time_to_complete: combinedData.completion_time || 0
          },
          predictive_insights: {
            conversion_probability: leadScore.total / 100,
            recommended_actions: [followUpStrategy.approach],
            optimal_contact_timing: followUpStrategy.priority
          },
          personalized_strategy: {
            messaging_tone: leadScore.qualification === 'hot' ? 'urgent' : 'consultative',
            content_focus: combinedData.principale_sfida ? 'problem_solving' : 'value_demonstration',
            preferred_channel: combinedData.telefono ? 'phone' : 'email'
          },
          optimal_contact_timing: {
            priority: followUpStrategy.priority,
            suggested_time: new Date(Date.now() + (followUpStrategy.priority === 'immediate' ? 2 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString()
          },
          conversion_probability: leadScore.total / 100,
          engagement_score: leadScore.total,
          confidence_score: leadScore.total > 50 ? 0.8 : 0.5,
          lead_temperature: leadScore.qualification,
          next_action_recommendation: followUpStrategy.approach
        });

      if (analysisError) {
        console.error('Error creating enhanced analysis:', analysisError);
        // Non-blocking error, continue
      }

      console.log('✅ Intelligent lead processing completed');

      return {
        consolidated_lead_id: consolidatedLeadId,
        lead_score: leadScore.total,
        qualification: leadScore.qualification,
        insights: leadScore.insights,
        follow_up_strategy: followUpStrategy,
        next_action: followUpStrategy.approach
      };

    } catch (error) {
      console.error('❌ Error in intelligent lead processing:', error);
      throw error;
    }
  },

  async getLeadAnalytics(funnelId: string): Promise<any> {
    console.log('📈 Fetching lead analytics for funnel:', funnelId);

    try {
      // Get all leads from this funnel
      const { data: leads, error: leadsError } = await supabase
        .from('consolidated_leads')
        .select(`
          *,
          enhanced_lead_analysis(*)
        `)
        .eq('source_funnel_id', funnelId);

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        throw leadsError;
      }

      // Calculate analytics
      const totalLeads = leads?.length || 0;
      const hotLeads = leads?.filter(l => l.priority_level === 'hot').length || 0;
      const warmLeads = leads?.filter(l => l.priority_level === 'warm').length || 0;
      const coldLeads = leads?.filter(l => l.priority_level === 'cold').length || 0;

      const averageScore = totalLeads > 0 
        ? leads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / totalLeads 
        : 0;

      return {
        totalLeads,
        qualificationBreakdown: {
          hot: hotLeads,
          warm: warmLeads,
          cold: coldLeads
        },
        averageScore: Math.round(averageScore),
        conversionRate: totalLeads > 0 ? (hotLeads / totalLeads) * 100 : 0,
        topInsights: leads?.flatMap(l => l.ai_insights || []).slice(0, 5) || []
      };

    } catch (error) {
      console.error('❌ Error fetching lead analytics:', error);
      throw error;
    }
  }
};
