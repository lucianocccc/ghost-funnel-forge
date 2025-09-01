export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'hero' | 'discovery' | 'benefits' | 'emotional' | 'conversion' | 'qualification';
  industry: string[];
  brandVoice: string[];
  template: {
    title: string;
    subtitle: string;
    content: string;
    cta: string;
  };
  variables: string[];
  performance: {
    averageConversion: number;
    testCount: number;
    industries: string[];
  };
}

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  // Hero Section Templates
  {
    id: 'hero-problem-solution',
    name: 'Problem-Solution Hero',
    description: 'Identifies a pain point and positions your solution as the perfect fix',
    category: 'hero',
    industry: ['technology', 'saas', 'consulting', 'healthcare'],
    brandVoice: ['professional', 'startup', 'friendly'],
    template: {
      title: 'Stop Struggling with {PROBLEM}',
      subtitle: '{PRODUCT_NAME} Makes {OUTCOME} Simple',
      content: 'Thousands of {AUDIENCE} are already using {PRODUCT_NAME} to {BENEFIT}. Join them and transform your {AREA} in just {TIMEFRAME}.',
      cta: 'Get Started Free'
    },
    variables: ['PROBLEM', 'PRODUCT_NAME', 'OUTCOME', 'AUDIENCE', 'BENEFIT', 'AREA', 'TIMEFRAME'],
    performance: { averageConversion: 0.045, testCount: 1250, industries: ['saas', 'consulting'] }
  },
  
  {
    id: 'hero-transformation',
    name: 'Transformation Hero',
    description: 'Focuses on the transformation and results users will achieve',
    category: 'hero',
    industry: ['fitness', 'education', 'personal-development', 'coaching'],
    brandVoice: ['motivational', 'nike', 'inspiring'],
    template: {
      title: 'Transform Your {AREA} in {TIMEFRAME}',
      subtitle: 'From {CURRENT_STATE} to {DESIRED_STATE}',
      content: 'Our proven {METHOD} has helped {SOCIAL_PROOF} achieve {SPECIFIC_RESULT}. Start your transformation today.',
      cta: 'Start My Journey'
    },
    variables: ['AREA', 'TIMEFRAME', 'CURRENT_STATE', 'DESIRED_STATE', 'METHOD', 'SOCIAL_PROOF', 'SPECIFIC_RESULT'],
    performance: { averageConversion: 0.038, testCount: 890, industries: ['fitness', 'coaching'] }
  },

  // Discovery Templates
  {
    id: 'discovery-pain-amplification',
    name: 'Pain Amplification',
    description: 'Amplifies the pain of the current situation to create urgency',
    category: 'discovery',
    industry: ['business', 'finance', 'legal', 'consulting'],
    brandVoice: ['professional', 'authoritative', 'urgent'],
    template: {
      title: 'How Much is {PROBLEM} Really Costing You?',
      subtitle: 'Most {AUDIENCE} Don\'t Realize the True Impact',
      content: 'Every day you delay addressing {PROBLEM}, you\'re losing {COST_METRIC}. The hidden costs include {HIDDEN_COSTS}. But there\'s a solution.',
      cta: 'Calculate My Losses'
    },
    variables: ['PROBLEM', 'AUDIENCE', 'COST_METRIC', 'HIDDEN_COSTS'],
    performance: { averageConversion: 0.052, testCount: 670, industries: ['business', 'finance'] }
  },

  // Benefits Templates
  {
    id: 'benefits-before-after',
    name: 'Before & After Benefits',
    description: 'Shows the transformation from current state to desired state',
    category: 'benefits',
    industry: ['technology', 'saas', 'productivity', 'business'],
    brandVoice: ['professional', 'results-focused', 'clear'],
    template: {
      title: 'See the Difference {PRODUCT_NAME} Makes',
      subtitle: 'Before vs After: Real Results from Real {AUDIENCE}',
      content: 'Before: {PAIN_POINTS}. After: {BENEFITS}. Our customers typically see {METRIC_IMPROVEMENT} within {TIMEFRAME}.',
      cta: 'See More Results'
    },
    variables: ['PRODUCT_NAME', 'AUDIENCE', 'PAIN_POINTS', 'BENEFITS', 'METRIC_IMPROVEMENT', 'TIMEFRAME'],
    performance: { averageConversion: 0.041, testCount: 1100, industries: ['saas', 'productivity'] }
  },

  // Emotional Templates
  {
    id: 'emotional-fomo',
    name: 'FOMO & Urgency',
    description: 'Creates fear of missing out and urgency to act now',
    category: 'emotional',
    industry: ['ecommerce', 'events', 'limited-offers', 'consulting'],
    brandVoice: ['urgent', 'exclusive', 'compelling'],
    template: {
      title: 'Don\'t Miss This Opportunity',
      subtitle: 'Only {SCARCITY_NUMBER} Spots Available',
      content: 'This exclusive {OFFER} has helped {SOCIAL_PROOF} achieve {RESULT}. But we can only accept {SCARCITY_NUMBER} more {AUDIENCE} this month.',
      cta: 'Secure My Spot'
    },
    variables: ['SCARCITY_NUMBER', 'OFFER', 'SOCIAL_PROOF', 'RESULT', 'AUDIENCE'],
    performance: { averageConversion: 0.067, testCount: 540, industries: ['events', 'consulting'] }
  },

  // Conversion Templates
  {
    id: 'conversion-guarantee',
    name: 'Risk-Free Guarantee',
    description: 'Removes risk and handles objections with guarantees',
    category: 'conversion',
    industry: ['saas', 'services', 'ecommerce', 'coaching'],
    brandVoice: ['trustworthy', 'confident', 'reassuring'],
    template: {
      title: 'Get Results or Get Your Money Back',
      subtitle: '{GUARANTEE_PERIOD} Risk-Free Guarantee',
      content: 'We\'re so confident {PRODUCT_NAME} will {BENEFIT} that we offer a {GUARANTEE_PERIOD} money-back guarantee. No questions asked.',
      cta: 'Try Risk-Free Now'
    },
    variables: ['GUARANTEE_PERIOD', 'PRODUCT_NAME', 'BENEFIT'],
    performance: { averageConversion: 0.059, testCount: 750, industries: ['saas', 'services'] }
  },

  // Qualification Templates
  {
    id: 'qualification-ideal-customer',
    name: 'Ideal Customer Filter',
    description: 'Qualifies prospects by describing the ideal customer profile',
    category: 'qualification',
    industry: ['b2b', 'consulting', 'high-ticket', 'services'],
    brandVoice: ['professional', 'selective', 'expert'],
    template: {
      title: 'Is This You?',
      subtitle: 'We Work Best With {IDEAL_CUSTOMER_TYPE}',
      content: 'Our most successful clients are {CUSTOMER_DESCRIPTION} who {CURRENT_SITUATION} and want to {DESIRED_OUTCOME}. If this sounds like you, let\'s talk.',
      cta: 'Yes, That\'s Me'
    },
    variables: ['IDEAL_CUSTOMER_TYPE', 'CUSTOMER_DESCRIPTION', 'CURRENT_SITUATION', 'DESIRED_OUTCOME'],
    performance: { averageConversion: 0.073, testCount: 420, industries: ['consulting', 'b2b'] }
  }
];

