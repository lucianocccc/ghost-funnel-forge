import { supabase } from '@/integrations/supabase/client';
import { ModularFunnelConfig, FunnelSection } from '@/hooks/useModularFunnelConfig';
import { FunnelSectionLibraryItem } from '@/hooks/useFunnelSectionLibrary';
import { ModularFunnelGeneration } from '@/hooks/useModularFunnelGeneration';
import { DynamicSectionEngine, expandedSectionTemplates } from './dynamicSectionEngine';

// Enhanced section templates with new types
export const defaultSectionTemplates: FunnelSectionLibraryItem[] = expandedSectionTemplates;

export class ModularFunnelService {
  
  // Initialize default sections in the library
  static async initializeDefaultSections(): Promise<void> {
    try {
      for (const template of defaultSectionTemplates) {
        const { error } = await supabase
          .from('funnel_section_library')
          .upsert({
            section_name: template.section_name,
            section_type: template.section_type,
            category: template.category,
            description: template.description,
            content_template: template.content_template as any,
            configuration_options: template.configuration_options as any,
            industry_tags: template.industry_tags,
            use_case_tags: template.use_case_tags,
            conversion_impact_score: template.conversion_impact_score,
            complexity_level: template.complexity_level,
            is_premium: template.is_premium,
            created_by: null // System templates
          }, {
            onConflict: 'section_name'
          });

        if (error) {
          console.error('Error inserting default section:', error);
        }
      }
    } catch (error) {
      console.error('Error initializing default sections:', error);
    }
  }

  // Generate funnel structure based on industry and objectives (legacy method)
  static generateFunnelStructure(
    industry: string,
    objectives: string[],
    targetAudience: string,
    complexity: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): FunnelSection[] {
    const structure: FunnelSection[] = [];
    let position = 0;

    // Always start with a hero section
    structure.push({
      id: `hero-${Date.now()}`,
      section_type: 'hero',
      position: position++,
      config: {
        template: 'Hero con Video',
        industry,
        targetAudience
      },
      is_enabled: true
    });

    // Add problem/solution for coaching and consulting
    if (['coaching', 'consulting', 'education'].includes(industry)) {
      structure.push({
        id: `problem-solution-${Date.now()}`,
        section_type: 'problem_solution',
        position: position++,
        config: {
          template: 'Problema & Soluzione',
          industry,
          targetAudience
        },
        is_enabled: true
      });
    }

    // Add social proof for all industries
    structure.push({
      id: `social-proof-${Date.now()}`,
      section_type: 'social_proof',
      position: position++,
      config: {
        template: 'Social Proof Avanzato',
        industry,
        targetAudience
      },
      is_enabled: true
    });

    // Add lead capture
    if (objectives.includes('lead_generation') || objectives.includes('email_collection')) {
      structure.push({
        id: `lead-capture-${Date.now()}`,
        section_type: 'lead_capture',
        position: position++,
        config: {
          template: 'Raccolta Lead Form',
          industry,
          targetAudience
        },
        is_enabled: true
      });
    }

    // Add urgency for sales objectives
    if (objectives.includes('sales') || objectives.includes('conversion')) {
      structure.push({
        id: `urgency-${Date.now()}`,
        section_type: 'urgency',
        position: position++,
        config: {
          template: 'Countdown Timer',
          industry,
          targetAudience
        },
        is_enabled: true
      });
    }

    return structure;
  }

  // NEW: Generate dynamic funnel structure using AI-powered rules
  static generateDynamicFunnelStructure(
    prompt: string,
    industry: string,
    objectives: string[],
    targetAudience: string,
    complexity: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): {
    structure: FunnelSection[];
    analysis: any;
    appliedRules: string[];
  } {
    return DynamicSectionEngine.generateDynamicFunnelStructure(
      prompt,
      industry,
      objectives,
      targetAudience
    );
  }

