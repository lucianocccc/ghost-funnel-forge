
import { FormFieldConfig } from '@/types/interactiveFunnel';

export interface StepTypeConfig {
  value: string;
  label: string;
  icon: string;
  description: string;
  defaultFields: FormFieldConfig[];
}

export const INTERACTIVE_STEP_TYPES: StepTypeConfig[] = [
  {
    value: 'quiz',
    label: 'Quiz Interattivo',
    icon: '❓',
    description: 'Questionario interattivo per raccogliere informazioni sui visitatori',
    defaultFields: [
      {
        id: 'question',
        type: 'radio',
        label: 'Domanda',
        required: true,
        options: ['Opzione 1', 'Opzione 2', 'Opzione 3']
      }
    ]
  },
  {
    value: 'assessment',
    label: 'Assessment',
    icon: '📊',
    description: 'Valutazione delle esigenze o competenze del cliente',
    defaultFields: [
      {
        id: 'assessment_area',
        type: 'select',
        label: 'Area di valutazione',
        required: true,
        options: ['Marketing', 'Vendite', 'Operazioni', 'Tecnologia']
      }
    ]
  },
  {
    value: 'calculator',
    label: 'Calcolatore',
    icon: '🧮',
    description: 'Strumento di calcolo per ROI, prezzi o stime',
    defaultFields: [
      {
        id: 'input_value',
        type: 'text',
        label: 'Valore di input',
        required: true
      }
    ]
  },
  {
    value: 'demo_request',
    label: 'Richiesta Demo',
    icon: '🎬',
    description: 'Form per richiedere una dimostrazione del prodotto',
    defaultFields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nome',
        required: true
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email',
        required: true
      },
      {
        id: 'company',
        type: 'text',
        label: 'Azienda',
        required: false
      }
    ]
  },
  {
    value: 'trial_signup',
    label: 'Iscrizione Trial',
    icon: '🎯',
    description: 'Registrazione per una prova gratuita',
    defaultFields: [
      {
        id: 'email',
        type: 'email',
        label: 'Email',
        required: true
      },
      {
        id: 'password',
        type: 'text',
        label: 'Password',
        required: true
      }
    ]
  },
  {
    value: 'calendar_booking',
    label: 'Prenotazione Calendario',
    icon: '📅',
    description: 'Sistema di prenotazione appuntamenti',
    defaultFields: [
      {
        id: 'preferred_date',
        type: 'text',
        label: 'Data preferita',
        required: true
      },
      {
        id: 'preferred_time',
        type: 'text',
        label: 'Orario preferito',
        required: true
      }
    ]
  },
  {
    value: 'social_proof',
    label: 'Social Proof',
    icon: '⭐',
    description: 'Testimonianze e recensioni clienti',
    defaultFields: [
      {
        id: 'rating',
        type: 'radio',
        label: 'Valutazione',
        required: false,
        options: ['1', '2', '3', '4', '5']
      }
    ]
  },
  {
    value: 'product_showcase',
    label: 'Showcase Prodotto',
    icon: '🛍️',
    description: 'Presentazione delle caratteristiche del prodotto',
    defaultFields: [
      {
        id: 'interest_level',
        type: 'radio',
        label: 'Livello di interesse',
        required: false,
        options: ['Basso', 'Medio', 'Alto']
      }
    ]
  },
  {
    value: 'contact_form',
    label: 'Form di Contatto',
    icon: '📧',
    description: 'Modulo di contatto generale',
    defaultFields: [
      {
        id: 'name',
        type: 'text',
        label: 'Nome',
        required: true
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email',
        required: true
      },
      {
        id: 'message',
        type: 'textarea',
        label: 'Messaggio',
        required: true
      }
    ]
  },
  {
    value: 'lead_magnet',
    label: 'Lead Magnet',
    icon: '🧲',
    description: 'Offerta di contenuti gratuiti per catturare lead',
    defaultFields: [
      {
        id: 'email',
        type: 'email',
        label: 'Email',
        required: true
      },
      {
        id: 'interest_topic',
        type: 'select',
        label: 'Argomento di interesse',
        required: false,
        options: ['Marketing', 'Vendite', 'Business', 'Tecnologia']
      }
    ]
  }
];

export const getStepTypeConfig = (stepType: string): StepTypeConfig | undefined => {
  return INTERACTIVE_STEP_TYPES.find(type => type.value === stepType);
};
