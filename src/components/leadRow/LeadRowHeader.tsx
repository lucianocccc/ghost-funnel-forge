
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, User } from 'lucide-react';
import { LeadAnalysis } from '@/hooks/useLeads';

interface LeadRowHeaderProps {
  lead: LeadAnalysis;
  onAnalyze: (lead: LeadAnalysis) => void;
}

const LeadRowHeader: React.FC<LeadRowHeaderProps> = ({ lead, onAnalyze }) => {
  return (
    <CardHeader className="bg-gradient-to-r from-golden/10 to-yellow-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-golden rounded-full">
            <User className="w-5 h-5 text-black" />
          </div>
          <div>
            <CardTitle className="text-xl text-black">{lead.nome}</CardTitle>
            <p className="text-sm text-gray-600 font-medium">{lead.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lead.gpt_analysis ? (
            <Badge className="bg-green-600 text-white px-3 py-1">
              <Brain className="w-4 h-4 mr-2" />
              Analizzato
            </Badge>
          ) : (
            <Button
              onClick={() => onAnalyze(lead)}
              className="bg-golden hover:bg-yellow-600 text-black font-semibold px-4 py-2"
            >
              <Brain className="w-4 h-4 mr-2" />
              Analizza con GPT
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  );
};

export default LeadRowHeader;
