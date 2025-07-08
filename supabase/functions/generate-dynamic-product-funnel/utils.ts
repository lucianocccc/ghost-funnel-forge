// Utility functions for the dynamic product funnel generation

import { CinematicScene } from './types.ts';

// Timeout wrapper utility
export async function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms);
  });
  
  return Promise.race([promise, timeout]);
}

// Validate and finalize scenes before returning
export function finalizeScenes(scenes: CinematicScene[]): CinematicScene[] {
  return scenes.map(scene => ({
    ...scene,
    // Ensure all required fields are present
    id: scene.id || `scene_${Date.now()}_${Math.random()}`,
    scrollTrigger: scene.scrollTrigger || { start: 0, end: 1 },
    parallaxLayers: scene.parallaxLayers || []
  }));
}

// Optimize image prompts for faster generation while maintaining quality
export function optimizeImagePrompt(originalPrompt: string): string {
  const optimized = originalPrompt
    .replace('8K ultra high resolution', 'high resolution')
    .replace('ultra-realistic', 'realistic')
    .replace('extremely detailed', 'detailed')
    .replace('professional photography', 'photography')
    .replace('cinematic lighting', 'dramatic lighting');
  
  return optimized.length > 800 ? optimized.substring(0, 800) + '...' : optimized;
}

// Validate OpenAI API key format
export function validateOpenAIApiKey(apiKey: string | undefined): { isValid: boolean; error?: string } {
  if (!apiKey) {
    return { isValid: false, error: 'OpenAI API key is not configured' };
  }

  if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
    return { isValid: false, error: 'Invalid OpenAI API key format' };
  }

  return { isValid: true };
}

// Test OpenAI API connectivity
export async function testOpenAIConnectivity(apiKey: string, requestId?: string): Promise<void> {
  const logPrefix = `[${requestId || 'unknown'}]`;
  
  console.log(`🔍 ${logPrefix} Testing OpenAI API connectivity...`);
  
  const testResponse = await withTimeout(
    fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }),
    3000, // 3 seconds for connectivity test
    'OpenAI API connectivity test timed out'
  );
  
  if (!testResponse.ok) {
    const errorText = await testResponse.text();
    console.error(`❌ ${logPrefix} OpenAI API connectivity test failed:`, errorText);
    throw new Error(`OpenAI API connectivity issue: ${testResponse.status} - ${errorText}`);
  }
  
  console.log(`✅ ${logPrefix} OpenAI API connectivity verified`);
}

// Generate unique request ID for tracking
export function generateRequestId(): string {
  return Math.random().toString(36).substring(7);
}

// Clean OpenAI response from markdown formatting
export function cleanOpenAIResponse(content: string): string {
  let cleanedContent = content.trim();
  
  if (cleanedContent.startsWith('```json')) {
    cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedContent.startsWith('```')) {
    cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  
  return cleanedContent;
}