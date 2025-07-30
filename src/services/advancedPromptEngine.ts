import { CreativeContext, CreativityParameters } from './creativeIntelligenceEngine';

export interface PromptTemplate {
  id: string;
  name: string;
  category: 'creative' | 'analytical' | 'persuasive' | 'visual';
  template: string;
  variables: string[];
  creativityLevel: 'low' | 'medium' | 'high';
  industrySpecific?: string[];
}

export interface ContextualPrompt {
  prompt: string;
  metadata: {
    creativity: number;
    persuasion: number;
    emotion: number;
    complexity: number;
  };
}

class AdvancedPromptEngine {
  private static instance: AdvancedPromptEngine;
  private templates: Map<string, PromptTemplate> = new Map();

  static getInstance(): AdvancedPromptEngine {
    if (!AdvancedPromptEngine.instance) {
      AdvancedPromptEngine.instance = new AdvancedPromptEngine();
      AdvancedPromptEngine.instance.initializeTemplates();
    }
    return AdvancedPromptEngine.instance;
  }

  private initializeTemplates() {
    const baseTemplates: PromptTemplate[] = [
      {
        id: 'creative_headline',
        name: 'Creative Headline Generator',
        category: 'creative',
        template: `Create {count} compelling headlines for a {productType} in the {industry} industry.

Target Audience: {targetAudience}
Brand Personality: {brandPersonality}
Key Benefits: {keyBenefits}
Emotional Triggers: {emotionalTriggers}
Pain Points: {painPoints}

CREATIVITY PARAMETERS:
- Linguistic Innovation: {linguisticCreativity}/100
- Emotional Resonance: {emotionalResonance}/100
- Market Psychology: {marketPsychology}/100

Requirements:
1. Each headline should be 5-12 words
2. Use power words and emotional triggers
3. Create urgency without being pushy
4. Include benefit-driven language
5. Vary the approach: some direct, some metaphorical, some question-based

Apply these creative techniques:
- Analogical thinking (compare to unexpected concepts)
- Paradox integration (combine opposing ideas)
- Sensory enhancement (engage multiple senses)
- Narrative micro-hooks (imply a story)

Output format: Return exactly {count} headlines, numbered 1-{count}.`,
        variables: ['count', 'productType', 'industry', 'targetAudience', 'brandPersonality', 'keyBenefits', 'emotionalTriggers', 'painPoints', 'linguisticCreativity', 'emotionalResonance', 'marketPsychology'],
        creativityLevel: 'high'
      },
      {
        id: 'persuasive_description',
        name: 'Persuasive Product Description',
        category: 'persuasive',
        template: `Write a persuasive product description for {productType} targeting {targetAudience} in {industry}.

Context:
- Brand Personality: {brandPersonality}
- Competitive Position: {competitivePosition}
- Primary Pain Points: {painPoints}
- Core Desires: {desires}
- Key Benefits: {keyBenefits}

PERSUASION PARAMETERS:
- Persuasion Architecture: {persuasionArchitecture}/100
- Emotional Resonance: {emotionalResonance}/100
- Market Psychology: {marketPsychology}/100

Apply these persuasion frameworks:
1. Problem-Agitation-Solution (PAS)
2. Before-After-Bridge (BAB)
3. Social proof integration
4. Scarcity and urgency elements
5. Authority positioning

Creative amplification techniques:
- Use unexpected analogies
- Create sensory-rich descriptions
- Build mini-narratives within benefits
- Layer multiple emotional appeals
- Integrate paradoxical elements for memorability

Structure:
1. Attention-grabbing opening (hook)
2. Problem identification and agitation
3. Solution presentation with benefits
4. Social proof and credibility
5. Clear call-to-action

Length: 150-250 words. Make it conversational yet professional.`,
        variables: ['productType', 'targetAudience', 'industry', 'brandPersonality', 'competitivePosition', 'painPoints', 'desires', 'keyBenefits', 'persuasionArchitecture', 'emotionalResonance', 'marketPsychology'],
        creativityLevel: 'medium'
      },
      {
        id: 'visual_storytelling',
        name: 'Visual Storytelling Prompts',
        category: 'visual',
        template: `Create visual storytelling prompts for {productType} marketing materials.

Context:
- Industry: {industry}
- Target Audience: {targetAudience}
- Brand Personality: {brandPersonality}
- Key Message: {keyBenefits}

VISUAL CREATIVITY PARAMETERS:
- Visual Storytelling: {visualStorytelling}/100
- Emotional Resonance: {emotionalResonance}/100
- Linguistic Creativity: {linguisticCreativity}/100

Generate 5 distinct visual concepts that tell a story:

1. **Hero's Journey Concept**: Show transformation/success
2. **Day-in-the-Life**: Authentic usage scenarios
3. **Before/After Drama**: Problem/solution visualization
4. **Metaphorical Representation**: Abstract concept visualization
5. **Emotional Moment**: Peak emotional experience

For each concept, provide:
- Scene description (what we see)
- Mood and atmosphere
- Color palette suggestions
- Key visual elements
- Emotional story being told
- Text overlay opportunities

Style influences to consider:
- Cinematic composition (rule of thirds, leading lines)
- Emotional color psychology
- Dynamic lighting for mood
- Authentic human moments
- Brand-appropriate aesthetics

Make each prompt detailed enough for AI image generation.`,
        variables: ['productType', 'industry', 'targetAudience', 'brandPersonality', 'keyBenefits', 'visualStorytelling', 'emotionalResonance', 'linguisticCreativity'],
        creativityLevel: 'high'
      },
      {
        id: 'funnel_sequence',
        name: 'Complete Funnel Sequence',
        category: 'persuasive',
        template: `Design a complete funnel sequence for {productType} in {industry}.

CONTEXT:
- Target Audience: {targetAudience}
- Brand Personality: {brandPersonality}
- Competitive Position: {competitivePosition}
- Pain Points: {painPoints}
- Desires: {desires}
- Key Benefits: {keyBenefits}

CREATIVITY & PERSUASION SETTINGS:
- Linguistic Creativity: {linguisticCreativity}/100
- Emotional Resonance: {emotionalResonance}/100
- Market Psychology: {marketPsychology}/100
- Visual Storytelling: {visualStorytelling}/100
- Persuasion Architecture: {persuasionArchitecture}/100

Create a cohesive funnel with these steps:

**STEP 1: AWARENESS (Hook)**
- Attention-grabbing headline
- Problem identification
- Curiosity gap creation
- Initial emotional connection

**STEP 2: INTEREST (Engagement)**
- Story development
- Benefit elaboration
- Social proof introduction
- Value demonstration

**STEP 3: DESIRE (Amplification)**
- Emotional intensification
- Urgency creation
- Exclusive positioning
- Risk reversal

**STEP 4: ACTION (Conversion)**
- Clear call-to-action
- Final objection handling
- Commitment reinforcement
- Next steps clarity

Creative techniques to apply:
- Narrative threading throughout steps
- Emotional escalation arc
- Sensory language integration
- Metaphorical consistency
- Psychological triggers alignment

Ensure each step flows naturally to the next while building momentum.`,
        variables: ['productType', 'industry', 'targetAudience', 'brandPersonality', 'competitivePosition', 'painPoints', 'desires', 'keyBenefits', 'linguisticCreativity', 'emotionalResonance', 'marketPsychology', 'visualStorytelling', 'persuasionArchitecture'],
        creativityLevel: 'high',
        industrySpecific: ['all']
      }
    ];

    baseTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  generateContextualPrompt(
    templateId: string,
    context: CreativeContext,
    parameters: CreativityParameters,
    additionalVariables?: Record<string, any>
  ): ContextualPrompt {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Merge all variables
    const variables = {
      ...context,
      ...parameters,
      ...additionalVariables,
      count: additionalVariables?.count || 5
    };

    // Replace template variables
    let prompt = template.template;
    template.variables.forEach(variable => {
      const value = variables[variable] || `[${variable}]`;
      const regex = new RegExp(`{${variable}}`, 'g');
      prompt = prompt.replace(regex, String(value));
    });

    // Calculate metadata scores
    const metadata = {
      creativity: this.calculateCreativityScore(template, parameters),
      persuasion: parameters.persuasionArchitecture,
      emotion: parameters.emotionalResonance,
      complexity: this.calculateComplexityScore(template, context)
    };

    return { prompt, metadata };
  }

  private calculateCreativityScore(template: PromptTemplate, parameters: CreativityParameters): number {
    const baseScore = template.creativityLevel === 'high' ? 80 : 
                     template.creativityLevel === 'medium' ? 60 : 40;
    
    const parameterBoost = (parameters.linguisticCreativity + parameters.visualStorytelling) / 2;
    
    return Math.min(100, baseScore + (parameterBoost - 50) / 2);
  }

  private calculateComplexityScore(template: PromptTemplate, context: CreativeContext): number {
    let complexity = 50; // Base complexity
    
    // Industry complexity
    const complexIndustries = ['healthcare', 'finance', 'technology', 'legal'];
    if (complexIndustries.includes(context.industry.toLowerCase())) {
      complexity += 20;
    }
    
    // Template complexity
    if (template.category === 'persuasive') complexity += 15;
    if (template.id === 'funnel_sequence') complexity += 25;
    
    // Context richness
    if (context.emotionalTriggers.length > 3) complexity += 10;
    if (context.painPoints.length > 2) complexity += 10;
    
    return Math.min(100, complexity);
  }

  adaptPromptForIndustry(prompt: string, industry: string): string {
    const industryAdaptations: Record<string, Record<string, string>> = {
      healthcare: {
        'customers': 'patients',
        'buy': 'choose',
        'product': 'solution',
        'price': 'investment in health'
      },
      finance: {
        'customers': 'clients',
        'product': 'financial solution',
        'benefit': 'financial advantage',
        'trust': 'fiduciary confidence'
      },
      technology: {
        'traditional': 'legacy',
        'simple': 'intuitive',
        'advanced': 'cutting-edge',
        'benefit': 'competitive advantage'
      }
    };

    const adaptations = industryAdaptations[industry.toLowerCase()];
    if (!adaptations) return prompt;

    let adaptedPrompt = prompt;
    Object.entries(adaptations).forEach(([from, to]) => {
      const regex = new RegExp(`\\b${from}\\b`, 'gi');
      adaptedPrompt = adaptedPrompt.replace(regex, to);
    });

    return adaptedPrompt;
  }

  createEmotionalVariation(basePrompt: string, emotionalTone: 'excitement' | 'urgency' | 'trust' | 'aspiration'): string {
    const emotionalFrameworks = {
      excitement: {
        prefix: 'Get ready to discover something amazing! ',
        modifiers: ['exciting', 'incredible', 'breakthrough', 'revolutionary'],
        punctuation: '!'
      },
      urgency: {
        prefix: 'Time is running out! ',
        modifiers: ['immediately', 'now', 'limited time', 'don\'t miss'],
        punctuation: '!'
      },
      trust: {
        prefix: 'You can rely on this: ',
        modifiers: ['proven', 'trusted', 'reliable', 'guaranteed'],
        punctuation: '.'
      },
      aspiration: {
        prefix: 'Imagine your ideal future: ',
        modifiers: ['achieve', 'transform', 'elevate', 'unlock'],
        punctuation: '.'
      }
    };

    const framework = emotionalFrameworks[emotionalTone];
    let emotionalPrompt = framework.prefix + basePrompt;

    // Add emotional modifiers
    framework.modifiers.forEach(modifier => {
      if (Math.random() > 0.7) { // 30% chance to add each modifier
        emotionalPrompt = emotionalPrompt.replace(/\b(good|great|nice)\b/gi, modifier);
      }
    });

    return emotionalPrompt;
  }

  getAvailableTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: PromptTemplate['category']): PromptTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }
}

export default AdvancedPromptEngine;