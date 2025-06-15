
import { LeadScoringRule } from '@/types/leadScoring';

interface LeadData {
  nome?: string;
  email?: string;
  servizio?: string;
  bio?: string;
  source?: string;
  response_time_minutes?: number;
  message_length?: number;
}

export const calculateScoreForRules = (
  leadData: LeadData, 
  rules: LeadScoringRule[]
): { totalScore: number; breakdown: Record<string, any> } => {
  let totalScore = 0;
  const breakdown: Record<string, any> = {};

  rules.filter(rule => rule.is_active).forEach(rule => {
    let ruleApplies = false;
    const value = getValueFromLead(leadData, rule.rule_type);

    switch (rule.condition_operator) {
      case 'equals':
        ruleApplies = String(value).toLowerCase() === rule.condition_value.toLowerCase();
        break;
      case 'contains':
        ruleApplies = String(value).toLowerCase().includes(rule.condition_value.toLowerCase());
        break;
      case 'greater_than':
        ruleApplies = Number(value) > Number(rule.condition_value);
        break;
      case 'less_than':
        ruleApplies = Number(value) < Number(rule.condition_value);
        break;
    }

    if (ruleApplies) {
      totalScore += rule.points;
      breakdown[rule.name] = {
        points: rule.points,
        reason: `${rule.rule_type} ${rule.condition_operator} ${rule.condition_value}`
      };
    }
  });

  return { totalScore, breakdown };
};

const getValueFromLead = (leadData: LeadData, ruleType: string): any => {
  switch (ruleType) {
    case 'response_time':
      return leadData.response_time_minutes || 0;
    case 'message_length':
      return leadData.message_length || leadData.bio?.length || 0;
    case 'source':
      return leadData.source || 'website';
    case 'tone':
      // This would need to be analyzed by AI - for now return neutral
      return 'neutral';
    default:
      return '';
  }
};
