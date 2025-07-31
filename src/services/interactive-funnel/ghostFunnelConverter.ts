import { GhostFunnelResponse } from '@/hooks/useGhostFunnelOrchestrator';

export interface GhostFunnelStep {
  title: string;
  type: 'hero' | 'advantages' | 'emotional' | 'cta' | 'form';
  order_index: number;
  settings: {
    content: any;
    fields?: any[];
    ai_generated: boolean;
  };
}

export const convertGhostFunnelToSteps = (ghostFunnel: GhostFunnelResponse): GhostFunnelStep[] => {
  const steps: GhostFunnelStep[] = [];

  // Hero Section
  steps.push({
    title: 'Hero Section',
    type: 'hero',
    order_index: 0,
    settings: {
      content: ghostFunnel.hero,
      ai_generated: true
    }
  });

  // Advantages Section
  steps.push({
    title: 'Advantages',
    type: 'advantages',
    order_index: 1,
    settings: {
      content: ghostFunnel.advantages,
      ai_generated: true
    }
  });

  // Emotional Section
  steps.push({
    title: 'Emotional Story',
    type: 'emotional',
    order_index: 2,
    settings: {
      content: ghostFunnel.emotional,
      ai_generated: true
    }
  });

  // CTA Section
  steps.push({
    title: 'Call to Action',
    type: 'cta',
    order_index: 3,
    settings: {
      content: ghostFunnel.cta,
      ai_generated: true
    }
  });

  // Lead Capture Form
  steps.push({
    title: 'Get Started',
    type: 'form',
    order_index: 4,
    settings: {
      content: {
        title: 'Get Started Today',
        description: 'Fill out the form below to get started with your journey.'
      },
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Full Name',
          placeholder: 'Enter your full name',
          required: true
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          placeholder: 'Enter your email address',
          required: true
        },
        {
          id: 'phone',
          type: 'tel',
          label: 'Phone Number',
          placeholder: 'Enter your phone number',
          required: false
        },
        {
          id: 'message',
          type: 'textarea',
          label: 'Message',
          placeholder: 'Tell us more about your needs (optional)',
          required: false
        }
      ],
      ai_generated: true
    }
  });

  return steps;
};

export const isGhostFunnelStructure = (funnelData: any): boolean => {
  return (
    funnelData &&
    typeof funnelData === 'object' &&
    funnelData.hero &&
    funnelData.advantages &&
    funnelData.emotional &&
    funnelData.cta &&
    !funnelData.steps // Traditional funnels have a 'steps' array
  );
};