import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractiveFunnelStep } from '@/types/interactiveFunnel';
import { useAIContentPopulator } from '@/hooks/useAIContentPopulator';
import { HyperFluidTextRenderer } from './HyperFluidTextRenderer';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface AIContentManagerProps {
  step: InteractiveFunnelStep;
  isActive: boolean;
  onContentUpdate: (updatedStep: InteractiveFunnelStep) => void;
  productContext?: {
    productName: string;
    industry?: string;
    audience?: string;
    benefits?: string[];
    brandVoice?: 'apple' | 'nike' | 'amazon' | 'luxury' | 'friendly' | 'professional' | 'startup';
  };
}

export const AIContentManager: React.FC<AIContentManagerProps> = ({
  step,
  isActive,
  onContentUpdate,
  productContext
}) => {
  const {
    isGenerating,
    generateSectionContent,
    refreshUnderperformingContent
  } = useAIContentPopulator();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentContent, setCurrentContent] = useState({
    title: step.title || '',
    subtitle: step.description || '',
    content: step.settings?.content?.description || '',
    cta: step.settings?.content?.cta || 'Continue'
  });

  // Auto-generate content if step doesn't have AI-generated content
  useEffect(() => {
    if (isActive && !step.settings?.ai_generated && productContext?.productName) {
      handleGenerateContent();
    }
  }, [isActive, step.settings?.ai_generated, productContext?.productName]);

  const handleGenerateContent = async () => {
    if (!productContext?.productName) {
      toast.error('Product context required for content generation');
      return;
    }

    try {
      const sectionTypeMap: Record<string, any> = {
        'lead_capture': 'hero',
        'discovery': 'discovery',
        'qualification': 'qualification',
        'conversion': 'conversion',
        'thank_you': 'emotional',
        'form': 'benefits'
      };

      const sectionType = sectionTypeMap[step.step_type] || 'benefits';

      const generatedContent = await generateSectionContent({
        sectionType,
        productName: productContext.productName,
        industry: productContext.industry || 'technology',
        audience: productContext.audience || 'professionals',
        benefits: productContext.benefits || [],
        brandVoice: productContext.brandVoice || 'professional'
      });

      setCurrentContent({
        title: generatedContent.title,
        subtitle: generatedContent.subtitle,
        content: generatedContent.content,
        cta: generatedContent.cta
      });

      // Update the step with new content
      const updatedStep: InteractiveFunnelStep = {
        ...step,
        title: generatedContent.title,
        description: generatedContent.subtitle,
        settings: {
          ...step.settings,
          ai_generated: true,
          content: {
            headline: generatedContent.title,
            subheadline: generatedContent.subtitle,
            description: generatedContent.content,
            cta: generatedContent.cta
          },
          generation_metadata: generatedContent.metadata
        }
      };

      onContentUpdate(updatedStep);
      toast.success('Content generated successfully!');

    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    }
  };

  const handleRefreshContent = async () => {
    if (!productContext?.productName) {
      toast.error('Product context required for content refresh');
      return;
    }

    setIsRefreshing(true);
    try {
      const refreshedStep = await refreshUnderperformingContent(step, {
        productName: productContext.productName,
        industry: productContext.industry || 'technology',
        audience: productContext.audience || 'professionals',
        benefits: productContext.benefits || [],
        brandVoice: productContext.brandVoice || 'professional'
      });

      setCurrentContent({
        title: refreshedStep.title || '',
        subtitle: refreshedStep.description || '',
        content: refreshedStep.settings?.content?.description || '',
        cta: refreshedStep.settings?.content?.cta || 'Continue'
      });

      onContentUpdate(refreshedStep);
      toast.success('Content refreshed with new variations!');

    } catch (error) {
      console.error('Error refreshing content:', error);
      toast.error('Failed to refresh content');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="relative w-full">
      {/* AI Content Controls */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-4 right-4 z-20 flex gap-2"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateContent}
            disabled={isGenerating}
            className="bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary/40"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate
          </Button>

          {step.settings?.ai_generated && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshContent}
              disabled={isRefreshing}
              className="bg-background/80 backdrop-blur-sm border-secondary/20 hover:border-secondary/40"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </Button>
          )}
        </motion.div>
      )}

      {/* Content Display */}
      <div className="space-y-6">
        {/* Title */}
        <div className="relative">
          <HyperFluidTextRenderer
            text={currentContent.title}
            visibility={isActive ? 1 : 0.3}
            morphProgress={0}
            anticipationLevel={isActive ? 0.8 : 0.2}
            motionBlur={0}
            className="text-4xl md:text-6xl font-bold tracking-tight text-foreground"
            type="title"
          />
          
          {step.settings?.ai_generated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-2 -right-2"
            >
              <div className="bg-gradient-to-r from-primary to-secondary p-1 rounded-full">
                <Zap className="w-3 h-3 text-primary-foreground" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Subtitle */}
        {currentContent.subtitle && (
          <HyperFluidTextRenderer
            text={currentContent.subtitle}
            visibility={isActive ? 0.9 : 0.3}
            morphProgress={0}
            anticipationLevel={isActive ? 0.6 : 0.1}
            motionBlur={0}
            className="text-xl md:text-2xl text-muted-foreground opacity-80 max-w-2xl"
            type="description"
          />
        )}

        {/* Main Content */}
        {currentContent.content && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentContent.content}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isActive ? 1 : 0.7, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-lg text-foreground/70 max-w-3xl leading-relaxed"
            >
              {currentContent.content}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Generation Status */}
        <AnimatePresence>
          {(isGenerating || isRefreshing) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20"
            >
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-medium text-foreground">
                {isGenerating ? 'Generating AI content...' : 'Refreshing content...'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};