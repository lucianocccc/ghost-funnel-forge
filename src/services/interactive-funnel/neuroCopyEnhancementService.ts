import { supabase } from '@/integrations/supabase/client';

interface InteractiveFunnelStep {
  id?: string;
  step_type: string;
  step_order: number;
  title: string;
  description: string;
  settings: any;
}

export interface NeuroCopyEnhancementRequest {
  productName: string;
  industry?: string;
  buyerPersona?: 'ceo_executive' | 'manager_director' | 'entrepreneur_founder' | 'small_business_owner' | 'professional_specialist';
  primaryPain?: string;
  transformation?: string;
  socialProof?: string;
  scarcityElement?: string;
  guarantee?: string;
}

export interface EnhancedFunnelStep extends InteractiveFunnelStep {
  neuroCopyMetadata?: {
    buyerPersona: string;
    psychologyProfile: string;
    conversionOptimized: boolean;
    performanceScore: number;
  };
}

/**
 * Enhances funnel steps with conversion-killer neuro-copywriting
 */
export async function enhanceFunnelWithNeuroCopy(
  steps: InteractiveFunnelStep[],
  enhancementRequest: NeuroCopyEnhancementRequest
): Promise<EnhancedFunnelStep[]> {
  const enhancedSteps: EnhancedFunnelStep[] = [];

  for (const step of steps) {
    try {
      // Map step types to neuro-copywriting section types
      const sectionTypeMap: Record<string, string> = {
        'hero': 'hero',
        'landing': 'hero',
        'discovery': 'discovery',
        'benefits': 'benefits',
        'transformation': 'benefits',
        'emotional': 'emotional',
        'urgency': 'emotional',
        'conversion': 'conversion',
        'final_cta': 'conversion',
        'qualification': 'qualification',
        'contact': 'qualification'
      };

      const sectionType = sectionTypeMap[step.step_type] || 'benefits';

      // Generate neuro-copywriting content
      const { data: neuroCopyData, error } = await supabase.functions.invoke('neuro-copywriting-engine', {
        body: {
          sectionType,
          productName: enhancementRequest.productName,
          industry: enhancementRequest.industry || 'technology',
          buyerPersona: enhancementRequest.buyerPersona || 'professional_specialist',
          primaryPain: enhancementRequest.primaryPain,
          transformation: enhancementRequest.transformation,
          socialProof: enhancementRequest.socialProof,
          scarcityElement: enhancementRequest.scarcityElement,
          guarantee: enhancementRequest.guarantee
        }
      });

      if (error) {
        console.error(`Failed to enhance step ${step.step_order}:`, error);
        // Keep original step if enhancement fails
        enhancedSteps.push(step);
        continue;
      }

      // Create enhanced step with neuro-copywriting content
      const enhancedStep: EnhancedFunnelStep = {
        ...step,
        title: neuroCopyData.title,
        description: neuroCopyData.subtitle,
        settings: {
          ...step.settings,
          content: neuroCopyData.content,
          ctaText: neuroCopyData.cta,
          socialProof: neuroCopyData.socialProof,
          objectionHandling: neuroCopyData.objectionHandling
        },
        neuroCopyMetadata: {
          buyerPersona: neuroCopyData.metadata.buyerPersona,
          psychologyProfile: neuroCopyData.metadata.psychologyProfile,
          conversionOptimized: neuroCopyData.metadata.conversionOptimized,
          performanceScore: Math.random() * 100 // Simulated score for now
        }
      };

      enhancedSteps.push(enhancedStep);

      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`Error enhancing step ${step.step_order}:`, error);
      enhancedSteps.push(step);
    }
  }

  return enhancedSteps;
}

/**
 * Optimizes specific sections of an existing funnel with neuro-copywriting
 */
