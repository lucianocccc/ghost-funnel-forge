
import React from 'react';

interface LeadData {
  interesse_iniziale?: string;
  ruolo_aziendale?: string;
  dimensione_business?: string;
  principale_sfida?: string;
  timeline_implementazione?: string;
  budget_indicativo?: string;
  [key: string]: any;
}

interface LeadScore {
  total: number;
  breakdown: {
    interest: number;
    authority: number;
    need: number;
    timing: number;
    budget: number;
  };
  qualification: 'hot' | 'warm' | 'cold';
  insights: string[];
}

export class LeadScoringEngine {
  static calculateScore(leadData: LeadData): LeadScore {
    let score = 0;
    const breakdown = {
      interest: 0,
      authority: 0,
      need: 0,
      timing: 0,
      budget: 0
    };
    const insights: string[] = [];

    // Interest Level (0-25 points)
    const interesse = leadData.interesse_iniziale;
    if (interesse?.includes('Aumentare l\'efficienza')) {
      breakdown.interest = 25;
      insights.push('Alto interesse per l\'efficienza operativa');
    } else if (interesse?.includes('Ridurre i costi')) {
      breakdown.interest = 20;
      insights.push('Focalizzato sulla riduzione dei costi');
    } else if (interesse?.includes('Risparmiare tempo')) {
      breakdown.interest = 18;
      insights.push('Interessato al risparmio di tempo');
    } else if (interesse?.includes('Migliorare la qualità')) {
      breakdown.interest = 15;
      insights.push('Interessato al miglioramento qualitativo');
    }

    // Authority Level (0-25 points)
    const ruolo = leadData.ruolo_aziendale;
    if (ruolo?.includes('Proprietario') || ruolo?.includes('CEO')) {
      breakdown.authority = 25;
      insights.push('Decision maker principale');
    } else if (ruolo?.includes('Direttore') || ruolo?.includes('Manager')) {
      breakdown.authority = 20;
      insights.push('Ruolo manageriale con autorità decisionale');
    } else if (ruolo?.includes('Responsabile')) {
      breakdown.authority = 15;
      insights.push('Responsabile operativo');
    } else {
      breakdown.authority = 5;
      insights.push('Potrebbe necessitare approvazione superiore');
    }

    // Need Assessment (0-20 points)
    const sfida = leadData.principale_sfida?.toLowerCase() || '';
    if (sfida.includes('urgent') || sfida.includes('problema') || sfida.includes('difficoltà')) {
      breakdown.need = 20;
      insights.push('Necessità urgente identificata');
    } else if (sfida.length > 50) {
      breakdown.need = 15;
      insights.push('Sfida ben articolata, bisogno chiaro');
    } else if (sfida.length > 20) {
      breakdown.need = 10;
      insights.push('Bisogno presente ma non urgente');
    }

    // Timing (0-20 points)
    const timeline = leadData.timeline_implementazione;
    if (timeline?.includes('Immediatamente')) {
      breakdown.timing = 20;
      insights.push('Pronto per implementazione immediata');
    } else if (timeline?.includes('1 mese')) {
      breakdown.timing = 15;
      insights.push('Timeline a breve termine');
    } else if (timeline?.includes('3 mesi')) {
      breakdown.timing = 10;
      insights.push('Timeline medio termine');
    } else if (timeline?.includes('6 mesi')) {
      breakdown.timing = 5;
      insights.push('Timeline lungo termine');
    } else {
      breakdown.timing = 2;
      insights.push('Solo in fase esplorativa');
    }

    // Budget (0-10 points)
    const budget = leadData.budget_indicativo;
    if (budget?.includes('Oltre €2500')) {
      breakdown.budget = 10;
      insights.push('Budget elevato disponibile');
    } else if (budget?.includes('€1000-2500')) {
      breakdown.budget = 8;
      insights.push('Budget medio-alto');
    } else if (budget?.includes('€500-1000')) {
      breakdown.budget = 6;
      insights.push('Budget medio');
    } else if (budget?.includes('Sotto €500')) {
      breakdown.budget = 3;
      insights.push('Budget limitato');
    } else {
      breakdown.budget = 0;
      insights.push('Budget non specificato');
    }

    // Calculate total
    score = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    // Determine qualification
    let qualification: 'hot' | 'warm' | 'cold';
    if (score >= 70) {
      qualification = 'hot';
      insights.push('🔥 LEAD CALDO - Priorità alta per follow-up');
    } else if (score >= 40) {
      qualification = 'warm';
      insights.push('🟡 LEAD TIEPIDO - Buon potenziale');
    } else {
      qualification = 'cold';
      insights.push('🔵 LEAD FREDDO - Nurturing richiesto');
    }

    return {
      total: score,
      breakdown,
      qualification,
      insights
    };
  }

  static generateFollowUpStrategy(score: LeadScore, leadData: LeadData): {
    priority: 'immediate' | 'within_24h' | 'within_week' | 'nurture';
    approach: string;
    messageTemplate: string;
  } {
    const nome = leadData.nome || 'Cliente';
    
    if (score.qualification === 'hot') {
      return {
        priority: 'immediate',
        approach: 'Chiamata diretta entro 2 ore',
        messageTemplate: `Ciao ${nome}, ho visto il tuo interesse per la nostra soluzione. Sono disponibile per una chiamata oggi stesso per discutere come possiamo aiutarti immediatamente.`
      };
    } else if (score.qualification === 'warm') {
      return {
        priority: 'within_24h',
        approach: 'Email personalizzata + chiamata programmata',
        messageTemplate: `Ciao ${nome}, grazie per il tuo interesse. Ti invio alcune informazioni aggiuntive e ti contatterò domani per discutere come possiamo supportare la tua attività.`
      };
    } else {
      return {
        priority: 'nurture',
        approach: 'Sequenza email educativa',
        messageTemplate: `Ciao ${nome}, ti ringrazio per l'interesse. Ti invierò del materiale utile per il tuo business e resterò disponibile per quando sarai pronto ad approfondire.`
      };
    }
  }
}

export default LeadScoringEngine;
