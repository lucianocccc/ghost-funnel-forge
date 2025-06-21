
import { ParsedFunnelData } from './types';

export const parseFunnelsFromText = (text: string): ParsedFunnelData[] => {
  const funnels = [];
  const funnelSections = text.split('**FUNNEL ').slice(1);
  
  for (let i = 0; i < Math.min(3, funnelSections.length); i++) {
    const section = funnelSections[i];
    const lines = section.split('\n').filter(line => line.trim());
    
    const nameMatch = lines[0]?.match(/^(\d+): (.+)\*\*/);
    const funnelName = nameMatch ? nameMatch[2] : `Funnel AI ${i + 1}`;
    
    const descriptionLine = lines.find(line => line.startsWith('Descrizione:'));
    const targetLine = lines.find(line => line.startsWith('Target:'));
    const industryLine = lines.find(line => line.startsWith('Industria:'));
    const strategyLine = lines.find(line => line.startsWith('Strategia:'));
    
    const stepLines = lines.filter(line => /^\d+\./.test(line.trim()));
    const steps = stepLines.map((step, index) => {
      const stepText = step.replace(/^\d+\.\s*/, '');
      const [title, ...descParts] = stepText.split(' - ');
      
      return {
        title: title.trim(),
        description: descParts.join(' - ').trim() || title.trim(),
        step_type: index === 0 ? 'lead_capture' : index === stepLines.length - 1 ? 'conversion' : 'qualification',
        is_required: index === 0,
        step_order: index + 1,
        form_fields: index === 0 ? [
          {
            id: 'email',
            type: 'email',
            label: 'Email',
            placeholder: 'Inserisci la tua email',
            required: true
          }
        ] : [
          {
            id: `field_${index}`,
            type: 'text',
            label: title.trim(),
            placeholder: `Inserisci ${title.trim().toLowerCase()}`,
            required: false
          }
        ],
        settings: {
          showProgressBar: true,
          allowBack: index > 0,
          submitButtonText: index === stepLines.length - 1 ? 'Invia' : 'Avanti',
          backgroundColor: '#ffffff',
          textColor: '#000000'
        }
      };
    });

    funnels.push({
      name: funnelName,
      description: descriptionLine ? descriptionLine.replace('Descrizione:', '').trim() : '',
      target_audience: targetLine ? targetLine.replace('Target:', '').trim() : '',
      industry: industryLine ? industryLine.replace('Industria:', '').trim() : '',
      strategy: strategyLine ? strategyLine.replace('Strategia:', '').trim() : '',
      steps: steps
    });
  }
  
  return funnels;
};
