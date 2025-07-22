
import { supabase } from '@/integrations/supabase/client';
import { FunnelType } from '@/services/funnelTypesService';

export interface FunnelGenerationOptions {
  prompt: string;
  userId: string;
  funnelType?: FunnelType;
  saveToLibrary?: boolean;
  timeout?: number;
  retries?: number;
}

export interface GeneratedFunnel {
  id: string;
  name: string;
  description: string;
  share_token: string;
  steps: any[];
  settings: any;
  funnel_type?: FunnelType;
  advanced_funnel_data?: any;
}

class FunnelGenerationService {
  private static instance: FunnelGenerationService;
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly DEFAULT_RETRIES = 2;

  static getInstance(): FunnelGenerationService {
    if (!FunnelGenerationService.instance) {
      FunnelGenerationService.instance = new FunnelGenerationService();
    }
    return FunnelGenerationService.instance;
  }

  async generateFunnel(options: FunnelGenerationOptions): Promise<GeneratedFunnel | null> {
    const {
      prompt,
      userId,
      funnelType,
      saveToLibrary = true,
      timeout = this.DEFAULT_TIMEOUT,
      retries = this.DEFAULT_RETRIES
    } = options;

    console.log('🚀 FunnelGenerationService.generateFunnel:', {
      promptLength: prompt.length,
      userId,
      funnelType: funnelType?.name || 'custom',
      saveToLibrary,
      timeout,
      retries
    });

    if (!prompt.trim()) {
      throw new Error('Prompt è obbligatorio');
    }

    if (!userId) {
      throw new Error('UserId è obbligatorio');
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt + 1}/${retries + 1} for funnel generation`);
        
        const result = await this.generateWithTimeout({
          prompt: prompt.trim(),
          userId,
          funnelTypeId: funnelType?.id || null,
          saveToLibrary
        }, timeout);

        if (result) {
          console.log('✅ Funnel generation successful on attempt', attempt + 1);
          return result;
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Errore sconosciuto');
        console.warn(`⚠️ Attempt ${attempt + 1} failed:`, lastError.message);
        
        // Don't retry on authentication errors
        if (lastError.message.includes('authentication') || lastError.message.includes('unauthorized')) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error('💥 All generation attempts failed');
    throw lastError || new Error('Generazione fallita dopo tutti i tentativi');
  }

  private async generateWithTimeout(
    payload: any,
    timeoutMs: number
  ): Promise<GeneratedFunnel | null> {
    return new Promise(async (resolve, reject) => {
      // Set up timeout
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout: la generazione ha superato ${timeoutMs / 1000} secondi`));
      }, timeoutMs);

      try {
        console.log('📡 Calling Supabase function with payload:', {
          ...payload,
          prompt: payload.prompt.substring(0, 50) + '...'
        });

        const { data, error } = await supabase.functions.invoke('generate-interactive-funnel-ai', {
          body: payload
        });

        clearTimeout(timeoutId);

        if (error) {
          console.error('❌ Supabase function error:', error);
          reject(new Error(error.message || 'Errore nella chiamata alla funzione'));
          return;
        }

        if (!data) {
          console.error('❌ No data received');
          reject(new Error('Nessuna risposta dal server'));
          return;
        }

        if (!data.success) {
          console.error('❌ Function returned error:', data.error);
          reject(new Error(data.error || 'Errore nella generazione'));
          return;
        }

        if (!data.funnel) {
          console.error('❌ No funnel in response');
          reject(new Error('Dati del funnel mancanti'));
          return;
        }

        console.log('✅ Received valid funnel data:', {
          id: data.funnel.id,
          name: data.funnel.name,
          stepsCount: data.funnel.steps?.length || 0
        });

        resolve(data.funnel);

      } catch (error) {
        clearTimeout(timeoutId);
        console.error('💥 Generation error:', error);
        reject(error instanceof Error ? error : new Error('Errore sconosciuto'));
      }
    });
  }

  // Legacy method for backward compatibility
  async generateLegacyFunnel(prompt: string, userId: string): Promise<GeneratedFunnel | null> {
    console.log('🔄 Using legacy generation method');
    return this.generateFunnel({
      prompt,
      userId,
      saveToLibrary: true,
      retries: 1 // Less retries for legacy
    });
  }
}

export const funnelGenerationService = FunnelGenerationService.getInstance();
