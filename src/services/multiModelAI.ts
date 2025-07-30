export interface AIModelConfig {
  modelType: 'claude-opus-4' | 'claude-sonnet-4' | 'gpt-4.1' | 'perplexity' | 'runware';
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  priority?: number;
}

export interface TaskSpecificConfig {
  task: 'market_research' | 'copywriting' | 'coordination' | 'optimization' | 'visual';
  primaryModel: AIModelConfig;
  fallbackModels?: AIModelConfig[];
  synthesisStrategy: 'best' | 'merge' | 'consensus' | 'weighted';
}

export interface AIRequest {
  prompt: string;
  context?: Record<string, any>;
  modelConfig: AIModelConfig;
}

export interface AIResponse {
  content: string;
  model: string;
  confidence: number;
  metadata?: Record<string, any>;
  fromCache?: boolean;
  executionTime?: number;
  cost?: number;
}

class MultiModelAIService {
  private static instance: MultiModelAIService;
  private cache: Map<string, { response: AIResponse; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  static getInstance(): MultiModelAIService {
    if (!MultiModelAIService.instance) {
      MultiModelAIService.instance = new MultiModelAIService();
    }
    return MultiModelAIService.instance;
  }

  private getCacheKey(request: AIRequest): string {
    return `${request.modelConfig.modelType}-${JSON.stringify(request.prompt)}-${JSON.stringify(request.context)}`;
  }

  private getFromCache(key: string): AIResponse | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return { ...cached.response, fromCache: true };
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache(key: string, response: AIResponse): void {
    this.cache.set(key, { response, timestamp: Date.now() });
  }

  async generateWithClaude(request: AIRequest): Promise<AIResponse> {
    const cacheKey = this.getCacheKey(request);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const startTime = Date.now();
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': await this.getSecret('ANTHROPIC_API_KEY'),
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: request.modelConfig.modelType === 'claude-opus-4' ? 'claude-3-opus-20240229' : 'claude-3-5-sonnet-20241022',
          max_tokens: request.modelConfig.maxTokens,
          temperature: request.modelConfig.temperature,
          system: request.modelConfig.systemPrompt,
          messages: [{ role: 'user', content: request.prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result: AIResponse = {
        content: data.content[0].text,
        model: request.modelConfig.modelType,
        confidence: 0.9,
        executionTime: Date.now() - startTime,
        metadata: { usage: data.usage }
      };
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Claude API error:', error);
      throw error;
    }
  }

  async generateWithGPT(request: AIRequest): Promise<AIResponse> {
    const cacheKey = this.getCacheKey(request);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const startTime = Date.now();
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getSecret('OPENAI_API_KEY')}`
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            { role: 'system', content: request.modelConfig.systemPrompt || 'You are a creative AI assistant.' },
            { role: 'user', content: request.prompt }
          ],
          temperature: request.modelConfig.temperature,
          max_tokens: request.modelConfig.maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result: AIResponse = {
        content: data.choices[0].message.content,
        model: request.modelConfig.modelType,
        confidence: 0.85,
        executionTime: Date.now() - startTime,
        metadata: { usage: data.usage }
      };
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async generateWithPerplexity(request: AIRequest): Promise<AIResponse> {
    const cacheKey = this.getCacheKey(request);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const startTime = Date.now();
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getSecret('PERPLEXITY_API_KEY')}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            { role: 'system', content: request.modelConfig.systemPrompt || 'You are a market research and trend analysis expert.' },
            { role: 'user', content: request.prompt }
          ],
          temperature: request.modelConfig.temperature,
          max_tokens: request.modelConfig.maxTokens,
          return_related_questions: false
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result: AIResponse = {
        content: data.choices[0].message.content,
        model: request.modelConfig.modelType,
        confidence: 0.8,
        executionTime: Date.now() - startTime,
        metadata: { usage: data.usage }
      };
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Perplexity API error:', error);
      throw error;
    }
  }

  async generateMultiModel(requests: AIRequest[]): Promise<AIResponse[]> {
    const promises = requests.map(request => {
      switch (request.modelConfig.modelType) {
        case 'claude-opus-4':
        case 'claude-sonnet-4':
          return this.generateWithClaude(request);
        case 'gpt-4.1':
          return this.generateWithGPT(request);
        case 'perplexity':
          return this.generateWithPerplexity(request);
        default:
          throw new Error(`Unsupported model: ${request.modelConfig.modelType}`);
      }
    });

    return Promise.all(promises);
  }

  async synthesizeResponses(responses: AIResponse[], synthesisStrategy: 'best' | 'merge' | 'consensus'): Promise<AIResponse> {
    switch (synthesisStrategy) {
      case 'best':
        return responses.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        );
      
      case 'merge':
        return {
          content: responses.map(r => r.content).join('\n\n'),
          model: 'multi-model-merge',
          confidence: responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length,
          metadata: { sources: responses.map(r => r.model) }
        };
      
      case 'consensus':
        // Simplified consensus - in practice, this would use more sophisticated NLP
        const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
        return {
          content: this.extractConsensusContent(responses),
          model: 'multi-model-consensus',
          confidence: avgConfidence,
          metadata: { sources: responses.map(r => r.model) }
        };
      
      default:
        return responses[0];
    }
  }

  private extractConsensusContent(responses: AIResponse[]): string {
    // Simplified consensus extraction - would use more sophisticated analysis in production
    const commonThemes = this.findCommonThemes(responses.map(r => r.content));
    return commonThemes.join('\n\n');
  }

  private findCommonThemes(contents: string[]): string[] {
    // Simplified theme extraction - would use NLP libraries in production
    const sentences = contents.flatMap(content => 
      content.split('.').map(s => s.trim()).filter(s => s.length > 10)
    );
    
    // Return first few sentences as simplified consensus
    return sentences.slice(0, 3);
  }

  private async getSecret(secretName: string): Promise<string> {
    // In a real implementation, this would fetch from Supabase secrets
    // For now, we'll assume environment variables are available
    const secret = import.meta.env[`VITE_${secretName}`];
    if (!secret) {
      throw new Error(`Secret ${secretName} not found`);
    }
    return secret;
  }

  // New specialized methods for Ghost Funnel
  async generateMarketResearch(request: AIRequest): Promise<AIResponse> {
    const enhancedRequest = {
      ...request,
      modelConfig: {
        ...this.getOptimalModelForTask('research'),
        systemPrompt: 'You are a market research expert with access to real-time data and trends. Provide comprehensive market analysis including competitive landscape, consumer behavior, and market opportunities.'
      }
    };
    return this.generateWithPerplexity(enhancedRequest);
  }

  async generatePersuasiveCopy(request: AIRequest): Promise<AIResponse> {
    const enhancedRequest = {
      ...request,
      modelConfig: {
        ...this.getOptimalModelForTask('creative'),
        systemPrompt: 'You are a master copywriter and storyteller. Create compelling, persuasive content that resonates emotionally with the target audience while driving conversions.'
      }
    };
    return this.generateWithClaude(enhancedRequest);
  }

  async coordinateAndSynthesize(request: AIRequest): Promise<AIResponse> {
    const enhancedRequest = {
      ...request,
      modelConfig: {
        ...this.getOptimalModelForTask('analytical'),
        systemPrompt: 'You are an AI orchestrator responsible for coordinating and synthesizing insights from multiple AI models. Create cohesive, comprehensive strategies.'
      }
    };
    return this.generateWithGPT(enhancedRequest);
  }

  async executeMultiModelWorkflow(
    tasks: { type: 'market_research' | 'copywriting' | 'coordination'; prompt: string; context?: any }[]
  ): Promise<{ [key: string]: AIResponse }> {
    const results: { [key: string]: AIResponse } = {};
    
    for (const task of tasks) {
      switch (task.type) {
        case 'market_research':
          results[task.type] = await this.generateMarketResearch({
            prompt: task.prompt,
            context: task.context,
            modelConfig: this.getOptimalModelForTask('research')
          });
          break;
        case 'copywriting':
          results[task.type] = await this.generatePersuasiveCopy({
            prompt: task.prompt,
            context: task.context,
            modelConfig: this.getOptimalModelForTask('creative')
          });
          break;
        case 'coordination':
          results[task.type] = await this.coordinateAndSynthesize({
            prompt: task.prompt,
            context: task.context,
            modelConfig: this.getOptimalModelForTask('analytical')
          });
          break;
      }
    }
    
    return results;
  }

  // Enhanced synthesis with weighted strategies
  async synthesizeWithWeights(
    responses: AIResponse[], 
    weights: number[] = [],
    strategy: 'best' | 'merge' | 'consensus' | 'weighted' = 'weighted'
  ): Promise<AIResponse> {
    if (strategy === 'weighted' && weights.length === responses.length) {
      const weightedConfidence = responses.reduce((sum, response, index) => 
        sum + (response.confidence * weights[index]), 0
      ) / weights.reduce((sum, weight) => sum + weight, 0);
      
      return {
        content: responses.map((r, i) => `[Weight: ${weights[i]}] ${r.content}`).join('\n\n'),
        model: 'multi-model-weighted',
        confidence: weightedConfidence,
        metadata: { 
          sources: responses.map(r => r.model),
          weights,
          strategy 
        }
      };
    }
    
    return this.synthesizeResponses(responses, strategy as 'best' | 'merge' | 'consensus');
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; oldestEntry: number | null } {
    if (this.cache.size === 0) {
      return { size: 0, oldestEntry: null };
    }
    
    const timestamps = Array.from(this.cache.values()).map(entry => entry.timestamp);
    return {
      size: this.cache.size,
      oldestEntry: Math.min(...timestamps)
    };
  }

  getOptimalModelForTask(task: 'creative' | 'analytical' | 'research' | 'visual'): AIModelConfig {
    const configs: Record<string, AIModelConfig> = {
      creative: {
        modelType: 'claude-opus-4',
        temperature: 0.8,
        maxTokens: 2000,
        systemPrompt: 'You are a highly creative AI with expertise in persuasive copywriting and storytelling.'
      },
      analytical: {
        modelType: 'gpt-4.1',
        temperature: 0.3,
        maxTokens: 1500,
        systemPrompt: 'You are an analytical AI expert focused on data-driven insights and logical reasoning.'
      },
      research: {
        modelType: 'perplexity',
        temperature: 0.2,
        maxTokens: 1000,
        systemPrompt: 'You are a market research expert with access to current trends and data.'
      },
      visual: {
        modelType: 'claude-sonnet-4',
        temperature: 0.7,
        maxTokens: 1000,
        systemPrompt: 'You are a visual storytelling expert who creates compelling image descriptions and visual narratives.'
      }
    };

    return configs[task];
  }
}

export default MultiModelAIService;