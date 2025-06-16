
import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLead } from '@/hooks/useAdminLeads';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useLeadScoring } from '@/hooks/useLeadScoring';
import LeadStatusBadge from './LeadStatusBadge';
import LeadActionButtons from './LeadActionButtons';
import LeadAnalysisExpanded from './LeadAnalysisExpanded';
import LeadScoreExpanded from './LeadScoreExpanded';

interface AdminLeadRowBaseProps {
  lead: AdminLead;
  onStatusChange: (leadId: string, newStatus: AdminLead['status']) => void;
  onAnalyze: (lead: AdminLead) => void;
  onSendEmail: (lead: AdminLead) => void;
  onCreateOffer: (lead: AdminLead) => void;
  isAnalyzing?: boolean;
}

const AdminLeadRowBase: React.FC<AdminLeadRowBaseProps> = ({ 
  lead, 
  onStatusChange, 
  onAnalyze,
  onSendEmail,
  onCreateOffer,
  isAnalyzing = false 
}) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const { scores } = useLeadScoring();

  const leadScore = scores.find(score => score.lead_id === lead.id);

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'default' as const, label: 'Alto' };
    if (score >= 50) return { variant: 'secondary' as const, label: 'Medio' };
    if (score >= 20) return { variant: 'outline' as const, label: 'Basso' };
    return { variant: 'destructive' as const, label: 'Molto Basso' };
  };

  return (
    <>
      <TableRow className="text-sm md:text-base">
        <TableCell className="font-medium text-white p-2 md:p-4">
          <div>
            <div className="truncate">{lead.nome}</div>
            <div className="text-xs text-gray-400 md:hidden truncate">{lead.email}</div>
          </div>
        </TableCell>
        <TableCell className="text-gray-300 hidden md:table-cell">{lead.email}</TableCell>
        <TableCell className="text-gray-300 p-2 md:p-4">
          <div className="truncate text-xs md:text-sm">{lead.servizio}</div>
        </TableCell>
        <TableCell className="p-2 md:p-4">
          <LeadStatusBadge status={lead.status} />
        </TableCell>
        <TableCell className="text-gray-300 hidden lg:table-cell text-xs">
          {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}
        </TableCell>
        <TableCell className="p-2 md:p-4">
          <div className="flex flex-col gap-1">
            {lead.gpt_analysis ? (
              <Badge variant="default" className="bg-green-600 text-xs">
                <span className="hidden md:inline">Analizzato</span>
                <span className="md:hidden">✓</span>
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <span className="hidden md:inline">Non Analizzato</span>
                <span className="md:hidden">-</span>
              </Badge>
            )}
            {leadScore ? (
              <Badge {...getScoreBadge(leadScore.total_score)} className="text-xs">
                {leadScore.total_score}
                <span className="hidden md:inline ml-1">punti</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <span className="hidden md:inline">Non Valutato</span>
                <span className="md:hidden">?</span>
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="p-2 md:p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <Select
              value={lead.status}
              onValueChange={(value) => onStatusChange(lead.id, value as AdminLead['status'])}
            >
              <SelectTrigger className="w-full md:w-32 text-xs md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nuovo">Nuovo</SelectItem>
                <SelectItem value="contattato">Contattato</SelectItem>
                <SelectItem value="in_trattativa">In Trattativa</SelectItem>
                <SelectItem value="chiuso_vinto">Chiuso Vinto</SelectItem>
                <SelectItem value="chiuso_perso">Chiuso Perso</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-full md:w-auto">
              <LeadActionButtons
                lead={lead}
                onAnalyze={onAnalyze}
                onShowAnalysis={() => setShowAnalysis(!showAnalysis)}
                onShowScore={() => setShowScore(!showScore)}
                isAnalyzing={isAnalyzing}
                leadScore={leadScore}
              />
            </div>
          </div>
        </TableCell>
      </TableRow>

      {showAnalysis && <LeadAnalysisExpanded lead={lead} />}
      {showScore && leadScore && <LeadScoreExpanded leadScore={leadScore} />}
    </>
  );
};

export default AdminLeadRowBase;
