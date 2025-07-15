
import React from 'react';
import { InteractiveFunnelStep } from '@/types/interactiveFunnel';
import { IntelligentFormBuilder } from './IntelligentFormBuilder';

interface ProductContext {
  productName: string;
  industry: string;
  targetAudience: string;
  keyBenefits: string[];
  uniqueValue: string;
}

interface ContextualStepGeneratorProps {
  productContext: ProductContext;
  onStepsGenerated: (steps: Partial<InteractiveFunnelStep>[]) => void;
}

export const ContextualStepGenerator: React.FC<ContextualStepGeneratorProps> = ({
  productContext,
  onStepsGenerated
}) => {
  
  const generateContextualSteps = (): Partial<InteractiveFunnelStep>[] => {
    const { productName, keyBenefits, uniqueValue } = productContext;
    
    return [
      // Step 1: Product Introduction
      {
        title: `Scopri ${productName}`,
        description: `La soluzione che stavi cercando per il tuo business`,
        step_type: 'info',
        step_order: 1,
        is_required: true,
        fields_config: [],
        settings: {
          customer_description: `${productName} è ${uniqueValue}`,
          content: `
            <div class="space-y-6">
              <h2 class="text-2xl font-bold text-center">${productName}</h2>
              <p class="text-lg text-center">${uniqueValue}</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${keyBenefits.map(benefit => `
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>${benefit}</span>
                  </div>
                `).join('')}
              </div>
              <div class="text-center">
                <p class="text-sm text-gray-600">Scopri come può trasformare il tuo business</p>
              </div>
            </div>
          `,
          showContinueButton: true
        }
      },

      // Step 2: Interest Qualification
      {
        title: 'Cosa ti interessa di più?',
        description: 'Aiutaci a personalizzare la tua esperienza',
        step_type: 'form',
        step_order: 2,
        is_required: true,
        fields_config: [
          {
            id: 'interesse_iniziale',
            type: 'radio',
            label: `Cosa ti interessa di più di ${productName}?`,
            required: true,
            options: [
              'Risparmiare tempo nelle operazioni',
              'Aumentare l\'efficienza del business',
              'Ridurre i costi operativi',
              'Migliorare la qualità del servizio'
            ]
          }
        ],
        settings: {
          customer_description: 'Questa informazione ci aiuta a creare una proposta su misura per te'
        }
      },

      // Step 3: Business Qualification
      {
        title: 'Raccontaci del tuo business',
        description: 'Qualche informazione per capire meglio le tue esigenze',
        step_type: 'form',
        step_order: 3,
        is_required: true,
        fields_config: [
          {
            id: 'ruolo_aziendale',
            type: 'select',
            label: 'Qual è il tuo ruolo in azienda?',
            required: true,
            options: [
              'Proprietario/CEO',
              'Direttore/Manager',
              'Responsabile Operations',
              'Dipendente',
              'Consulente',
              'Altro'
            ]
          },
          {
            id: 'dimensione_business',
            type: 'select',
            label: 'Quanto è grande la tua attività?',
            required: true,
            options: [
              'Solo io',
              '2-5 dipendenti',
              '6-20 dipendenti',
              '21-50 dipendenti',
              'Oltre 50 dipendenti'
            ]
          }
        ],
        settings: {
          customer_description: 'Queste informazioni ci permettono di dimensionare correttamente la soluzione'
        }
      },

      // Step 4: Pain Points & Interest
      {
        title: 'Le tue sfide attuali',
        description: 'Aiutaci a comprendere come possiamo aiutarti meglio',
        step_type: 'form',
        step_order: 4,
        is_required: true,
        fields_config: [
          {
            id: 'principale_sfida',
            type: 'textarea',
            label: 'Qual è la principale sfida che stai affrontando nel tuo business?',
            placeholder: 'Descrivi brevemente la situazione che vorresti migliorare...',
            required: true
          },
          {
            id: 'timeline_implementazione',
            type: 'select',
            label: 'Quando vorresti implementare una soluzione?',
            required: true,
            options: [
              'Immediatamente',
              'Entro 1 mese',
              'Entro 3 mesi',
              'Entro 6 mesi',
              'Sto solo valutando'
            ]
          }
        ],
        settings: {
          customer_description: 'Questa analisi ci consente di preparare una strategia personalizzata'
        }
      },

      // Step 5: Contact Information
      {
        title: 'Ottieni la tua proposta personalizzata',
        description: 'Ultimi dettagli per ricevere la soluzione su misura',
        step_type: 'form',
        step_order: 5,
        is_required: true,
        fields_config: [
          {
            id: 'nome',
            type: 'text',
            label: 'Il tuo nome',
            placeholder: 'Come ti chiami?',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email',
            placeholder: 'La tua email per ricevere la proposta',
            required: true
          },
          {
            id: 'telefono',
            type: 'tel',
            label: 'Numero di telefono',
            placeholder: 'Per una chiamata di consulenza gratuita',
            required: false
          },
          {
            id: 'nome_azienda',
            type: 'text',
            label: 'Nome dell\'azienda',
            placeholder: 'Il nome della tua attività',
            required: false
          },
          {
            id: 'budget_indicativo',
            type: 'select',
            label: 'Budget indicativo (opzionale)',
            required: false,
            options: [
              'Sotto €500/mese',
              '€500-1000/mese',
              '€1000-2500/mese',
              'Oltre €2500/mese',
              'Preferirei non dirlo'
            ]
          },
          {
            id: 'consenso_contatto',
            type: 'checkbox',
            label: 'Acconsento ad essere contattato per ricevere informazioni commerciali e la proposta personalizzata',
            required: true
          }
        ],
        settings: {
          customer_description: 'Ti contatteremo entro 24 ore con una proposta dettagliata e personalizzata',
          final_step: true
        }
      }
    ];
  };

  React.useEffect(() => {
    const steps = generateContextualSteps();
    onStepsGenerated(steps);
  }, [productContext]);

  return null;
};

export default ContextualStepGenerator;
