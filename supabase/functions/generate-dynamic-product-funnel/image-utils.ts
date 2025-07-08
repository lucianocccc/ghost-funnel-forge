// Image utilities for dynamic product funnel generation

import { CinematicScene } from './types.ts';
import { withTimeout } from './utils.ts';

// Generate fallback SVG image URL for a scene type
export function generateFallbackImageUrl(sceneType: string): string {
  // Create fallback colors based on scene type
  const colorMap = {
    hero: { start: '#667eea', end: '#764ba2' },
    benefit: { start: '#f093fb', end: '#f5576c' },
    proof: { start: '#4facfe', end: '#00f2fe' },
    demo: { start: '#43e97b', end: '#38f9d7' },
    conversion: { start: '#fa709a', end: '#fee140' }
  };
  
  const colors = colorMap[sceneType] || colorMap.hero;
  console.log(`📐 Generating fallback for scene type: ${sceneType}, colors:`, colors);
  
  // Use URL encoding for safe SVG embedding (Deno-compatible)
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1792" height="1024" viewBox="0 0 1792 1024">
    <defs>
      <linearGradient id="grad_${sceneType}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.start};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors.end};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad_${sceneType})"/>
  </svg>`;
  
  try {
    // Use URL encoding instead of base64 for better Deno compatibility
    const encodedSvg = encodeURIComponent(svgContent);
    console.log(`✅ Generated fallback SVG for ${sceneType}`);
    return `data:image/svg+xml;utf8,${encodedSvg}`;
  } catch (error) {
    console.error(`❌ Error generating fallback SVG for ${sceneType}:`, error);
    // Return a simple solid color fallback
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1792" height="1024"><rect width="100%" height="100%" fill="${colors.start}"/></svg>`;
  }
}

// Optimized image generation with concurrency control and timeout handling
export async function generateSceneImagesOptimized(
  scenes: CinematicScene[], 
  generateImages: boolean, 
  openAIApiKey: string,
  remainingTime: number
): Promise<CinematicScene[]> {
  if (!generateImages || !openAIApiKey) {
    return scenes;
  }

  const maxConcurrentImages = 2; // Limit concurrent requests
  const timePerImage = Math.floor(remainingTime / scenes.length * 0.8); // Reserve 20% buffer
  
  console.log(`🖼️ Starting optimized image generation for ${scenes.length} scenes`);
  console.log(`⏱️ Time per image: ${timePerImage}ms, Concurrent: ${maxConcurrentImages}`);
  
  const scenesWithImages = [];
  
  // Process images in batches to control concurrency
  for (let i = 0; i < scenes.length; i += maxConcurrentImages) {
    const batch = scenes.slice(i, i + maxConcurrentImages);
    
    const batchPromises = batch.map(async (scene, batchIndex) => {
      const globalIndex = i + batchIndex;
      console.log(`🎨 Processing scene ${globalIndex + 1}/${scenes.length}: ${scene.type}`);
      
      try {
        const imageResponse = await withTimeout(
          fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'dall-e-3',
              prompt: scene.imagePrompt,
              n: 1,
              size: '1792x1024', // Wide cinematic format
              quality: 'hd',
            }),
          }),
          timePerImage,
          `Image generation timeout for scene ${globalIndex + 1}`
        );

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          scene.imageUrl = imageData.data[0].url;
          console.log(`✅ Image generated for scene ${globalIndex + 1}`);
        } else {
          const errorText = await imageResponse.text();
          console.warn(`⚠️ Image generation failed for scene ${globalIndex + 1}:`, errorText);
        }
      } catch (error) {
        console.warn(`⚠️ Image generation error for scene ${globalIndex + 1}:`, error.message);
        // Continue without image - scene will work without it
      }
      
      return scene;
    });
    
    const batchResults = await Promise.all(batchPromises);
    scenesWithImages.push(...batchResults);
  }
  
  const generatedCount = scenesWithImages.filter(s => s.imageUrl).length;
  console.log(`🎬 Image generation completed: ${generatedCount}/${scenes.length} images generated`);
  
  return scenesWithImages;
}

// Legacy function for backward compatibility
export async function generateSceneImages(
  scenes: CinematicScene[], 
  generateImages: boolean, 
  openAIApiKey?: string
): Promise<CinematicScene[]> {
  if (!generateImages || !openAIApiKey) {
    return scenes;
  }

  return generateSceneImagesOptimized(scenes, generateImages, openAIApiKey, 30000);
}