import { InteractiveFunnelStep } from '@/types/interactiveFunnel';

export interface ExtractedAIContent {
  title: string;
  subtitle: string;
  content: string;
  cta?: {
    text: string;
    action: string;
  };
  visualStyle?: {
    backgroundColor?: string;
    textColor?: string;
    brandColors?: string[];
  };
}

/**
 * Extracts AI-generated content from funnel step settings
 */
export const extractAIContent = (step: InteractiveFunnelStep): ExtractedAIContent => {
  const settings = step.settings || {};
  const content = settings.content || {};
  
  // Extract title with fallbacks
  const title = content.headline || 
                content.title || 
                step.title || 
                'Scopri la Soluzione';

  // Extract subtitle with fallbacks
  const subtitle = content.subheadline || 
                   content.subtitle || 
                   step.description || 
                   'Una nuova opportunità ti aspetta';

  // Extract main content
  const mainContent = content.description ||
                      content.content ||
                      content.items?.join('. ') ||
                      generateContentBasedOnType(step.step_type);

  // Extract CTA with smart defaults
  const cta = content.cta ? {
    text: content.cta,
    action: getCTAActionFromStepType(step.step_type)
  } : generateCTAFromStepType(step.step_type);

  // Extract visual style from brand settings
  const config = settings.config || {};
  const visualStyle = {
    backgroundColor: config.backgroundColor || settings.backgroundColor,
    textColor: config.textColor || settings.textColor,
    brandColors: config.brandColors || []
  };

  return {
    title,
    subtitle,
    content: mainContent,
    cta,
    visualStyle
  };
};

/**
 * Generates content based on step type for fallbacks
 */
const generateContentBasedOnType = (stepType: string): string => {
  const contentMap: Record<string, string> = {
    'lead_capture': 'Compila il modulo per ricevere informazioni personalizzate e scoprire come possiamo aiutarti a raggiungere i tuoi obiettivi.',
    'discovery': 'Esplora le possibilità e scopri come la nostra soluzione può trasformare il tuo business e portarti risultati concreti.',
    'qualification': 'Rispondi ad alcune domande per aiutarci a personalizzare la tua esperienza e fornirti le soluzioni più adatte.',
    'conversion': 'È il momento di agire. Approfitta di questa opportunità unica per trasformare la tua situazione e raggiungere il successo.',
    'thank_you': 'Grazie per il tuo interesse! Abbiamo ricevuto le tue informazioni e ti contatteremo presto con soluzioni personalizzate.'
  };

  return contentMap[stepType] || 'Scopri come possiamo aiutarti a raggiungere i tuoi obiettivi con soluzioni innovative e personalizzate.';
};

/**
 * Generates CTA based on step type
 */
const generateCTAFromStepType = (stepType: string): { text: string; action: string } => {
  const ctaMap: Record<string, { text: string; action: string }> = {
    'lead_capture': { text: 'Inizia Subito', action: 'scroll' },
    'discovery': { text: 'Scopri di Più', action: 'scroll' },
    'qualification': { text: 'Continua', action: 'scroll' },
    'conversion': { text: 'Ottieni Accesso Ora', action: 'scroll' },
    'thank_you': { text: 'Chiudi', action: 'complete' }
  };

  return ctaMap[stepType] || { text: 'Continua', action: 'scroll' };
};

/**
 * Gets CTA action from step type
 */
const getCTAActionFromStepType = (stepType: string): string => {
  if (stepType === 'thank_you') return 'complete';
  return 'scroll';
};

/**
 * Checks if step has AI-generated content
 */
export const hasAIGeneratedContent = (step: InteractiveFunnelStep): boolean => {
  return !!(step.settings?.ai_generated || 
           step.settings?.content?.headline ||
           step.settings?.content?.subheadline);
};

/**
 * Extracts storytelling flow from multiple steps
 */
export const extractStorytellingFlow = (steps: InteractiveFunnelStep[]): {
  narrative: string;
  progression: 'problem-solution' | 'hero-journey' | 'benefit-driven' | 'urgency-based';
  keyMessages: string[];
} => {
  const sortedSteps = steps.sort((a, b) => a.step_order - b.step_order);
  
  // Analyze the storytelling pattern
  const stepTypes = sortedSteps.map(s => s.step_type);
  let progression: 'problem-solution' | 'hero-journey' | 'benefit-driven' | 'urgency-based' = 'benefit-driven';
  
  if (stepTypes.includes('discovery') && stepTypes.includes('conversion')) {
    progression = 'problem-solution';
  } else if (stepTypes.includes('qualification') && stepTypes.includes('discovery')) {
    progression = 'hero-journey';
  } else if (stepTypes.includes('conversion') && stepTypes.length <= 3) {
    progression = 'urgency-based';
  }

  // Extract key messages from AI content
  const keyMessages = sortedSteps
    .map(step => extractAIContent(step).title)
    .filter(title => title && title !== 'Scopri la Soluzione');

  // Generate narrative description
  const narrative = generateNarrativeDescription(progression, keyMessages);

  return { narrative, progression, keyMessages };
};

/**
 * Generates narrative description based on progression type
 */
const generateNarrativeDescription = (
  progression: string, 
  keyMessages: string[]
): string => {
  const templates: Record<string, string> = {
    'problem-solution': 'Un percorso che identifica le sfide e presenta soluzioni concrete.',
    'hero-journey': 'Un viaggio di trasformazione che guida verso il successo.',
    'benefit-driven': 'Un\'esperienza focalizzata sui benefici e sul valore offerto.',
    'urgency-based': 'Un percorso rapido e diretto verso l\'azione immediata.'
  };

  return templates[progression] || templates['benefit-driven'];
};