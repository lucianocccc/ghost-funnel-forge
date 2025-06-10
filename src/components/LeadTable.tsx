
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import LeadRow from './LeadRow';
import { LeadAnalysis } from '@/hooks/useLeads';

interface LeadTableProps {
  leads: LeadAnalysis[];
  onAnalyze: (lead: LeadAnalysis) => void;
}

const LeadTable: React.FC<LeadTableProps> = ({ leads, onAnalyze }) => {
  if (leads.length === 0) {
    return (
      <Card className="bg-white border-golden border">
        <CardContent className="text-center py-8">
          <Brain className="w-12 h-12 text-golden mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">Nessun Lead Presente</h3>
          <p className="text-gray-600">I lead verranno visualizzati qui quando verranno creati</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {leads.map((lead) => (
        <LeadRow
          key={lead.id}
          lead={lead}
          onAnalyze={onAnalyze}
        />
      ))}
    </div>
  );
};

export default LeadTable;
