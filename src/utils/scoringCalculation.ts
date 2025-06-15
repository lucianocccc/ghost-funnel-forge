
import { LeadScoringRule } from '@/types/leadScoring';

export const evaluateCondition = (value: any, operator: string, conditionValue: any): boolean => {
  switch (operator) {
    case 'less_than':
      return Number(value) < Number(conditionValue);
    case 'greater_than':
      return Number(value) > Number(conditionValue);
    case 'equals':
      return String(value).toLowerCase() === String(conditionValue).toLowerCase();
    case 'contains':
      return String(value).toLowerCase().includes(String(conditionValue).toLowerCase());
    default:
      return false;
  }
};

export const calculateScoreForRules = (leadData: any, rules: LeadScoringRule[]) => {
  const activeRules = rules.filter(rule => rule.is_active);
  let totalScore = 0;
  const breakdown: Record<string, any> = {};

  // Calculate scores based on rules
  for (const rule of activeRules) {
    let ruleScore = 0;
    let applies = false;

    switch (rule.rule_type) {
      case 'response_time':
        if (leadData.response_time_minutes !== null) {
          const value = leadData.response_time_minutes;
          applies = evaluateCondition(value, rule.condition_operator, parseInt(rule.condition_value));
        }
        break;
      case 'message_length':
        if (leadData.message_length !== null) {
          const value = leadData.message_length;
          applies = evaluateCondition(value, rule.condition_operator, parseInt(rule.condition_value));
        }
        break;
      case 'source':
        if (leadData.source) {
          applies = evaluateCondition(leadData.source, rule.condition_operator, rule.condition_value);
        }
        break;
    }

    if (applies) {
      ruleScore = rule.points;
      totalScore += ruleScore;
    }

    breakdown[rule.name] = {
      applies,
      points: ruleScore,
      rule_type: rule.rule_type
    };
  }

  return { totalScore, breakdown };
};
