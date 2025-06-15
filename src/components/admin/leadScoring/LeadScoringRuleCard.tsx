
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { LeadScoringRule } from '@/types/leadScoring';

interface LeadScoringRuleCardProps {
  rule: LeadScoringRule;
  onEdit: (rule: LeadScoringRule) => void;
  onDelete: (id: string) => void;
}

const LeadScoringRuleCard: React.FC<LeadScoringRuleCardProps> = ({
  rule,
  onEdit,
  onDelete
}) => {
  const getRuleTypeLabel = (type: string) => {
    const labels = {
      response_time: 'Tempo di Risposta',
      message_length: 'Lunghezza Messaggio',
      source: 'Fonte',
      tone: 'Tono'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getOperatorLabel = (operator: string) => {
    const labels = {
      less_than: 'Minore di',
      greater_than: 'Maggiore di',
      equals: 'Uguale a',
      contains: 'Contiene'
    };
    return labels[operator as keyof typeof labels] || operator;
  };

  return (
    <div className="border border-gray-700 rounded-lg p-4 bg-gray-900">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-white">{rule.name}</h3>
            <Badge variant={rule.is_active ? "default" : "secondary"}>
              {rule.is_active ? 'Attiva' : 'Inattiva'}
            </Badge>
            <Badge variant="outline" className="text-white">
              {rule.points > 0 ? '+' : ''}{rule.points} punti
            </Badge>
          </div>
          {rule.description && (
            <p className="text-gray-400 text-sm mb-2">{rule.description}</p>
          )}
          <div className="text-sm text-gray-300">
            <span className="font-medium">{getRuleTypeLabel(rule.rule_type)}</span>
            {' '}
            <span>{getOperatorLabel(rule.condition_operator)}</span>
            {' '}
            <span className="font-mono bg-gray-800 px-2 py-1 rounded">
              {rule.condition_value}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(rule)}
            className="text-white border-gray-600 hover:bg-gray-800"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(rule.id)}
            className="text-red-400 border-red-600 hover:bg-red-900"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadScoringRuleCard;
