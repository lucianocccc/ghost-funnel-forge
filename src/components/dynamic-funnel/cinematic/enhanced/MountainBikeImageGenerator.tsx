import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MountainBikeImageGeneratorProps {
  sceneType: 'hero' | 'benefit' | 'proof' | 'demo' | 'conversion';
  onImageGenerated: (imageUrl: string) => void;
  productName: string;
}

export const MountainBikeImageGenerator: React.FC<MountainBikeImageGeneratorProps> = ({
  sceneType,
  onImageGenerated,
  productName
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateMountainBikeImage();
  }, [sceneType]);

  const generateMountainBikeImage = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      const mountainBikePrompts = {
        hero: `Epic cinematic shot of ${productName} mountain bike in action on rugged mountain trail, professional mountain biker in full gear riding downhill, dirt and rocks flying from rear wheel, dramatic mountain landscape background, golden hour lighting, ultra-realistic detail, extreme sports photography, 4K professional quality`,
        benefit: `Close-up detail shot of ${productName} mountain bike advanced suspension system and frame, carbon fiber texture, professional product photography, outdoor mountain setting, dramatic lighting highlighting technical features, ultra-realistic detail, commercial photography`,
        proof: `Professional mountain biker testimonial scene with ${productName} bike, rider taking break on mountain summit, bike prominently displayed, authentic outdoor setting, natural lighting, lifestyle photography, ultra-realistic detail`,
        demo: `Dynamic action sequence of ${productName} mountain bike navigating technical terrain, rider demonstrating bike capabilities, mud splashing, leaves flying, forest trail background, motion blur effects, extreme sports cinematography`,
        conversion: `Beautiful ${productName} mountain bike parked on scenic mountain overlook, sunset background, aspirational lifestyle shot, professional product photography, ultra-realistic detail, inspiring outdoor adventure scene`
      };

      const { data, error } = await supabase.functions.invoke('generate-scene-image', {
        body: {
          prompt: mountainBikePrompts[sceneType],
          size: '1920x1080',
          style: 'photographic'
        }
      });

      if (error) {
        console.error('Error generating mountain bike image:', error);
        // Use fallback image
        onImageGenerated(`https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center`);
        return;
      }

      if (data?.imageUrl) {
        onImageGenerated(data.imageUrl);
      } else {
        // Fallback to high-quality mountain bike images
        const fallbackImages = {
          hero: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center',
          benefit: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1920&h=1080&fit=crop&crop=center',
          proof: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1920&h=1080&fit=crop&crop=center',
          demo: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center',
          conversion: 'https://images.unsplash.com/photo-1544191696-15693072648c?w=1920&h=1080&fit=crop&crop=center'
        };
        onImageGenerated(fallbackImages[sceneType]);
      }
    } catch (error) {
      console.error('Error in mountain bike image generation:', error);
      // Always provide a fallback
      onImageGenerated(`https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop&crop=center`);
    } finally {
      setIsGenerating(false);
    }
  };

  return null; // This component only handles logic, no UI
};