// Helper functions for template management
export const getTemplatesByCategory = (category: ContentTemplate['category']): ContentTemplate[] => {
  return CONTENT_TEMPLATES.filter(template => template.category === category);
};

export const getTemplatesByIndustry = (industry: string): ContentTemplate[] => {
  return CONTENT_TEMPLATES.filter(template => 
    template.industry.includes(industry.toLowerCase())
  );
};

export const getTemplatesByBrandVoice = (brandVoice: string): ContentTemplate[] => {
  return CONTENT_TEMPLATES.filter(template => 
    template.brandVoice.includes(brandVoice.toLowerCase())
  );
};

export const fillTemplate = (
  template: ContentTemplate,
  variables: Record<string, string>
): { title: string; subtitle: string; content: string; cta: string } => {
  const filled = { ...template.template };
  
  // Replace all variables in the template
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key.toUpperCase()}}`;
    filled.title = filled.title.replace(new RegExp(placeholder, 'g'), value);
    filled.subtitle = filled.subtitle.replace(new RegExp(placeholder, 'g'), value);
    filled.content = filled.content.replace(new RegExp(placeholder, 'g'), value);
    filled.cta = filled.cta.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return filled;
};

export const getHighPerformingTemplates = (
  category?: ContentTemplate['category'],
  minConversion: number = 0.04
): ContentTemplate[] => {
  let templates = CONTENT_TEMPLATES.filter(
    template => template.performance.averageConversion >= minConversion
  );
  
  if (category) {
    templates = templates.filter(template => template.category === category);
  }
  
  return templates.sort((a, b) => 
    b.performance.averageConversion - a.performance.averageConversion
  );
};