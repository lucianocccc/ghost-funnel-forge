
import React from 'react';
import { Calculator } from 'lucide-react';
import { LeadScoringRule } from '@/types/leadScoring';
import LeadScoringRuleCard from './LeadScoringRuleCard';

interface LeadScoringRulesListProps {
  rules: LeadScoringRule[];
  onEdit: (rule: LeadScoringRule) => void;
  onDelete: (id: string) => void;
}

const LeadScoringRulesList: React.FC<LeadScoringRulesListProps> = ({
  rules,
  onEdit,
  onDelete
}) => {
  if (rules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nessuna regola di scoring configurata</p>
        <p className="text-sm">Crea la prima regola per iniziare a valutare i lead</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <LeadScoringRuleCard
          key={rule.id}
          rule={rule}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default LeadScoringRulesList;
