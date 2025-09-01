
import { FormFieldConfig } from '@/types/interactiveFunnel';

export interface StepTypeConfig {
  value: string;
  label: string;
  icon: string;
  description: string;
  defaultFields: FormFieldConfig[];
}

// Valid step types that match the database constraint exactly
export const INTERACTIVE_STEP_TYPES: StepTypeConfig[] = [
  {
    value: 'lead_capture',
    label: 'Cattura Lead',
    icon: '🎯',
    description: 'Raccoglie informazioni di contatto iniziali dai visitatori',
    defaultFields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nome',
        required: true,
        placeholder: 'Il tuo nome'
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email',
        required: true,
        placeholder: 'La tua email'
      }
    ]
  },
  {
    value: 'qualification',
    label: 'Qualificazione',
    icon: '📊',
    description: 'Qualifica i lead attraverso domande specifiche',
    defaultFields: [
      {
        id: 'needs',
        type: 'select',
        label: 'Che tipo di soluzione stai cercando?',
        required: true,
        options: ['Consulenza', 'Prodotto', 'Servizio', 'Altro']
      },
      {
        id: 'budget',
        type: 'select',
        label: 'Qual è il tuo budget indicativo?',
        required: false,
        options: ['< 1.000€', '1.000€ - 5.000€', '5.000€ - 10.000€', '> 10.000€']
      }
    ]
  },
  {
    value: 'discovery',
    label: 'Scoperta',
    icon: '🔍',
    description: 'Aiuta i visitatori a scoprire valore e caratteristiche',
    defaultFields: [
      {
        id: 'interests',
        type: 'checkbox',
        label: 'Cosa ti interessa di più?',
        required: true,
        options: ['Qualità', 'Prezzo', 'Velocità', 'Supporto', 'Innovazione']
      },
      {
        id: 'current_situation',
        type: 'textarea',
        label: 'Descrivi la tua situazione attuale',
        required: false,
        placeholder: 'Raccontaci di più...'
      }
    ]
  },
  {
    value: 'conversion',
    label: 'Conversione',
    icon: '🎯',
    description: 'Step finale per conversioni e vendite',
    defaultFields: [
      {
        id: 'decision_timeline',
        type: 'radio',
        label: 'Quando vorresti procedere?',
        required: true,
        options: ['Subito', 'Entro 1 settimana', 'Entro 1 mese', 'Oltre 1 mese']
      },
      {
        id: 'additional_info',
        type: 'textarea',
        label: 'Informazioni aggiuntive',
        required: false,
        placeholder: 'Altro da aggiungere...'
      }
    ]
  },
  {
    value: 'content',
    label: 'Contenuto',
    icon: '📄',
    description: 'Step di contenuto informativo o social proof',
    defaultFields: [
      {
        id: 'engagement',
        type: 'radio',
        label: 'Cosa ti interessa di più?',
        required: false,
        options: ['Maggiori informazioni', 'Demo', 'Consultazione', 'Niente al momento']
      }
    ]
  },
  {
    value: 'education',
    label: 'Educazione',
    icon: '🎓',
    description: 'Step educativo per spiegare problemi e soluzioni',
    defaultFields: [
      {
        id: 'learning_interest',
        type: 'checkbox',
        label: 'Su cosa vorresti saperne di più?',
        required: false,
        options: ['Benefici', 'Funzionalità', 'Prezzi', 'Caso studio']
      }
    ]
  },
  {
    value: 'form',
    label: 'Form Generico',
    icon: '📝',
    description: 'Modulo generico per raccolta dati',
    defaultFields: [
      {
        id: 'data',
        type: 'text',
        label: 'Informazioni',
        required: true,
        placeholder: 'Inserisci le informazioni richieste'
      }
    ]
  },
  {
    value: 'info',
    label: 'Informazioni',
    icon: 'ℹ️',
    description: 'Step informativo per fornire dettagli',
    defaultFields: [
      {
        id: 'interest_level',
        type: 'radio',
        label: 'Quanto sei interessato?',
        required: false,
        options: ['Molto interessato', 'Interessato', 'Poco interessato', 'Non interessato']
      }
    ]
  },
  {
    value: 'landing',
    label: 'Landing',
    icon: '🏠',
    description: 'Pagina di atterraggio iniziale',
    defaultFields: [
      {
        id: 'source',
        type: 'select',
        label: 'Come hai scoperto di noi?',
        required: false,
        options: ['Google', 'Social Media', 'Passaparola', 'Pubblicità', 'Altro']
      }
    ]
  },
  {
    value: 'survey',
    label: 'Sondaggio',
    icon: '📋',
    description: 'Step di sondaggio per raccogliere feedback',
    defaultFields: [
      {
        id: 'satisfaction',
        type: 'radio',
        label: 'Come valuti la tua esperienza?',
        required: true,
        options: ['Eccellente', 'Buona', 'Sufficiente', 'Da migliorare']
      }
    ]
  },
  {
    value: 'follow_up',
    label: 'Follow-up',
    icon: '📞',
    description: 'Step di follow-up per continuare la conversazione',
    defaultFields: [
      {
        id: 'preferred_contact',
        type: 'radio',
        label: 'Come preferisci essere ricontattato?',
        required: true,
        options: ['Email', 'Telefono', 'WhatsApp', 'Non ricontattarmi']
      }
    ]
  },
  {
    value: 'thank_you',
    label: 'Ringraziamento',
    icon: '🙏',
    description: 'Pagina di ringraziamento finale',
    defaultFields: [
      {
        id: 'feedback',
        type: 'radio',
        label: 'Come valuti la tua esperienza?',
        required: false,
        options: ['Eccellente', 'Buona', 'Sufficiente', 'Da migliorare']
      }
    ]
  }
];

export const getStepTypeConfig = (stepType: string): StepTypeConfig | undefined => {
  return INTERACTIVE_STEP_TYPES.find(type => type.value === stepType);
};

// Helper function to validate step type
export const isValidStepType = (stepType: string): boolean => {
  return INTERACTIVE_STEP_TYPES.some(type => type.value === stepType);
};

// Helper function to get all valid step type values
export const getValidStepTypes = (): string[] => {
  return INTERACTIVE_STEP_TYPES.map(type => type.value);
};