  // Create a complete funnel configuration
  static async createFunnelFromTemplate(
    configName: string,
    industry: string,
    targetAudience: string,
    objectives: string[],
    complexity: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): Promise<ModularFunnelConfig | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const sectionsConfig = this.generateFunnelStructure(industry, objectives, targetAudience, complexity);

      const funnelConfig: ModularFunnelConfig = {
        config_name: configName,
        industry,
        target_audience: targetAudience,
        funnel_objective: objectives.join(', '),
        sections_config: sectionsConfig,
        global_settings: {
          theme: 'professional',
          colorScheme: 'primary',
          typography: 'modern',
          animations: true,
          mobileOptimized: true,
          seoOptimized: true,
          analyticsEnabled: true
        },
        is_template: false,
        is_active: true
      };

      const { data, error } = await supabase
        .from('modular_funnel_configs')
        .insert({
          config_name: funnelConfig.config_name,
          industry: funnelConfig.industry,
          target_audience: funnelConfig.target_audience,
          funnel_objective: funnelConfig.funnel_objective,
          sections_config: funnelConfig.sections_config as any,
          global_settings: funnelConfig.global_settings as any,
          is_template: funnelConfig.is_template,
          is_active: funnelConfig.is_active,
          user_id: user.user.id
        })
        .select()
        .single();

      if (error) throw error;

      return data as ModularFunnelConfig;
    } catch (error) {
      console.error('Error creating funnel from template:', error);
      return null;
    }
  }

  // Get optimized section recommendations based on performance data
  static async getOptimizedSectionRecommendations(
    industry: string,
    objectives: string[],
    currentSections?: FunnelSection[]
  ): Promise<FunnelSectionLibraryItem[]> {
    try {
      const { data, error } = await supabase
        .from('funnel_section_library')
        .select('*')
        .contains('industry_tags', [industry])
        .overlaps('use_case_tags', objectives)
        .order('conversion_impact_score', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Filter out sections that are already in use
      if (currentSections) {
        const currentTypes = currentSections.map(s => s.section_type);
        return (data || []).filter(section => !currentTypes.includes(section.section_type));
      }

      return data || [];
    } catch (error) {
      console.error('Error getting section recommendations:', error);
      return [];
    }
  }

  // Calculate funnel performance predictions
  static calculatePerformancePredictions(sections: FunnelSection[]): any {
    const predictions = {
      estimatedConversionRate: 0,
      trafficCapacity: 'medium',
      userExperienceScore: 0,
      seoScore: 0,
      mobileScore: 0,
      recommendations: [] as string[]
    };

    // Base conversion rate calculation
    let conversionRate = 0.02; // 2% base rate
    let uxScore = 50;

    sections.forEach(section => {
      switch (section.section_type) {
        case 'hero':
          conversionRate += 0.005;
          uxScore += 10;
          break;
        case 'social_proof':
          conversionRate += 0.015;
          uxScore += 15;
          break;
        case 'problem_solution':
          conversionRate += 0.008;
          uxScore += 8;
          break;
        case 'urgency':
          conversionRate += 0.012;
          uxScore += 5;
          break;
        case 'lead_capture':
          conversionRate += 0.020;
          uxScore += 12;
          break;
      }
    });

    predictions.estimatedConversionRate = Math.min(conversionRate, 0.15); // Cap at 15%
    predictions.userExperienceScore = Math.min(uxScore, 100);
    predictions.seoScore = sections.length > 3 ? 85 : 70;
    predictions.mobileScore = 90; // Assume mobile-optimized

    // Generate recommendations
    if (predictions.estimatedConversionRate < 0.05) {
      predictions.recommendations.push('Aggiungi più elementi di social proof per aumentare la fiducia');
    }
    if (!sections.some(s => s.section_type === 'urgency')) {
      predictions.recommendations.push('Considera di aggiungere elementi di urgenza/scarsità');
    }
    if (sections.length < 4) {
      predictions.recommendations.push('Espandi il funnel con più sezioni per migliorare il nurturing');
    }

    return predictions;
  }
}

export default ModularFunnelService;