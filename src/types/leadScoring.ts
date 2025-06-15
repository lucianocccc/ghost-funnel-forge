
export interface LeadScoringRule {
  id: string;
  name: string;
  description?: string;
  rule_type: 'response_time' | 'message_length' | 'source' | 'tone';
  condition_operator: 'less_than' | 'greater_than' | 'equals' | 'contains';
  condition_value: string;
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadScore {
  id: string;
  lead_id: string;
  total_score: number;
  score_breakdown: Record<string, any>;
  motivation?: string;
  tone_analysis?: Record<string, any>;
  calculated_at: string;
}

export interface CreateRuleData extends Omit<LeadScoringRule, 'id' | 'created_at' | 'updated_at'> {}

export interface UpdateRuleData extends Partial<LeadScoringRule> {}
