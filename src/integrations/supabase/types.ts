export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_generated_funnels: {
        Row: {
          created_at: string
          description: string | null
          funnel_data: Json
          id: string
          interview_id: string
          is_active: boolean
          name: string
          share_token: string
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          funnel_data?: Json
          id?: string
          interview_id: string
          is_active?: boolean
          name: string
          share_token?: string
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          funnel_data?: Json
          id?: string
          interview_id?: string
          is_active?: boolean
          name?: string
          share_token?: string
          updated_at?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
