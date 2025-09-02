import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NeuroCopywritingRequest {
  sectionType: 'hero' | 'discovery' | 'benefits' | 'emotional' | 'conversion' | 'qualification';
  productName: string;
  industry?: string;
  buyerPersona?: 'ceo_executive' | 'manager_director' | 'entrepreneur_founder' | 'small_business_owner' | 'professional_specialist';
  primaryPain?: string;
  transformation?: string;
  benefits?: string[];
  socialProof?: string;
  scarcityElement?: string;
  urgencyReason?: string;
  priceAnchor?: string;
  guarantee?: string;
  objections?: string[];
  customContext?: Record<string, any>;
}

export interface NeuroCopywritingResponse {
  title: string;
  subtitle: string;
  content: string;
  cta: string;
  socialProof?: string;
  objectionHandling?: string;
  metadata: {
    sectionType: string;
    productName: string;
    industry: string;
    buyerPersona: string;
    psychologyProfile: string;
    generatedAt: string;
    model: string;
    conversionOptimized: boolean;
    neuroCopywriting: boolean;
  };
}

export interface CopyVariant {
  id: string;
  content: NeuroCopywritingResponse;
  performanceScore: number;
  testResults?: {
    impressions: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
  };
}

export function useNeuroCopywritingEngine() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyVariants, setCopyVariants] = useState<CopyVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<CopyVariant | null>(null);

  const generateNeuroCopy = async (request: NeuroCopywritingRequest): Promise<NeuroCopywritingResponse | null> => {
    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('neuro-copywriting-engine', {
        body: {
          ...request,
          userId: user?.id
        }
      });

      if (error) {
        console.error('Neuro-copywriting generation error:', error);
        toast.error('Failed to generate conversion-optimized copy');
        return null;
      }

      toast.success('Conversion-killer copy generated successfully!');
      return data;
    } catch (error) {
      console.error('Error generating neuro-copywriting:', error);
      toast.error('An error occurred while generating copy');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMultipleVariants = async (
    request: NeuroCopywritingRequest, 
    variantCount: number = 3
  ): Promise<CopyVariant[]> => {
    setIsGenerating(true);
    const variants: CopyVariant[] = [];
    
    try {
      // Generate multiple variants with slight variations
      const promises = Array.from({ length: variantCount }, async (_, index) => {
        const variantRequest = {
          ...request,
          customContext: {
            ...request.customContext,
            variantId: index + 1,
            // Add slight variations to prompt for different approaches
            approach: index === 0 ? 'direct' : index === 1 ? 'emotional' : 'logical'
          }
        };
        
        const result = await generateNeuroCopy(variantRequest);
        if (result) {
          return {
            id: `variant-${index + 1}`,
            content: result,
            performanceScore: Math.random() * 100 // Simulated score for now
          };
        }
        return null;
      });

      const results = await Promise.all(promises);
      const validVariants = results.filter((variant): variant is CopyVariant => variant !== null);
      
      setCopyVariants(validVariants);
      if (validVariants.length > 0) {
        setSelectedVariant(validVariants[0]);
      }
      
      toast.success(`Generated ${validVariants.length} conversion-optimized variants!`);
      return validVariants;
    } catch (error) {
      console.error('Error generating multiple variants:', error);
      toast.error('Failed to generate copy variants');
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  const optimizeExistingCopy = async (
    existingCopy: string,
    request: Partial<NeuroCopywritingRequest>
  ): Promise<NeuroCopywritingResponse | null> => {
    if (!request.sectionType || !request.productName) {
      toast.error('Section type and product name are required for optimization');
      return null;
    }

    return generateNeuroCopy({
      sectionType: request.sectionType,
      productName: request.productName,
      industry: request.industry || 'technology',
      buyerPersona: request.buyerPersona || 'professional_specialist',
      customContext: {
        ...request.customContext,
        existingCopy,
        optimizationMode: true
      }
    });
  };

  const selectBestPerformingVariant = (): CopyVariant | null => {
    if (copyVariants.length === 0) return null;
    
    const bestVariant = copyVariants.reduce((best, current) => {
      const bestScore = best.performanceScore || 0;
      const currentScore = current.performanceScore || 0;
      return currentScore > bestScore ? current : best;
    });
    
    setSelectedVariant(bestVariant);
    return bestVariant;
  };

  const clearVariants = () => {
    setCopyVariants([]);
    setSelectedVariant(null);
  };

  return {
    isGenerating,
    copyVariants,
    selectedVariant,
    generateNeuroCopy,
    generateMultipleVariants,
    optimizeExistingCopy,
    selectBestPerformingVariant,
    setSelectedVariant,
    clearVariants
  };
}