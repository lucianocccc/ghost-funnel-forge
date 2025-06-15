
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LeadAnalysis } from '@/hooks/useLeads';
import LeadRowHeader from './leadRow/LeadRowHeader';
import LeadRowBaseInfo from './leadRow/LeadRowBaseInfo';
import LeadRowAnalysisDisplay from './leadRow/LeadRowAnalysisDisplay';

interface LeadRowProps {
  lead: LeadAnalysis;
  onAnalyze: (lead: LeadAnalysis) => void;
}

const LeadRow: React.FC<LeadRowProps> = ({ lead, onAnalyze }) => {
  return (
    <Card className="bg-white border-golden border-2 shadow-lg">
      <LeadRowHeader lead={lead} onAnalyze={onAnalyze} />
      <CardContent className="p-6">
        <LeadRowBaseInfo lead={lead} />
        <LeadRowAnalysisDisplay lead={lead} />
      </CardContent>
    </Card>
  );
};

export default LeadRow;