export async function optimizeFunnelSection(
  step: InteractiveFunnelStep,
  enhancementRequest: NeuroCopyEnhancementRequest,
  optimizationFocus: 'conversion' | 'urgency' | 'benefits' | 'qualification'
): Promise<EnhancedFunnelStep> {
  try {
    const sectionType = optimizationFocus === 'conversion' ? 'conversion' :
                       optimizationFocus === 'urgency' ? 'emotional' :
                       optimizationFocus === 'benefits' ? 'benefits' : 'qualification';

    const { data: neuroCopyData, error } = await supabase.functions.invoke('neuro-copywriting-engine', {
      body: {
        sectionType,
        productName: enhancementRequest.productName,
        industry: enhancementRequest.industry || 'technology',
        buyerPersona: enhancementRequest.buyerPersona || 'professional_specialist',
        primaryPain: enhancementRequest.primaryPain,
        transformation: enhancementRequest.transformation,
        socialProof: enhancementRequest.socialProof,
        scarcityElement: enhancementRequest.scarcityElement,
        guarantee: enhancementRequest.guarantee,
        customContext: {
          optimizationFocus,
          existingContent: step.description
        }
      }
    });

    if (error) {
      throw new Error(`Optimization failed: ${error.message}`);
    }

    return {
      ...step,
      title: neuroCopyData.title,
      description: neuroCopyData.subtitle,
      settings: {
        ...step.settings,
        content: neuroCopyData.content,
        ctaText: neuroCopyData.cta,
        socialProof: neuroCopyData.socialProof,
        objectionHandling: neuroCopyData.objectionHandling
      },
      neuroCopyMetadata: {
        buyerPersona: neuroCopyData.metadata.buyerPersona,
        psychologyProfile: neuroCopyData.metadata.psychologyProfile,
        conversionOptimized: true,
        performanceScore: Math.random() * 100
      }
    };

  } catch (error) {
    console.error('Error optimizing funnel section:', error);
    return step;
  }
}

/**
 * A/B tests different neuro-copywriting approaches for a funnel step
 */
export async function generateNeuroCopyVariants(
  step: InteractiveFunnelStep,
  enhancementRequest: NeuroCopyEnhancementRequest,
  variantCount: number = 3
): Promise<EnhancedFunnelStep[]> {
  const variants: EnhancedFunnelStep[] = [];
  const buyerPersonas = ['ceo_executive', 'manager_director', 'entrepreneur_founder'] as const;

  for (let i = 0; i < variantCount; i++) {
    try {
      const persona = buyerPersonas[i % buyerPersonas.length];
      const sectionType = step.step_type === 'hero' ? 'hero' :
                         step.step_type === 'conversion' ? 'conversion' :
                         step.step_type === 'emotional' ? 'emotional' : 'benefits';

      const { data: neuroCopyData, error } = await supabase.functions.invoke('neuro-copywriting-engine', {
        body: {
          sectionType,
          productName: enhancementRequest.productName,
          industry: enhancementRequest.industry,
          buyerPersona: persona,
          primaryPain: enhancementRequest.primaryPain,
          transformation: enhancementRequest.transformation,
          socialProof: enhancementRequest.socialProof,
          scarcityElement: enhancementRequest.scarcityElement,
          guarantee: enhancementRequest.guarantee,
          customContext: {
            variantId: i + 1,
            approach: i === 0 ? 'direct' : i === 1 ? 'emotional' : 'logical'
          }
        }
      });

      if (error) {
        console.error(`Failed to generate variant ${i + 1}:`, error);
        continue;
      }

      const variant: EnhancedFunnelStep = {
        ...step,
        title: neuroCopyData.title,
        description: neuroCopyData.subtitle,
        settings: {
          ...step.settings,
          content: neuroCopyData.content,
          ctaText: neuroCopyData.cta,
          socialProof: neuroCopyData.socialProof,
          objectionHandling: neuroCopyData.objectionHandling
        },
        neuroCopyMetadata: {
          buyerPersona: neuroCopyData.metadata.buyerPersona,
          psychologyProfile: neuroCopyData.metadata.psychologyProfile,
          conversionOptimized: true,
          performanceScore: Math.random() * 100
        }
      };

      variants.push(variant);

    } catch (error) {
      console.error(`Error generating variant ${i + 1}:`, error);
    }
  }

  return variants;
}
