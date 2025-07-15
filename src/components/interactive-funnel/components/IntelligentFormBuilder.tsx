
import React from 'react';
import { FormFieldConfig } from '@/types/interactiveFunnel';

interface ProductContext {
  productName: string;
  industry: string;
  targetAudience: string;
  keyBenefits: string[];
}

interface IntelligentFormBuilderProps {
  productContext: ProductContext;
  stepType: 'introduction' | 'qualification' | 'contact' | 'interest';
  onFieldsGenerated: (fields: FormFieldConfig[]) => void;
}

export const IntelligentFormBuilder: React.FC<IntelligentFormBuilderProps> = ({
  productContext,
  stepType,
  onFieldsGenerated
}) => {
  
  const generateFieldsForStep = (type: string): FormFieldConfig[] => {
    const { productName, industry, targetAudience } = productContext;
    
    switch (type) {
      case 'introduction':
        return [
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
        ];

      case 'qualification':
        const qualificationFields: FormFieldConfig[] = [
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
          }
        ];

        // Industry-specific qualification
        if (industry.toLowerCase().includes('lavanderia')) {
          qualificationFields.push({
            id: 'tipo_lavanderia',
            type: 'select',
            label: 'Che tipo di lavanderia gestisci?',
            required: true,
            options: [
              'Lavanderia self-service',
              'Lavanderia a servizio completo',
              'Lavanderia industriale',
              'Tintoria',
              'Lavanderia mista'
            ]
          });
        } else if (industry.toLowerCase().includes('ristorante')) {
          qualificationFields.push({
            id: 'tipo_ristorante',
            type: 'select',
            label: 'Che tipo di attività hai?',
            required: true,
            options: [
              'Ristorante tradizionale',
              'Pizzeria',
              'Fast food',
              'Bar/Caffetteria',
              'Catering',
              'Food truck'
            ]
          });
        }

        qualificationFields.push({
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
        });

        return qualificationFields;

      case 'interest':
        return [
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
          },
          {
            id: 'budget_indicativo',
            type: 'select',
            label: 'Qual è il tuo budget indicativo?',
            required: false,
            options: [
              'Sotto €500/mese',
              '€500-1000/mese',
              '€1000-2500/mese',
              'Oltre €2500/mese',
              'Preferirei non dirlo'
            ]
          }
        ];

      case 'contact':
        return [
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
            id: 'consenso_contatto',
            type: 'checkbox',
            label: 'Acconsento ad essere contattato per ricevere informazioni commerciali e la proposta personalizzata',
            required: true
          }
        ];

      default:
        return [];
    }
  };

  React.useEffect(() => {
    const fields = generateFieldsForStep(stepType);
    onFieldsGenerated(fields);
  }, [stepType, productContext]);

  return null; // This is a logic component, no UI needed
};

export default IntelligentFormBuilder;
