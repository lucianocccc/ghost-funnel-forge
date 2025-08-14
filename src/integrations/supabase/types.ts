export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      advanced_lead_scoring: {
        Row: {
          behavioral_score: number | null
          calculated_at: string | null
          consolidated_lead_id: string
          context_score: number | null
          created_at: string | null
          demographic_score: number | null
          engagement_score: number | null
          id: string
          improvement_suggestions: Json
          score_breakdown: Json
          scoring_factors: Json
          timing_score: number | null
          total_score: number | null
          updated_at: string | null
        }
        Insert: {
          behavioral_score?: number | null
          calculated_at?: string | null
          consolidated_lead_id: string
          context_score?: number | null
          created_at?: string | null
          demographic_score?: number | null
          engagement_score?: number | null
          id?: string
          improvement_suggestions?: Json
          score_breakdown?: Json
          scoring_factors?: Json
          timing_score?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Update: {
          behavioral_score?: number | null
          calculated_at?: string | null
          consolidated_lead_id?: string
          context_score?: number | null
          created_at?: string | null
          demographic_score?: number | null
          engagement_score?: number | null
          id?: string
          improvement_suggestions?: Json
          score_breakdown?: Json
          scoring_factors?: Json
          timing_score?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advanced_lead_scoring_consolidated_lead_id_fkey"
            columns: ["consolidated_lead_id"]
            isOneToOne: true
            referencedRelation: "consolidated_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      advanced_lead_scoring_v2: {
        Row: {
          ai_predicted_score: number | null
          behavioral_score: number | null
          calculated_at: string | null
          consolidated_lead_id: string
          contextual_score: number | null
          demographic_score: number | null
          engagement_score: number | null
          expires_at: string | null
          id: string
          improvement_actions: Json | null
          intent_score: number | null
          next_best_action: string | null
          optimal_contact_time: string | null
          personalization_data: Json | null
          score_breakdown: Json | null
          timing_score: number | null
          total_score: number | null
        }
        Insert: {
          ai_predicted_score?: number | null
          behavioral_score?: number | null
          calculated_at?: string | null
          consolidated_lead_id: string
          contextual_score?: number | null
          demographic_score?: number | null
          engagement_score?: number | null
          expires_at?: string | null
          id?: string
          improvement_actions?: Json | null
          intent_score?: number | null
          next_best_action?: string | null
          optimal_contact_time?: string | null
          personalization_data?: Json | null
          score_breakdown?: Json | null
          timing_score?: number | null
          total_score?: number | null
        }
        Update: {
          ai_predicted_score?: number | null
          behavioral_score?: number | null
          calculated_at?: string | null
          consolidated_lead_id?: string
          contextual_score?: number | null
          demographic_score?: number | null
          engagement_score?: number | null
          expires_at?: string | null
          id?: string
          improvement_actions?: Json | null
          intent_score?: number | null
          next_best_action?: string | null
          optimal_contact_time?: string | null
          personalization_data?: Json | null
          score_breakdown?: Json | null
          timing_score?: number | null
          total_score?: number | null
        }
        Relationships: []
      }
      ai_credits: {
        Row: {
          created_at: string
          credits_available: number
          credits_purchased: number
          credits_used: number
          id: string
          last_purchase_at: string | null
          reset_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_available?: number
          credits_purchased?: number
          credits_used?: number
          id?: string
          last_purchase_at?: string | null
          reset_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_available?: number
          credits_purchased?: number
          credits_used?: number
          id?: string
          last_purchase_at?: string | null
          reset_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_funnel_templates: {
        Row: {
          ai_generated: boolean | null
          ai_optimization_suggestions: Json | null
          conversion_rate: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          industry: string | null
          is_premium: boolean | null
          name: string
          performance_metrics: Json | null
          template_data: Json
          updated_at: string | null
          use_case: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          ai_optimization_suggestions?: Json | null
          conversion_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_premium?: boolean | null
          name: string
          performance_metrics?: Json | null
          template_data?: Json
          updated_at?: string | null
          use_case?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          ai_optimization_suggestions?: Json | null
          conversion_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_premium?: boolean | null
          name?: string
          performance_metrics?: Json | null
          template_data?: Json
          updated_at?: string | null
          use_case?: string | null
        }
        Relationships: []
      }
      ai_generated_funnels: {
        Row: {
          ai_generated: boolean | null
          created_at: string
          description: string | null
          funnel_data: Json
          funnel_type: string | null
          id: string
          industry: string | null
          interview_id: string
          is_active: boolean
          is_from_chatbot: boolean | null
          name: string
          session_id: string | null
          share_token: string
          source: string | null
          updated_at: string
          use_case: string | null
          user_id: string
          views_count: number
        }
        Insert: {
          ai_generated?: boolean | null
          created_at?: string
          description?: string | null
          funnel_data?: Json
          funnel_type?: string | null
          id?: string
          industry?: string | null
          interview_id: string
          is_active?: boolean
          is_from_chatbot?: boolean | null
          name: string
          session_id?: string | null
          share_token?: string
          source?: string | null
          updated_at?: string
          use_case?: string | null
          user_id: string
          views_count?: number
        }
        Update: {
          ai_generated?: boolean | null
          created_at?: string
          description?: string | null
          funnel_data?: Json
          funnel_type?: string | null
          id?: string
          industry?: string | null
          interview_id?: string
          is_active?: boolean
          is_from_chatbot?: boolean | null
          name?: string
          session_id?: string | null
          share_token?: string
          source?: string | null
          updated_at?: string
          use_case?: string | null
          user_id?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_generated_funnels_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "client_interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_recommendations: {
        Row: {
          action_items: Json | null
          created_at: string | null
          description: string | null
          expected_impact: Json | null
          expires_at: string | null
          id: string
          implementation_difficulty: string | null
          priority_level: string | null
          recommendation_type: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_items?: Json | null
          created_at?: string | null
          description?: string | null
          expected_impact?: Json | null
          expires_at?: string | null
          id?: string
          implementation_difficulty?: string | null
          priority_level?: string | null
          recommendation_type: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_items?: Json | null
          created_at?: string | null
          description?: string | null
          expected_impact?: Json | null
          expires_at?: string | null
          id?: string
          implementation_difficulty?: string | null
          priority_level?: string | null
          recommendation_type?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      business_areas: {
        Row: {
          color_hex: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          color_hex?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          color_hex?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_sub_areas: {
        Row: {
          business_area_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          business_area_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          business_area_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_sub_areas_business_area_id_fkey"
            columns: ["business_area_id"]
            isOneToOne: false
            referencedRelation: "business_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_conversations: {
        Row: {
          created_at: string
          id: string
          message_content: string
          message_role: string
          metadata: Json | null
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_content: string
          message_role: string
          metadata?: Json | null
          session_id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_content?: string
          message_role?: string
          metadata?: Json | null
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      chatbot_generated_funnels: {
        Row: {
          created_at: string
          funnel_data: Json
          funnel_description: string | null
          funnel_name: string
          id: string
          industry: string | null
          interview_id: string
          is_saved: boolean
          target_audience: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          funnel_data?: Json
          funnel_description?: string | null
          funnel_name: string
          id?: string
          industry?: string | null
          interview_id: string
          is_saved?: boolean
          target_audience?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          funnel_data?: Json
          funnel_description?: string | null
          funnel_name?: string
          id?: string
          industry?: string | null
          interview_id?: string
          is_saved?: boolean
          target_audience?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_generated_funnels_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "chatbot_interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_interviews: {
        Row: {
          created_at: string
          id: string
          interview_data: Json
          session_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interview_data?: Json
          session_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interview_data?: Json
          session_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chatbot_user_profiles: {
        Row: {
          business_sector: string | null
          conversation_count: number | null
          created_at: string
          generated_funnels: Json | null
          goals: Json | null
          id: string
          interests: Json | null
          last_interaction: string | null
          preferences: Json | null
          target_audience: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_sector?: string | null
          conversation_count?: number | null
          created_at?: string
          generated_funnels?: Json | null
          goals?: Json | null
          id?: string
          interests?: Json | null
          last_interaction?: string | null
          preferences?: Json | null
          target_audience?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_sector?: string | null
          conversation_count?: number | null
          created_at?: string
          generated_funnels?: Json | null
          goals?: Json | null
          id?: string
          interests?: Json | null
          last_interaction?: string | null
          preferences?: Json | null
          target_audience?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_interviews: {
        Row: {
          analyzed_at: string | null
          budget_range: string | null
          business_description: string | null
          business_name: string | null
          created_at: string
          current_challenges: string | null
          goals: string | null
          gpt_analysis: Json | null
          id: string
          interview_data: Json
          status: string
          target_audience: string | null
          timeline: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analyzed_at?: string | null
          budget_range?: string | null
          business_description?: string | null
          business_name?: string | null
          created_at?: string
          current_challenges?: string | null
          goals?: string | null
          gpt_analysis?: Json | null
          id?: string
          interview_data?: Json
          status?: string
          target_audience?: string | null
          timeline?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analyzed_at?: string | null
          budget_range?: string | null
          business_description?: string | null
          business_name?: string | null
          created_at?: string
          current_challenges?: string | null
          goals?: string | null
          gpt_analysis?: Json | null
          id?: string
          interview_data?: Json
          status?: string
          target_audience?: string | null
          timeline?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          cognome: string
          created_at: string
          email: string
          id: string
          nome: string
          telefono: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cognome: string
          created_at?: string
          email: string
          id?: string
          nome: string
          telefono?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cognome?: string
          created_at?: string
          email?: string
          id?: string
          nome?: string
          telefono?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
      company_memberships: {
        Row: {
          company_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_memberships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      consolidated_leads: {
        Row: {
          action_plan: Json | null
          ai_analysis: Json | null
          ai_insights: Json | null
          ai_recommendations: Json | null
          analyzed_at: string | null
          business_area_id: string | null
          business_sub_area_id: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          last_interaction_at: string | null
          lead_score: number | null
          name: string | null
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          priority_level: string | null
          source_funnel_id: string | null
          status: string | null
          tags: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action_plan?: Json | null
          ai_analysis?: Json | null
          ai_insights?: Json | null
          ai_recommendations?: Json | null
          analyzed_at?: string | null
          business_area_id?: string | null
          business_sub_area_id?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_interaction_at?: string | null
          lead_score?: number | null
          name?: string | null
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          priority_level?: string | null
          source_funnel_id?: string | null
          status?: string | null
          tags?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action_plan?: Json | null
          ai_analysis?: Json | null
          ai_insights?: Json | null
          ai_recommendations?: Json | null
          analyzed_at?: string | null
          business_area_id?: string | null
          business_sub_area_id?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_interaction_at?: string | null
          lead_score?: number | null
          name?: string | null
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          priority_level?: string | null
          source_funnel_id?: string | null
          status?: string | null
          tags?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consolidated_leads_business_area_id_fkey"
            columns: ["business_area_id"]
            isOneToOne: false
            referencedRelation: "business_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consolidated_leads_business_sub_area_id_fkey"
            columns: ["business_sub_area_id"]
            isOneToOne: false
            referencedRelation: "business_sub_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consolidated_leads_source_funnel_id_fkey"
            columns: ["source_funnel_id"]
            isOneToOne: false
            referencedRelation: "interactive_funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      document_analysis: {
        Row: {
          actionable_recommendations: Json | null
          ai_analysis: Json | null
          business_opportunities: Json | null
          competitive_analysis: Json | null
          confidence_score: number | null
          created_at: string | null
          document_name: string
          document_type: string
          extracted_text: string | null
          id: string
          insights: Json | null
          market_positioning: Json | null
          original_content: string | null
          processing_status: string | null
          target_audience_insights: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actionable_recommendations?: Json | null
          ai_analysis?: Json | null
          business_opportunities?: Json | null
          competitive_analysis?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          document_name: string
          document_type: string
          extracted_text?: string | null
          id?: string
          insights?: Json | null
          market_positioning?: Json | null
          original_content?: string | null
          processing_status?: string | null
          target_audience_insights?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actionable_recommendations?: Json | null
          ai_analysis?: Json | null
          business_opportunities?: Json | null
          competitive_analysis?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          document_name?: string
          document_type?: string
          extracted_text?: string | null
          id?: string
          insights?: Json | null
          market_positioning?: Json | null
          original_content?: string | null
          processing_status?: string | null
          target_audience_insights?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          subject: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          subject: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      enhanced_lead_analysis: {
        Row: {
          analyzed_at: string | null
          behavioral_analysis: Json
          confidence_score: number | null
          consolidated_lead_id: string
          conversion_probability: number | null
          created_at: string | null
          engagement_patterns: Json
          engagement_score: number | null
          funnel_context: Json
          id: string
          lead_temperature: string | null
          next_action_recommendation: string | null
          optimal_contact_timing: Json
          personalization_level: string | null
          personalized_strategy: Json
          predictive_insights: Json
          updated_at: string | null
        }
        Insert: {
          analyzed_at?: string | null
          behavioral_analysis?: Json
          confidence_score?: number | null
          consolidated_lead_id: string
          conversion_probability?: number | null
          created_at?: string | null
          engagement_patterns?: Json
          engagement_score?: number | null
          funnel_context?: Json
          id?: string
          lead_temperature?: string | null
          next_action_recommendation?: string | null
          optimal_contact_timing?: Json
          personalization_level?: string | null
          personalized_strategy?: Json
          predictive_insights?: Json
          updated_at?: string | null
        }
        Update: {
          analyzed_at?: string | null
          behavioral_analysis?: Json
          confidence_score?: number | null
          consolidated_lead_id?: string
          conversion_probability?: number | null
          created_at?: string | null
          engagement_patterns?: Json
          engagement_score?: number | null
          funnel_context?: Json
          id?: string
          lead_temperature?: string | null
          next_action_recommendation?: string | null
          optimal_contact_timing?: Json
          personalization_level?: string | null
          personalized_strategy?: Json
          predictive_insights?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enhanced_lead_analysis_consolidated_lead_id_fkey"
            columns: ["consolidated_lead_id"]
            isOneToOne: false
            referencedRelation: "consolidated_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_analytics: {
        Row: {
          conversions: number
          created_at: string
          date: string
          funnel_id: string
          id: string
          revenue: number | null
          step_id: string | null
          visitors: number
        }
        Insert: {
          conversions?: number
          created_at?: string
          date?: string
          funnel_id: string
          id?: string
          revenue?: number | null
          step_id?: string | null
          visitors?: number
        }
        Update: {
          conversions?: number
          created_at?: string
          date?: string
          funnel_id?: string
          id?: string
          revenue?: number | null
          step_id?: string | null
          visitors?: number
        }
        Relationships: [
          {
            foreignKeyName: "funnel_analytics_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funnel_analytics_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "funnel_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          funnel_id: string
          id: string
          session_id: string | null
          step_id: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          funnel_id: string
          id?: string
          session_id?: string | null
          step_id?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          funnel_id?: string
          id?: string
          session_id?: string | null
          step_id?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_analytics_events_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "interactive_funnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funnel_analytics_events_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "interactive_funnel_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_definitions: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          flow_data: Json
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          flow_data?: Json
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          flow_data?: Json
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      funnel_executions: {
        Row: {
          completed_at: string | null
          current_step: string | null
          execution_log: Json | null
          funnel_id: string
          id: string
          lead_id: string
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: string | null
          execution_log?: Json | null
          funnel_id: string
          id?: string
          lead_id: string
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          current_step?: string | null
          execution_log?: Json | null
          funnel_id?: string
          id?: string
          lead_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnel_executions_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnel_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funnel_executions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_feedback: {
        Row: {
          contact_email: string | null
          contact_info: Json | null
          contact_name: string | null
          created_at: string
          feedback_text: string | null
          funnel_id: string
          id: string
          interested: boolean | null
          ip_address: unknown | null
          rating: number | null
          user_agent: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_info?: Json | null
          contact_name?: string | null
          created_at?: string
          feedback_text?: string | null
          funnel_id: string
          id?: string
          interested?: boolean | null
          ip_address?: unknown | null
          rating?: number | null
          user_agent?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_info?: Json | null
          contact_name?: string | null
          created_at?: string
          feedback_text?: string | null
          funnel_id?: string
          id?: string
          interested?: boolean | null
          ip_address?: unknown | null
          rating?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_feedback_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "ai_generated_funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_performance_analytics: {
        Row: {
          ai_insights: Json | null
          average_time_on_page: number | null
          bounce_rate: number | null
          conversion_rate: number | null
          conversions: number | null
          created_at: string | null
          date: string | null
          device_breakdown: Json | null
          funnel_id: string
          geographic_data: Json | null
          id: string
          optimization_opportunities: Json | null
          page_views: number | null
          traffic_sources: Json | null
          unique_visitors: number | null
        }
        Insert: {
          ai_insights?: Json | null
          average_time_on_page?: number | null
          bounce_rate?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          date?: string | null
          device_breakdown?: Json | null
          funnel_id: string
          geographic_data?: Json | null
          id?: string
          optimization_opportunities?: Json | null
          page_views?: number | null
          traffic_sources?: Json | null
          unique_visitors?: number | null
        }
        Update: {
          ai_insights?: Json | null
          average_time_on_page?: number | null
          bounce_rate?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          date?: string | null
          device_breakdown?: Json | null
          funnel_id?: string
          geographic_data?: Json | null
          id?: string
          optimization_opportunities?: Json | null
          page_views?: number | null
          traffic_sources?: Json | null
          unique_visitors?: number | null
        }
        Relationships: []
      }
      funnel_section_library: {
        Row: {
          category: string
          complexity_level: string | null
          configuration_options: Json
          content_template: Json
          conversion_impact_score: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          industry_tags: string[] | null
          is_premium: boolean
          section_name: string
          section_type: string
          updated_at: string
          use_case_tags: string[] | null
        }
        Insert: {
          category: string
          complexity_level?: string | null
          configuration_options?: Json
          content_template?: Json
          conversion_impact_score?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry_tags?: string[] | null
          is_premium?: boolean
          section_name: string
          section_type: string
          updated_at?: string
          use_case_tags?: string[] | null
        }
        Update: {
          category?: string
          complexity_level?: string | null
          configuration_options?: Json
          content_template?: Json
          conversion_impact_score?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry_tags?: string[] | null
          is_premium?: boolean
          section_name?: string
          section_type?: string
          updated_at?: string
          use_case_tags?: string[] | null
        }
        Relationships: []
      }
      funnel_steps: {
        Row: {
          content: Json | null
          conversion_rate: number | null
          created_at: string
          description: string | null
          funnel_id: string
          id: string
          is_active: boolean
          step_number: number
          step_type: Database["public"]["Enums"]["step_type"]
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json | null
          conversion_rate?: number | null
          created_at?: string
          description?: string | null
          funnel_id: string
          id?: string
          is_active?: boolean
          step_number: number
          step_type: Database["public"]["Enums"]["step_type"]
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json | null
          conversion_rate?: number | null
          created_at?: string
          description?: string | null
          funnel_id?: string
          id?: string
          is_active?: boolean
          step_number?: number
          step_type?: Database["public"]["Enums"]["step_type"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnel_steps_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_submissions: {
        Row: {
          analysis_score: number | null
          browser_info: string | null
          completion_time: number | null
          conversion_value: number | null
          created_at: string | null
          device_type: string | null
          funnel_id: string
          gpt_analysis: Json | null
          id: string
          ip_address: unknown | null
          lead_status: string | null
          location_data: Json | null
          referrer_url: string | null
          session_id: string | null
          source: string | null
          step_id: string
          submission_data: Json
          updated_at: string | null
          user_agent: string | null
          user_email: string | null
          user_name: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          analysis_score?: number | null
          browser_info?: string | null
          completion_time?: number | null
          conversion_value?: number | null
          created_at?: string | null
          device_type?: string | null
          funnel_id: string
          gpt_analysis?: Json | null
          id?: string
          ip_address?: unknown | null
          lead_status?: string | null
          location_data?: Json | null
          referrer_url?: string | null
          session_id?: string | null
          source?: string | null
          step_id: string
          submission_data?: Json
          updated_at?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_name?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          analysis_score?: number | null
          browser_info?: string | null
          completion_time?: number | null
          conversion_value?: number | null
          created_at?: string | null
          device_type?: string | null
          funnel_id?: string
          gpt_analysis?: Json | null
          id?: string
          ip_address?: unknown | null
          lead_status?: string | null
          location_data?: Json | null
          referrer_url?: string | null
          session_id?: string | null
          source?: string | null
          step_id?: string
          submission_data?: Json
          updated_at?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_name?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_submissions_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "interactive_funnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funnel_submissions_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "interactive_funnel_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          industry: string | null
          is_premium: boolean
          name: string
          preview_image_url: string | null
          rating: number | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_premium?: boolean
          name: string
          preview_image_url?: string | null
          rating?: number | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_premium?: boolean
          name?: string
          preview_image_url?: string | null
          rating?: number | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      funnel_types: {
        Row: {
          ai_prompts: Json | null
          category: string
          complexity_level: string | null
          conversion_optimization: Json | null
          created_at: string | null
          description: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          name: string
          target_audience: string | null
          template_steps: Json | null
          updated_at: string | null
        }
        Insert: {
          ai_prompts?: Json | null
          category: string
          complexity_level?: string | null
          conversion_optimization?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          name: string
          target_audience?: string | null
          template_steps?: Json | null
          updated_at?: string | null
        }
        Update: {
          ai_prompts?: Json | null
          category?: string
          complexity_level?: string | null
          conversion_optimization?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          name?: string
          target_audience?: string | null
          template_steps?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      funnels: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          estimated_conversion_rate: number | null
          id: string
          industry: string | null
          is_template: boolean
          lead_id: string | null
          name: string
          status: Database["public"]["Enums"]["funnel_status"]
          target_audience: string | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          estimated_conversion_rate?: number | null
          id?: string
          industry?: string | null
          is_template?: boolean
          lead_id?: string | null
          name: string
          status?: Database["public"]["Enums"]["funnel_status"]
          target_audience?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          estimated_conversion_rate?: number | null
          id?: string
          industry?: string | null
          is_template?: boolean
          lead_id?: string | null
          name?: string
          status?: Database["public"]["Enums"]["funnel_status"]
          target_audience?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnels_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      interactive_funnel_steps: {
        Row: {
          created_at: string | null
          description: string | null
          fields_config: Json | null
          funnel_id: string
          id: string
          is_required: boolean | null
          settings: Json | null
          step_order: number
          step_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          fields_config?: Json | null
          funnel_id: string
          id?: string
          is_required?: boolean | null
          settings?: Json | null
          step_order: number
          step_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          fields_config?: Json | null
          funnel_id?: string
          id?: string
          is_required?: boolean | null
          settings?: Json | null
          step_order?: number
          step_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interactive_funnel_steps_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "interactive_funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      interactive_funnels: {
        Row: {
          ai_funnel_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          settings: Json | null
          share_token: string | null
          status: string | null
          submissions_count: number | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          ai_funnel_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          settings?: Json | null
          share_token?: string | null
          status?: string | null
          submissions_count?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          ai_funnel_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          settings?: Json | null
          share_token?: string | null
          status?: string | null
          submissions_count?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      lead_analisi: {
        Row: {
          analisi_profilo: string | null
          categoria_cliente: string | null
          created_at: string
          funnel_personalizzato: string | null
          id: string
          lead_id: string | null
          next_steps: string | null
          opportunità: string | null
          priorita: string | null
          punti_dolore: string | null
          strategie_approccio: string | null
        }
        Insert: {
          analisi_profilo?: string | null
          categoria_cliente?: string | null
          created_at?: string
          funnel_personalizzato?: string | null
          id?: string
          lead_id?: string | null
          next_steps?: string | null
          opportunità?: string | null
          priorita?: string | null
          punti_dolore?: string | null
          strategie_approccio?: string | null
        }
        Update: {
          analisi_profilo?: string | null
          categoria_cliente?: string | null
          created_at?: string
          funnel_personalizzato?: string | null
          id?: string
          lead_id?: string | null
          next_steps?: string | null
          opportunità?: string | null
          priorita?: string | null
          punti_dolore?: string | null
          strategie_approccio?: string | null
        }
        Relationships: []
      }
      lead_analysis_interactive: {
        Row: {
          analysis_data: Json
          analyzed_at: string | null
          created_at: string | null
          funnel_id: string
          id: string
          insights: Json | null
          lead_score: number | null
          personalized_strategy: string | null
          priority_level: string | null
          recommendations: Json | null
          submission_id: string
        }
        Insert: {
          analysis_data?: Json
          analyzed_at?: string | null
          created_at?: string | null
          funnel_id: string
          id?: string
          insights?: Json | null
          lead_score?: number | null
          personalized_strategy?: string | null
          priority_level?: string | null
          recommendations?: Json | null
          submission_id: string
        }
        Update: {
          analysis_data?: Json
          analyzed_at?: string | null
          created_at?: string | null
          funnel_id?: string
          id?: string
          insights?: Json | null
          lead_score?: number | null
          personalized_strategy?: string | null
          priority_level?: string | null
          recommendations?: Json | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_analysis_interactive_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "interactive_funnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_analysis_interactive_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "funnel_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_interactions: {
        Row: {
          consolidated_lead_id: string
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          interaction_type: string
          metadata: Json | null
          subject: string | null
        }
        Insert: {
          consolidated_lead_id: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          interaction_type: string
          metadata?: Json | null
          subject?: string | null
        }
        Update: {
          consolidated_lead_id?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          interaction_type?: string
          metadata?: Json | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_interactions_consolidated_lead_id_fkey"
            columns: ["consolidated_lead_id"]
            isOneToOne: false
            referencedRelation: "consolidated_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_scores: {
        Row: {
          calculated_at: string
          id: string
          lead_id: string
          motivation: string | null
          score_breakdown: Json
          tone_analysis: Json | null
          total_score: number
        }
        Insert: {
          calculated_at?: string
          id?: string
          lead_id: string
          motivation?: string | null
          score_breakdown?: Json
          tone_analysis?: Json | null
          total_score?: number
        }
        Update: {
          calculated_at?: string
          id?: string
          lead_id?: string
          motivation?: string | null
          score_breakdown?: Json
          tone_analysis?: Json | null
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "lead_scores_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_scoring_rules: {
        Row: {
          condition_operator: string
          condition_value: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          points: number
          rule_type: string
          updated_at: string
        }
        Insert: {
          condition_operator: string
          condition_value: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          points: number
          rule_type: string
          updated_at?: string
        }
        Update: {
          condition_operator?: string
          condition_value?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          points?: number
          rule_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_submissions_mapping: {
        Row: {
          consolidated_lead_id: string
          created_at: string
          id: string
          submission_data: Json
          submission_id: string
        }
        Insert: {
          consolidated_lead_id: string
          created_at?: string
          id?: string
          submission_data?: Json
          submission_id: string
        }
        Update: {
          consolidated_lead_id?: string
          created_at?: string
          id?: string
          submission_data?: Json
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_submissions_mapping_consolidated_lead_id_fkey"
            columns: ["consolidated_lead_id"]
            isOneToOne: false
            referencedRelation: "consolidated_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_submissions_mapping_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "funnel_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          analyzed_at: string | null
          bio: string | null
          created_at: string
          email: string | null
          gpt_analysis: Json | null
          id: string
          last_score_calculation: string | null
          message_length: number | null
          nome: string | null
          response_time_minutes: number | null
          servizio: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          user_id: string | null
        }
        Insert: {
          analyzed_at?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          gpt_analysis?: Json | null
          id?: string
          last_score_calculation?: string | null
          message_length?: number | null
          nome?: string | null
          response_time_minutes?: number | null
          servizio?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          user_id?: string | null
        }
        Update: {
          analyzed_at?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          gpt_analysis?: Json | null
          id?: string
          last_score_calculation?: string | null
          message_length?: number | null
          nome?: string | null
          response_time_minutes?: number | null
          servizio?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          user_id?: string | null
        }
        Relationships: []
      }
      market_intelligence: {
        Row: {
          analyzed_at: string
          competitive_data: Json
          confidence_score: number
          created_at: string
          expires_at: string
          id: string
          industry: string
          market_trends: Json
          opportunity_analysis: Json
          pricing_insights: Json
          updated_at: string
        }
        Insert: {
          analyzed_at?: string
          competitive_data?: Json
          confidence_score?: number
          created_at?: string
          expires_at?: string
          id?: string
          industry: string
          market_trends?: Json
          opportunity_analysis?: Json
          pricing_insights?: Json
          updated_at?: string
        }
        Update: {
          analyzed_at?: string
          competitive_data?: Json
          confidence_score?: number
          created_at?: string
          expires_at?: string
          id?: string
          industry?: string
          market_trends?: Json
          opportunity_analysis?: Json
          pricing_insights?: Json
          updated_at?: string
        }
        Relationships: []
      }
      modular_funnel_configs: {
        Row: {
          config_name: string
          created_at: string
          funnel_objective: string | null
          global_settings: Json
          id: string
          industry: string | null
          is_active: boolean
          is_template: boolean
          performance_metrics: Json | null
          sections_config: Json
          target_audience: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          config_name: string
          created_at?: string
          funnel_objective?: string | null
          global_settings?: Json
          id?: string
          industry?: string | null
          is_active?: boolean
          is_template?: boolean
          performance_metrics?: Json | null
          sections_config?: Json
          target_audience?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          config_name?: string
          created_at?: string
          funnel_objective?: string | null
          global_settings?: Json
          id?: string
          industry?: string | null
          is_active?: boolean
          is_template?: boolean
          performance_metrics?: Json | null
          sections_config?: Json
          target_audience?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      modular_funnel_generations: {
        Row: {
          ai_optimization_suggestions: Json | null
          config_id: string | null
          created_at: string
          generated_funnel_data: Json
          generation_status: string
          id: string
          interactive_funnel_id: string | null
          performance_predictions: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_optimization_suggestions?: Json | null
          config_id?: string | null
          created_at?: string
          generated_funnel_data?: Json
          generation_status?: string
          id?: string
          interactive_funnel_id?: string | null
          performance_predictions?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_optimization_suggestions?: Json | null
          config_id?: string | null
          created_at?: string
          generated_funnel_data?: Json
          generation_status?: string
          id?: string
          interactive_funnel_id?: string | null
          performance_predictions?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "modular_funnel_generations_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "modular_funnel_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      predictive_analytics: {
        Row: {
          churn_risk_score: number | null
          competitive_analysis: Json | null
          confidence_intervals: Json | null
          consolidated_lead_id: string
          conversion_probability: number | null
          created_at: string | null
          engagement_forecast: Json | null
          expires_at: string | null
          id: string
          market_trends_impact: Json | null
          model_version: string | null
          optimal_contact_window: Json | null
          predicted_actions: Json | null
          predicted_lifetime_value: number | null
          prediction_date: string | null
          seasonal_patterns: Json | null
          updated_at: string | null
        }
        Insert: {
          churn_risk_score?: number | null
          competitive_analysis?: Json | null
          confidence_intervals?: Json | null
          consolidated_lead_id: string
          conversion_probability?: number | null
          created_at?: string | null
          engagement_forecast?: Json | null
          expires_at?: string | null
          id?: string
          market_trends_impact?: Json | null
          model_version?: string | null
          optimal_contact_window?: Json | null
          predicted_actions?: Json | null
          predicted_lifetime_value?: number | null
          prediction_date?: string | null
          seasonal_patterns?: Json | null
          updated_at?: string | null
        }
        Update: {
          churn_risk_score?: number | null
          competitive_analysis?: Json | null
          confidence_intervals?: Json | null
          consolidated_lead_id?: string
          conversion_probability?: number | null
          created_at?: string | null
          engagement_forecast?: Json | null
          expires_at?: string | null
          id?: string
          market_trends_impact?: Json | null
          model_version?: string | null
          optimal_contact_window?: Json | null
          predicted_actions?: Json | null
          predicted_lifetime_value?: number | null
          prediction_date?: string | null
          seasonal_patterns?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "predictive_analytics_consolidated_lead_id_fkey"
            columns: ["consolidated_lead_id"]
            isOneToOne: true
            referencedRelation: "consolidated_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_templates: {
        Row: {
          approved_at: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          industry: string | null
          is_premium: boolean
          name: string
          performance_metrics: Json
          price: number
          rating: number
          sales_count: number
          template_data: Json
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_premium?: boolean
          name: string
          performance_metrics?: Json
          price?: number
          rating?: number
          sales_count?: number
          template_data?: Json
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_premium?: boolean
          name?: string
          performance_metrics?: Json
          price?: number
          rating?: number
          sales_count?: number
          template_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      revolution_customer_profiles: {
        Row: {
          behavioral_patterns: Json
          communication_style: Json
          conversion_triggers: Json
          created_at: string | null
          customer_data: Json
          decision_making_pattern: string | null
          id: string
          intelligence_score: number | null
          last_updated_at: string | null
          motivations: Json
          objection_patterns: Json
          pain_points: Json
          profile_completeness: number | null
          psychographic_profile: Json
          trust_signals: Json
          user_id: string
        }
        Insert: {
          behavioral_patterns?: Json
          communication_style?: Json
          conversion_triggers?: Json
          created_at?: string | null
          customer_data?: Json
          decision_making_pattern?: string | null
          id?: string
          intelligence_score?: number | null
          last_updated_at?: string | null
          motivations?: Json
          objection_patterns?: Json
          pain_points?: Json
          profile_completeness?: number | null
          psychographic_profile?: Json
          trust_signals?: Json
          user_id: string
        }
        Update: {
          behavioral_patterns?: Json
          communication_style?: Json
          conversion_triggers?: Json
          created_at?: string | null
          customer_data?: Json
          decision_making_pattern?: string | null
          id?: string
          intelligence_score?: number | null
          last_updated_at?: string | null
          motivations?: Json
          objection_patterns?: Json
          pain_points?: Json
          profile_completeness?: number | null
          psychographic_profile?: Json
          trust_signals?: Json
          user_id?: string
        }
        Relationships: []
      }
      revolution_funnel_templates: {
        Row: {
          avg_conversion_rate: number | null
          conversion_strategy: Json
          copy_templates: Json
          created_at: string | null
          customer_profile_match: Json
          design_system: Json
          funnel_structure: Json
          id: string
          industry: string | null
          interactive_funnel_id: string | null
          is_ai_generated: boolean | null
          performance_score: number | null
          personalization_rules: Json
          template_name: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          avg_conversion_rate?: number | null
          conversion_strategy?: Json
          copy_templates?: Json
          created_at?: string | null
          customer_profile_match?: Json
          design_system?: Json
          funnel_structure?: Json
          id?: string
          industry?: string | null
          interactive_funnel_id?: string | null
          is_ai_generated?: boolean | null
          performance_score?: number | null
          personalization_rules?: Json
          template_name: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          avg_conversion_rate?: number | null
          conversion_strategy?: Json
          copy_templates?: Json
          created_at?: string | null
          customer_profile_match?: Json
          design_system?: Json
          funnel_structure?: Json
          id?: string
          industry?: string | null
          interactive_funnel_id?: string | null
          is_ai_generated?: boolean | null
          performance_score?: number | null
          personalization_rules?: Json
          template_name?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_revolution_templates_interactive_funnel"
            columns: ["interactive_funnel_id"]
            isOneToOne: false
            referencedRelation: "interactive_funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      revolution_learning_memory: {
        Row: {
          confidence_score: number | null
          context_data: Json
          created_at: string | null
          id: string
          last_applied_at: string | null
          learning_data: Json
          memory_type: string
          performance_metrics: Json
          success_rate: number | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          context_data?: Json
          created_at?: string | null
          id?: string
          last_applied_at?: string | null
          learning_data?: Json
          memory_type: string
          performance_metrics?: Json
          success_rate?: number | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          context_data?: Json
          created_at?: string | null
          id?: string
          last_applied_at?: string | null
          learning_data?: Json
          memory_type?: string
          performance_metrics?: Json
          success_rate?: number | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      revolution_performance_analytics: {
        Row: {
          analytics_type: string
          created_at: string | null
          customer_profile_id: string | null
          funnel_id: string | null
          id: string
          improvement_opportunities: Json
          insights: Json
          metrics_data: Json
          recommendations: Json
          recorded_at: string | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          analytics_type: string
          created_at?: string | null
          customer_profile_id?: string | null
          funnel_id?: string | null
          id?: string
          improvement_opportunities?: Json
          insights?: Json
          metrics_data?: Json
          recommendations?: Json
          recorded_at?: string | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          analytics_type?: string
          created_at?: string | null
          customer_profile_id?: string | null
          funnel_id?: string | null
          id?: string
          improvement_opportunities?: Json
          insights?: Json
          metrics_data?: Json
          recommendations?: Json
          recorded_at?: string | null
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revolution_performance_analytics_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "revolution_customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revolution_performance_analytics_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "revolution_funnel_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      revolution_question_sequences: {
        Row: {
          analysis_results: Json
          completion_status: string | null
          created_at: string | null
          current_question_index: number | null
          customer_profile_id: string | null
          id: string
          intelligence_gathered: number | null
          next_questions: Json
          question_sequence: Json
          responses: Json
          session_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_results?: Json
          completion_status?: string | null
          created_at?: string | null
          current_question_index?: number | null
          customer_profile_id?: string | null
          id?: string
          intelligence_gathered?: number | null
          next_questions?: Json
          question_sequence?: Json
          responses?: Json
          session_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_results?: Json
          completion_status?: string | null
          created_at?: string | null
          current_question_index?: number | null
          customer_profile_id?: string | null
          id?: string
          intelligence_gathered?: number | null
          next_questions?: Json
          question_sequence?: Json
          responses?: Json
          session_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revolution_question_sequences_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "revolution_customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sent_emails: {
        Row: {
          content: string
          created_at: string
          error_message: string | null
          id: string
          lead_id: string
          resend_id: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          to_email: string
        }
        Insert: {
          content: string
          created_at?: string
          error_message?: string | null
          id?: string
          lead_id: string
          resend_id?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
          to_email: string
        }
        Update: {
          content?: string
          created_at?: string
          error_message?: string | null
          id?: string
          lead_id?: string
          resend_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "sent_emails_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sent_emails_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_funnel_sessions: {
        Row: {
          analysis_result: Json
          completed_at: string | null
          created_at: string
          final_result: Json | null
          id: string
          initial_prompt: string
          session_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_result: Json
          completed_at?: string | null
          created_at?: string
          final_result?: Json | null
          id?: string
          initial_prompt: string
          session_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_result?: Json
          completed_at?: string | null
          created_at?: string
          final_result?: Json | null
          id?: string
          initial_prompt?: string
          session_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan"]
          price_monthly: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan"]
          price_monthly: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan"]
          price_monthly?: number
          updated_at?: string
        }
        Relationships: []
      }
      template_steps: {
        Row: {
          created_at: string
          default_content: Json | null
          description: string | null
          id: string
          is_required: boolean
          step_number: number
          step_type: Database["public"]["Enums"]["step_type"]
          template_id: string
          title: string
        }
        Insert: {
          created_at?: string
          default_content?: Json | null
          description?: string | null
          id?: string
          is_required?: boolean
          step_number: number
          step_type: Database["public"]["Enums"]["step_type"]
          template_id: string
          title: string
        }
        Update: {
          created_at?: string
          default_content?: Json | null
          description?: string | null
          id?: string
          is_required?: boolean
          step_number?: number
          step_type?: Database["public"]["Enums"]["step_type"]
          template_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "funnel_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_behavioral_data: {
        Row: {
          action_data: Json | null
          action_type: string
          conversion_intent_score: number | null
          device_type: string | null
          engagement_score: number | null
          id: string
          ip_address: unknown | null
          page_path: string | null
          session_id: string
          timestamp: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          conversion_intent_score?: number | null
          device_type?: string | null
          engagement_score?: number | null
          id?: string
          ip_address?: unknown | null
          page_path?: string | null
          session_id: string
          timestamp?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          conversion_intent_score?: number | null
          device_type?: string | null
          engagement_score?: number | null
          id?: string
          ip_address?: unknown | null
          page_path?: string | null
          session_id?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_funnel_views: {
        Args: { share_token_param: string }
        Returns: undefined
      }
      increment_interactive_funnel_submissions: {
        Args: { funnel_id_param: string }
        Returns: undefined
      }
      increment_interactive_funnel_views: {
        Args: { share_token_param: string }
        Returns: undefined
      }
      user_owns_lead_funnel: {
        Args: { lead_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      funnel_status: "draft" | "active" | "archived"
      lead_status:
        | "nuovo"
        | "contattato"
        | "in_trattativa"
        | "chiuso_vinto"
        | "chiuso_perso"
      step_type:
        | "landing_page"
        | "opt_in"
        | "sales_page"
        | "checkout"
        | "thank_you"
        | "upsell"
        | "downsell"
        | "email_sequence"
        | "webinar"
        | "survey"
      subscription_plan: "basic" | "pro"
      subscription_status: "active" | "inactive" | "cancelled" | "past_due"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      funnel_status: ["draft", "active", "archived"],
      lead_status: [
        "nuovo",
        "contattato",
        "in_trattativa",
        "chiuso_vinto",
        "chiuso_perso",
      ],
      step_type: [
        "landing_page",
        "opt_in",
        "sales_page",
        "checkout",
        "thank_you",
        "upsell",
        "downsell",
        "email_sequence",
        "webinar",
        "survey",
      ],
      subscription_plan: ["basic", "pro"],
      subscription_status: ["active", "inactive", "cancelled", "past_due"],
    },
  },
} as const
