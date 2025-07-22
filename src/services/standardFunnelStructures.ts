
import { FormFieldConfig } from '@/types/interactiveFunnel';

export interface StandardFunnelStep {
  step_type: string;
  title: string;
  description: string;
  step_order: number;
  is_required: boolean;
  fields_config: FormFieldConfig[];
  settings: {
    showProgressBar: boolean;
    allowBack: boolean;
    submitButtonText: string;
    backgroundColor: string;
    textColor: string;
    customer_description?: string;
    customer_motivation?: string;
  };
}

export interface StandardFunnelStructure {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  target_audience: string;
  complexity_level: 'basic' | 'intermediate' | 'advanced';
  steps: StandardFunnelStep[];
  ai_prompts: {
    system_prompt: string;
    focus: string;
    key_metrics: string[];
  };
}

export const STANDARD_FUNNEL_STRUCTURES: StandardFunnelStructure[] = [
  // 1. Lead Magnet Funnel
  {
    id: 'lead_magnet',
    name: 'Lead Magnet Funnel',
    description: 'Cattura lead offrendo contenuti di valore gratuiti',
    category: 'content',
    industry: 'generale',
    target_audience: 'professionisti e imprenditori',
    complexity_level: 'basic',
    steps: [
      {
        step_type: 'lead_capture',
        title: 'Scarica la Risorsa Gratuita',
        description: 'Accedi al contenuto esclusivo inserendo i tuoi dati',
        step_order: 1,
        is_required: true,
        fields_config: [
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
            placeholder: 'La tua email professionale'
          }
        ],
        settings: {
          showProgressBar: true,
          allowBack: false,
          submitButtonText: 'Scarica Ora',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          customer_description: 'Persona interessata a contenuti di valore nel settore',
          customer_motivation: 'Vuole accedere a informazioni esclusive per migliorare le proprie competenze'
        }
      },
      {
        step_type: 'qualification',
        title: 'Personalizza il Contenuto',
        description: 'Aiutaci a fornirti contenuti più rilevanti',
        step_order: 2,
        is_required: false,
        fields_config: [
          {
            id: 'role',
            type: 'select',
            label: 'Qual è il tuo ruolo?',
            required: false,
            options: ['Imprenditore', 'Manager', 'Consulente', 'Libero Professionista', 'Altro']
          },
          {
            id: 'company_size',
            type: 'select',
            label: 'Dimensione azienda',
            required: false,
            options: ['Solo io', '2-10 dipendenti', '11-50 dipendenti', '50+ dipendenti']
          }
        ],
        settings: {
          showProgressBar: true,
          allowBack: true,
          submitButtonText: 'Continua',
          backgroundColor: '#ffffff',
          textColor: '#1f2937'
        }
      },
      {
        step_type: 'thank_you',
        title: 'Grazie!',
        description: 'Controlla la tua email per accedere al contenuto',
        step_order: 3,
        is_required: false,
        fields_config: [],
        settings: {
          showProgressBar: true,
          allowBack: false,
          submitButtonText: 'Chiudi',
          backgroundColor: '#10b981',
          textColor: '#ffffff'
        }
      }
    ],
    ai_prompts: {
      system_prompt: 'Crea funnel lead magnet che offrono valore immediato e costruiscono fiducia per conversioni future.',
      focus: 'value_delivery',
      key_metrics: ['download_rate', 'engagement', 'email_signup']
    }
  },

  // 2. Consultation Booking Funnel
  {
    id: 'consultation_booking',
    name: 'Prenota Consulenza',
    description: 'Qualifica lead e prenota consulenze con professionisti',
    category: 'consultation',
    industry: 'servizi professionali',
    target_audience: 'imprenditori e aziende',
    complexity_level: 'intermediate',
    steps: [
      {
        step_type: 'lead_capture',
        title: 'Richiedi Consulenza Gratuita',
        description: 'Parla con un esperto per risolvere le tue sfide',
        step_order: 1,
        is_required: true,
        fields_config: [
          {
            id: 'name',
            type: 'text',
            label: 'Nome completo',
            required: true,
            placeholder: 'Il tuo nome e cognome'
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email',
            required: true,
            placeholder: 'La tua email'
          },
          {
            id: 'phone',
            type: 'tel',
            label: 'Telefono',
            required: true,
            placeholder: 'Il tuo numero di telefono'
          }
        ],
        settings: {
          showProgressBar: true,
          allowBack: false,
          submitButtonText: 'Continua',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          customer_description: 'Imprenditore o manager che cerca soluzioni professionali',
          customer_motivation: 'Ha una sfida specifica che richiede consulenza esperta'
        }
      },
      {
        step_type: 'qualification',
        title: 'La Tua Situazione',
        description: 'Aiutaci a comprendere le tue esigenze',
        step_order: 2,
        is_required: true,
        fields_config: [
          {
            id: 'challenge',
            type: 'textarea',
            label: 'Qual è la tua sfida principale?',
            required: true,
            placeholder: 'Descrivi la situazione che vorresti migliorare...'
          },
          {
            id: 'urgency',
            type: 'radio',
            label: 'Quanto è urgente trovare una soluzione?',
            required: true,
            options: ['Molto urgente (entro 1 settimana)', 'Urgente (entro 1 mese)', 'Importante (entro 3 mesi)', 'Non urgente']
          },
          {
            id: 'budget',
            type: 'select',
            label: 'Budget indicativo',
            required: false,
            options: ['< 1.000€', '1.000€ - 5.000€', '5.000€ - 15.000€', '> 15.000€', 'Da valutare']
          }
        ],
        settings: {
          showProgressBar: true,
          allowBack: true,
          submitButtonText: 'Prenota Chiamata',
          backgroundColor: '#ffffff',
          textColor: '#1f2937'
        }
      },
      {
        step_type: 'thank_you',
        title: 'Consulenza Prenotata!',
        description: 'Ti contatteremo entro 24 ore per concordare orario e modalità',
        step_order: 3,
        is_required: false,
        fields_config: [],
        settings: {
          showProgressBar: true,
          allowBack: false,
          submitButtonText: 'Chiudi',
          backgroundColor: '#10b981',
          textColor: '#ffffff'
        }
      }
    ],
    ai_prompts: {
      system_prompt: 'Crea funnel consulenza che pre-qualificano clienti e ottimizzano il booking rate con domande strategiche.',
      focus: 'consultation_booking',
      key_metrics: ['booking_rate', 'qualified_calls', 'conversion_rate']
    }
  },

  // 3. Product Demo Request
  {
    id: 'product_demo',
    name: 'Richiesta Demo Prodotto',
    description: 'Qualifica prospect e prenota demo personalizzate',
    category: 'saas',
    industry: 'tecnologia',
    target_audience: 'decision maker aziendali',
    complexity_level: 'intermediate',
    steps: [
      {
        step_type: 'lead_capture',
        title: 'Richiedi Demo Personalizzata',
        description: 'Vedi come il nostro prodotto può aiutare la tua azienda',
        step_order: 1,
        is_required: true,
        fields_config: [
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
            label: 'Email aziendale',
            required: true,
            placeholder: 'La tua email aziendale'
          },
          {
            id: 'company',
            type: 'text',
            label: 'Azienda',
            required: true,
            placeholder: 'Nome della tua azienda'
          },
          {
            id: 'role',
            type: 'text',
            label: 'Ruolo',
            required: true,
            placeholder: 'Il tuo ruolo in azienda'
          }
        ],
        settings: {
          showProgressBar: true,
          allowBack: false,
          submitButtonText: 'Continua',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          customer_description: 'Decision maker aziendale interessato a soluzioni tecnologiche',
          customer_motivation: 'Cerca strumenti per migliorare efficienza e risultati aziendali'
        }
      },
      {
        step_type: 'qualification',
        title: 'Le Tue Esigenze',
        description: 'Personalizziamo la demo in base alle tue necessità',
        step_order: 2,
        is_required: true,
        fields_config: [
          {
            id: 'team_size',
            type: 'select',
            label: 'Dimensione del team',
            required: true,
            options: ['1-5 persone', '6-20 persone', '21-50 persone', '50+ persone']
          },
          {
            id: 'current_solution',
            type: 'select',
            label: 'Soluzione attuale',
            required: false,
            options: ['Nessuna soluzione', 'Fogli di calcolo', 'Software interno', 'Competitor', 'Altro']
          },
          {
            id: 'main_goal',
            type: 'radio',
            label: 'Obiettivo principale',
            required: true,
            options: ['Aumentare produttività', 'Ridurre costi', 'Migliorare qualità', 'Automatizzare processi']
          }
        ],
        settings: {
          showProgressBar: true,
          allowBack: true,
          submitButtonText: 'Prenota Demo',
          backgroundColor: '#ffffff',
          textColor: '#1f2937'
        }
      },
      {
        step_type: 'thank_you',
        title: 'Demo Prenotata!',
        description: 'Il nostro team ti contatterà per organizzare la demo personalizzata',
        step_order: 3,
        is_required: false,
        fields_config: [],
        settings: {
          showProgressBar: true,
          allowBack: false,
          submitButtonText: 'Chiudi',
          backgroundColor: '#10b981',
          textColor: '#ffffff'
        }
      }
    ],
    ai_prompts: {
      system_prompt: 'Crea funnel demo che qualificano prospect B2B e massimizzano il valore percepito del prodotto.',
      focus: 'demo_qualification',
      key_metrics: ['demo_requests', 'show_up_rate', 'qualified_prospects']
    }
  },

  // 4. E-commerce Lead Capture
  {
    id: 'ecommerce_lead',
    name: 'Sconto Esclusivo E-commerce',
    description: 'Cattura email con offerte esclusive per e-commerce',
    category: 'ecommerce',
    industry: 'retail',
    target_audience: 'consumatori online',
    complexity_level: 'basic',
    steps: [
      {
        step_type: 'lead_capture',
        title: 'Ottieni il 15% di Sconto',
        description: 'Iscriviti e ricevi subito il tuo codice sconto esclusivo',
        step_order: 1,
        is_required: true,
        fields_config: [
          {
            id: 'email',
            type: 'email',
            label: 'La tua email',
            required: true,
            placeholder: 'Inserisci la tua email'
          },
          {
            id: 'first_name',
            type: 'text',
            label: 'Nome',
            required: false,
            placeholder: 'Il tuo nome (opzionale)'
          }
        ],
        settings: {
          showProgressBar: true,
          allowBack: false,
          submitButtonText: 'Ottieni Sconto',
          backgroundColor: '#dc2626',
          textColor: '#ffffff',
          customer_description: 'Consumatore interessato a risparmiare sui prodotti',
          customer_motivation: 'Cerca offerte vantaggiose e prodotti di qualità'
        }
      },
      {
        step_type: 'qualification',
        title: 'Le Tue Preferenze',
        description: 'Aiutaci a inviarti offerte più rilevanti',
        step_order: 2,
        is_required: false,
        fields_config: [
          {
            id: 'interests',
            type: 'checkbox',
            label: 'Cosa ti interessa di più?',
            required: false,
            options: ['Abbigliamento', 'Accessori', 'Casa', 'Tecnologia', 'Sport', 'Bellezza']
          },
          {
            id: 'frequency',
            type: 'radio',
            label: 'Quanto spesso acquisti online?',
            required: false,
            options: ['Più volte al mese', 'Una volta al mese', 'Occasionalmente', 'Prima volta']
          }
        ],
        settings: {
          showProgressBar: true,
          allowBack: true,
          submitButtonText: 'Personalizza Offerte',
          backgroundColor: '#ffffff',
          textColor: '#1f2937'
        }
      },
      {
        step_type: 'thank_you',
        title: 'Ecco il Tuo Codice Sconto!',
        description: 'Usa il codice SAVE15 al checkout. Valido per 48 ore.',
        step_order: 3,
        is_required: false,
        fields_config: [],
        settings: {
          showProgressBar: true,
          allowBack: false,
          submitButtonText: 'Inizia Shopping',
          backgroundColor: '#10b981',
          textColor: '#ffffff'
        }
      }
    ],
    ai_prompts: {
      system_prompt: 'Crea funnel e-commerce che catturano email con incentivi immediati e costruiscono liste clienti.',
      focus: 'email_capture',
      key_metrics: ['signup_rate', 'discount_usage', 'purchase_conversion']
    }
  },

  // 5. Event Registration
  {
    id: 'event_registration',
    name: 'Registrazione Evento',
    description: 'Massimizza registrazioni per webinar, workshop ed eventi',
    category: 'education',
    industry: 'formazione',
    target_audience: 'professionisti interessati',
    complexity_level: 'intermediate',
    steps: [
      {
        step_type: 'lead_capture',
        title: 'Registrati al Webinar Gratuito',
        description: 'Accesso esclusivo a strategie e casi studio avanzati',
        step_order: 1,
        is_required: true,
        fields_config: [
          {
            id: 'name',
            type: 'text',
            label: 'Nome completo',
            required: true,
            placeholder: 'Il tuo nome e cognome'
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email',
            required: true,
            placeholder: 'La tua email'
          },
          {
            id: 'phone',
            type: 'tel',
            label: 'Telefono (opzionale)',
            required: false,
            placeholder: 'Per ricordare l\'evento'
          }
        ],
        settings: {
          showProgressBar: true,
          allowBack: false,
          submitButtonText: 'Registrati Ora',
          backgroundColor: '#3b82f6',
          textColor: '#ffffff',
          customer_description: 'Professionista che vuole aggiornarsi e imparare nuove competenze',
          customer_motivation: 'Cerca formazione pratica e applicabile al proprio lavoro'
        }
      },
      {
        step_type: 'qualification',
        title: 'I Tuoi Obiettivi',
        description: 'Personalizziamo il contenuto per te',
        step_order: 2,
        is_required: false,
        fields_config: [
          {
            id: 'experience_level',
            type: 'radio',
            label: 'Il tuo livello di esperienza',
            required: false,
            options: ['Principiante', 'Intermedio', 'Avanzato', 'Esperto']
          },
          {
            id: 'main_interest',
            type: 'select',
            label: 'Cosa ti interessa di più?',
            required: false,
            options: ['Strategie pratiche', 'Casi studio', 'Strumenti avanzati', 'Networking', 'Certificazioni']
          },
          {
            id: 'questions',
            type: 'textarea',
            label: 'Domande specifiche (opzionale)',
            required: false,
            placeholder: 'Hai domande particolari che vorresti vengano affrontate?'
          }
        ],
        settings: {
          showProgressBar: true,
          allowBack: true,
          submitButtonText: 'Completa Registrazione',
          backgroundColor: '#ffffff',
          textColor: '#1f2937'
        }
      },
      {
        step_type: 'thank_you',
        title: 'Sei Registrato!',
        description: 'Ti abbiamo inviato tutti i dettagli via email. Ci vediamo all\'evento!',
        step_order: 3,
        is_required: false,
        fields_config: [],
        settings: {
          showProgressBar: true,
          allowBack: false,
          submitButtonText: 'Aggiungi al Calendario',
          backgroundColor: '#10b981',
          textColor: '#ffffff'
        }
      }
    ],
    ai_prompts: {
      system_prompt: 'Crea funnel eventi che massimizzano registrazioni e show-up rate con value preview e engagement.',
      focus: 'event_registration',
      key_metrics: ['registration_rate', 'show_up_rate', 'engagement']
    }
  },

  // 6. Newsletter Subscription
  {
    id: 'newsletter_subscription',
    name: 'Iscrizione Newsletter',
    description: 'Costruisci una mailing list di qualità con contenuti premium',
    category: 'content',
    industry: 'generale',
    target_audience: 'audience interessata',
    complexity_level: 'basic',
    steps: [
      {
        step_type: 'lead_capture',
        title: 'Resta Aggiornato',
        description: 'Ricevi contenuti esclusivi e insights settimanali',
        step_order: 1,
        is_required: true,
        fields_config: [
          {
            id: 'email',
            type: 'email',
            label: 'La tua email',
            required: true,
            placeholder: 'Inserisci la tua email'
          },
          {
            id: 'interests',
            type: 'checkbox',
            label: 'Argomenti di interesse',
            required: false,
            options: ['Business', 'Marketing', 'Tecnologia', 'Crescita personale', 'Innovazione']
          }
        ],
        settings: {
          showProgressBar: false,
          allowBack: false,
          submitButtonText: 'Iscriviti',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          customer_description: 'Persona interessata a contenuti di qualità nel settore',
          customer_motivation: 'Vuole rimanere aggiornata su trend e novità rilevanti'
        }
      },
      {
        step_type: 'thank_you',
        title: 'Benvenuto nella Community!',
        description: 'Controlla la tua email per confermare l\'iscrizione',
        step_order: 2,
        is_required: false,
        fields_config: [],
        settings: {
          showProgressBar: false,
          allowBack: false,
          submitButtonText: 'Chiudi',
          backgroundColor: '#10b981',
          textColor: '#ffffff'
        }
      }
    ],
    ai_prompts: {
      system_prompt: 'Crea funnel newsletter che costruiscono liste email di qualità con value proposition chiari.',
      focus: 'email_list_building',
      key_metrics: ['subscription_rate', 'email_engagement', 'retention']
    }
  },

  // 7. Quote Request
  {
    id: 'quote_request',
    name: 'Richiesta Preventivo',
    description: 'Genera preventivi qualificati per servizi personalizzati',
    category: 'services',
    industry: 'servizi professionali',
    target_audience: 'aziende e professionisti',
    complexity_level: 'advanced',
    steps: [
      {
        step_type: 'lead_capture',
        title: 'Richiedi Preventivo Gratuito',
        description: 'Ottieni un preventivo personalizzato per il tuo progetto',
        step_order: 1,
        is_required: true,
        fields_config: [
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
          },
          {
            id: 'company',
            type: 'text',
            label: 'Azienda',
            required: false,
            placeholder: 'Nome azienda (opzionale)'
          },
          {
            id: 'phone',
            type: 'tel',
            label: 'Telefono',
            required: true,
            placeholder: 'Il tuo numero di telefono'
          }
        ],
        settings: {
          showProgressBar: true,
          allowBack: false,
          submitButtonText: 'Continua',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          customer_description: 'Decisore che cerca servizi professionali per un progetto specifico',
          customer_motivation: 'Ha un progetto concreto e vuole valutare costi e soluzioni'
        }
      },
      {
        step_type: 'qualification',
        title: 'Dettagli del Progetto',
        description: 'Aiutaci a capire le tue esigenze per un preventivo accurato',
        step_order: 2,
        is_required: true,
        fields_config: [
          {
            id: 'project_type',
            type: 'radio',
            label: 'Tipo di progetto',
            required: true,
            options: ['Nuovo progetto', 'Miglioramento esistente', 'Risoluzione problema', 'Consulenza']
          },
          {
            id: 'budget_range',
            type: 'select',
            label: 'Budget indicativo',
            required: true,
            options: ['< 2.000€', '2.000€ - 10.000€', '10.000€ - 50.000€', '> 50.000€', 'Da valutare']
          },
          {
            id: 'timeline',
            type: 'radio',
            label: 'Tempistiche desiderate',
            required: true,
            options: ['Urgente (entro 2 settimane)', 'Breve termine (1-2 mesi)', 'Medio termine (3-6 mesi)', 'Lungo termine (6+ mesi)']
          },
          {
            id: 'project_description',
            type: 'textarea',
            label: 'Descrizione del progetto',
            required: true,
            placeholder: 'Descrivi nel dettaglio il tuo progetto, obiettivi e requisiti specifici...'
          }
        ],
        settings: {
          showProgressBar: true,
          allowBack: true,
          submitButtonText: 'Richiedi Preventivo',
          backgroundColor: '#ffffff',
          textColor: '#1f2937'
        }
      },
      {
        step_type: 'thank_you',
        title: 'Richiesta Ricevuta!',
        description: 'Ti invieremo un preventivo dettagliato entro 24-48 ore',
        step_order: 3,
        is_required: false,
        fields_config: [],
        settings: {
          showProgressBar: true,
          allowBack: false,
          submitButtonText: 'Chiudi',
          backgroundColor: '#10b981',
          textColor: '#ffffff'
        }
      }
    ],
    ai_prompts: {
      system_prompt: 'Crea funnel preventivi che raccolgono informazioni dettagliate per quote accurate e qualificate.',
      focus: 'quote_qualification',
      key_metrics: ['quote_requests', 'qualification_score', 'conversion_rate']
    }
  },

  // 8. Free Trial Signup
  {
    id: 'free_trial',
    name: 'Prova Gratuita',
    description: 'Converti visitatori in trial users per software SaaS',
    category: 'saas',
    industry: 'tecnologia',
    target_audience: 'decision maker e utenti business',
    complexity_level: 'advanced',
    steps: [
      {
        step_type: 'lead_capture',
        title: 'Inizia la Prova Gratuita',
        description: 'Accesso completo per 14 giorni, senza carta di credito',
        step_order: 1,
        is_required: true,
        fields_config: [
          {
            id: 'email',
            type: 'email',
            label: 'Email aziendale',
            required: true,
            placeholder: 'La tua email aziendale'
          },
          {
            id: 'full_name',
            type: 'text',
            label: 'Nome completo',
            required: true,
            placeholder: 'Il tuo nome e cognome'
          },
          {
            id: 'company',
            type: 'text',
            label: 'Azienda',
            required: true,
            placeholder: 'Nome della tua azienda'
          }
        ],
        settings: {
          showProgressBar: true,
          allowBack: false,
          submitButtonText: 'Inizia Prova Gratuita',
          backgroundColor: '#10b981',
          textColor: '#ffffff',
          customer_description: 'Professionista che valuta soluzioni software per migliorare processi aziendali',
          customer_motivation: 'Vuole testare il prodotto prima di impegnarsi in un acquisto'
        }
      },
      {
        step_type: 'qualification',
        title: 'Configura il Tuo Account',
        description: 'Personalizziamo l\'esperienza in base alle tue esigenze',
        step_order: 2,
        is_required: true,
        fields_config: [
          {
            id: 'role',
            type: 'select',
            label: 'Il tuo ruolo',
            required: true,
            options: ['CEO/Founder', 'CTO/IT Manager', 'Marketing Manager', 'Sales Manager', 'Operations Manager', 'Altro']
          },
          {
            id: 'company_size',
            type: 'radio',
            label: 'Dimensione azienda',
            required: true,
            options: ['Solo io', '2-10 dipendenti', '11-50 dipendenti', '51-200 dipendenti', '200+ dipendenti']
          },
          {
            id: 'use_case',
            type: 'select',
            label: 'Caso d\'uso principale',
            required: true,
            options: ['Gestione progetti', 'CRM', 'Marketing automation', 'Analytics', 'Team collaboration', 'Altro']
          },
          {
            id: 'current_solution',
            type: 'select',
            label: 'Soluzione attuale',
            required: false,
            options: ['Nessuna', 'Fogli di calcolo', 'Software interno', 'Competitor A', 'Competitor B', 'Altro']
          }
        ],
        settings: {
          showProgressBar: true,
          allowBack: true,
          submitButtonText: 'Attiva Account',
          backgroundColor: '#ffffff',
          textColor: '#1f2937'
        }
      },
      {
        step_type: 'thank_you',
        title: 'Account Attivato!',
        description: 'La tua prova gratuita è iniziata. Ti abbiamo inviato le credenziali via email.',
        step_order: 3,
        is_required: false,
        fields_config: [],
        settings: {
          showProgressBar: true,
          allowBack: false,
          submitButtonText: 'Accedi alla Piattaforma',
          backgroundColor: '#10b981',
          textColor: '#ffffff'
        }
      }
    ],
    ai_prompts: {
      system_prompt: 'Crea funnel trial che massimizzano signup rate e qualificano utenti per conversioni future.',
      focus: 'trial_conversion',
      key_metrics: ['trial_signup', 'activation_rate', 'trial_to_paid']
    }
  }
];

export const getFunnelStructureById = (id: string): StandardFunnelStructure | undefined => {
  return STANDARD_FUNNEL_STRUCTURES.find(structure => structure.id === id);
};

export const getFunnelStructuresByCategory = (category: string): StandardFunnelStructure[] => {
  return STANDARD_FUNNEL_STRUCTURES.filter(structure => structure.category === category);
};

export const getAllCategories = (): string[] => {
  const categories = STANDARD_FUNNEL_STRUCTURES.map(structure => structure.category);
  return [...new Set(categories)];
};
