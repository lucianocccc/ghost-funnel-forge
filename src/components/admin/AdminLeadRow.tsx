
import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLead } from '@/hooks/useAdminLeads';
import { Brain, Eye, Zap, Loader2, ExternalLink, Calculator, Target, Star, TrendingUp, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useLeadScoring } from '@/hooks/useLeadScoring';
import FunnelTemplateSelector from '@/components/FunnelTemplateSelector';

interface AdminLeadRowProps {
  lead: AdminLead;
  onStatusChange: (leadId: string, newStatus: AdminLead['status']) => void;
  onAnalyze: (lead: AdminLead) => void;
  onSendEmail: (lead: AdminLead) => void;
  onCreateOffer: (lead: AdminLead) => void;
  isAnalyzing?: boolean;
}

const AdminLeadRow: React.FC<AdminLeadRowProps> = ({ 
  lead, 
  onStatusChange, 
  onAnalyze,
  onSendEmail,
  onCreateOffer,
  isAnalyzing = false 
}) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const { scores, calculateLeadScore } = useLeadScoring();
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);

  const leadScore = scores.find(score => score.lead_id === lead.id);

  const getStatusBadge = (status: AdminLead['status']) => {
    const statusConfig = {
      nuovo: { label: 'Nuovo', variant: 'default' as const },
      contattato: { label: 'Contattato', variant: 'secondary' as const },
      in_trattativa: { label: 'In Trattativa', variant: 'outline' as const },
      chiuso_vinto: { label: 'Chiuso Vinto', variant: 'default' as const },
      chiuso_perso: { label: 'Chiuso Perso', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return 'bg-red-500 text-white';
      case 'media': return 'bg-yellow-500 text-white';
      case 'bassa': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return <AlertTriangle className="w-4 h-4" />;
      case 'media': return <TrendingUp className="w-4 h-4" />;
      case 'bassa': return <CheckCircle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const handleCalculateScore = async () => {
    setIsCalculatingScore(true);
    try {
      await calculateLeadScore(lead.id);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsCalculatingScore(false);
    }
  };

  const handleFunnelCreated = () => {
    // Refresh leads or show success message
    console.log('Funnel created for lead:', lead.id);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'default' as const, label: 'Alto' };
    if (score >= 50) return { variant: 'secondary' as const, label: 'Medio' };
    if (score >= 20) return { variant: 'outline' as const, label: 'Basso' };
    return { variant: 'destructive' as const, label: 'Molto Basso' };
  };

  return (
    <>
      <TableRow>
        <TableCell className="font-medium text-white">{lead.nome}</TableCell>
        <TableCell className="text-gray-300">{lead.email}</TableCell>
        <TableCell className="text-gray-300">{lead.servizio}</TableCell>
        <TableCell>{getStatusBadge(lead.status)}</TableCell>
        <TableCell className="text-gray-300">
          {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-1">
            {lead.gpt_analysis ? (
              <Badge variant="default" className="bg-green-600">
                Analizzato
              </Badge>
            ) : (
              <Badge variant="secondary">
                Non Analizzato
              </Badge>
            )}
            {leadScore ? (
              <Badge {...getScoreBadge(leadScore.total_score)} className="text-xs">
                {leadScore.total_score} punti
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                Non Valutato
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={lead.status}
              onValueChange={(value) => onStatusChange(lead.id, value as AdminLead['status'])}
            >
              <SelectTrigger className="w-32">
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

            <Button
              size="sm"
              variant="outline"
              onClick={() => onAnalyze(lead)}
              disabled={isAnalyzing}
              className="text-white border-gray-600 hover:bg-gray-800"
              title="Analizza con GPT"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCalculateScore}
              disabled={isCalculatingScore}
              className="text-white border-gray-600 hover:bg-gray-800"
              title="Calcola Punteggio"
            >
              {isCalculatingScore ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Calculator className="w-4 h-4" />
              )}
            </Button>

            {lead.gpt_analysis && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="text-white border-gray-600 hover:bg-gray-800"
                title="Mostra Analisi"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}

            {leadScore && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowScore(!showScore)}
                className="text-white border-gray-600 hover:bg-gray-800"
                title="Dettagli Punteggio"
              >
                <Target className="w-4 h-4" />
              </Button>
            )}

            <FunnelTemplateSelector 
              leadId={lead.id} 
              onFunnelCreated={handleFunnelCreated}
            />

            <Button
              size="sm"
              variant="outline"
              asChild
              className="text-white border-gray-600 hover:bg-gray-800"
              title="Vai ai Funnel"
            >
              <a href={`/funnels`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {showAnalysis && lead.gpt_analysis && (
        <TableRow>
          <TableCell colSpan={7} className="bg-gray-900 p-6">
            <Card className="bg-black border-golden">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-golden">
                  <Brain className="w-6 h-6" />
                  Analisi GPT Completa
                  {lead.gpt_analysis.priorita && (
                    <Badge className={`${getPriorityColor(lead.gpt_analysis.priorita)} px-3 py-1 flex items-center gap-1 ml-auto`}>
                      {getPriorityIcon(lead.gpt_analysis.priorita)}
                      Priorità {lead.gpt_analysis.priorita}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tabella Profilo Cliente */}
                {(lead.gpt_analysis.categoria_cliente || lead.gpt_analysis.analisi_profilo) && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                      <Target className="w-5 h-5 text-golden" />
                      Profilo Cliente
                    </h4>
                    <Table>
                      <TableBody>
                        {lead.gpt_analysis.categoria_cliente && (
                          <TableRow>
                            <TableCell className="font-medium text-gray-300 w-1/3">Categoria</TableCell>
                            <TableCell className="text-white font-semibold">{lead.gpt_analysis.categoria_cliente}</TableCell>
                          </TableRow>
                        )}
                        {lead.gpt_analysis.analisi_profilo && (
                          <TableRow>
                            <TableCell className="font-medium text-gray-300 w-1/3">Analisi Dettagliata</TableCell>
                            <TableCell className="text-white">{lead.gpt_analysis.analisi_profilo}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Tabella Funnel Personalizzato */}
                {lead.gpt_analysis.funnel_personalizzato && (
                  <div className="bg-blue-900/50 rounded-lg p-4">
                    <h4 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                      Strategia Funnel Consigliata
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16 text-gray-300">Step</TableHead>
                          <TableHead className="text-gray-300">Azione Strategica</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lead.gpt_analysis.funnel_personalizzato.map((step: string, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-800 text-blue-200 border-blue-600 font-bold">
                                {index + 1}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-white font-medium">{step}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Tabella Opportunità */}
                {lead.gpt_analysis.opportunita && (
                  <div className="bg-green-900/50 rounded-lg p-4">
                    <h4 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                      <Lightbulb className="w-5 h-5 text-green-400" />
                      Opportunità di Business
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16 text-gray-300">Rank</TableHead>
                          <TableHead className="text-gray-300">Opportunità Identificata</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lead.gpt_analysis.opportunita.map((opp: string, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-golden fill-golden" />
                                <span className="font-bold text-golden">{index + 1}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-white font-medium">{opp}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Tabella Prossimi Passi */}
                {lead.gpt_analysis.next_steps && (
                  <div className="bg-orange-900/50 rounded-lg p-4">
                    <h4 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                      Piano d'Azione Consigliato
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20 text-gray-300">Priorità</TableHead>
                          <TableHead className="text-gray-300">Azione Richiesta</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lead.gpt_analysis.next_steps.map((step: string, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Badge 
                                className={`
                                  ${index === 0 ? 'bg-red-500 text-white' : 
                                    index === 1 ? 'bg-orange-500 text-white' : 
                                    'bg-yellow-500 text-white'} 
                                  font-bold
                                `}
                              >
                                {index === 0 ? 'ALTA' : index === 1 ? 'MEDIA' : 'BASSA'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-white font-medium">{step}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {lead.analyzed_at && (
                  <p className="text-sm text-gray-400 text-center mt-4">
                    Analisi completata il: {format(new Date(lead.analyzed_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                  </p>
                )}
              </CardContent>
            </Card>
          </TableCell>
        </TableRow>
      )}

      {showScore && leadScore && (
        <TableRow>
          <TableCell colSpan={7} className="bg-gray-900 p-4">
            <div className="text-white space-y-3">
              <h4 className="font-semibold text-golden flex items-center gap-2">
                <Target className="w-4 h-4" />
                Dettagli Punteggio ({leadScore.total_score} punti)
              </h4>
              <div className="bg-black p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(leadScore.score_breakdown).map(([ruleName, details]: [string, any]) => (
                    <div key={ruleName} className="p-3 bg-gray-800 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{ruleName}</span>
                        <Badge variant={details.applies ? "default" : "secondary"}>
                          {details.applies ? `+${details.points}` : '0'} punti
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Tipo: {details.rule_type} | Applicata: {details.applies ? 'Sì' : 'No'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Calcolato il: {format(new Date(leadScore.calculated_at), 'dd/MM/yyyy HH:mm', { locale: it })}
              </p>
              {leadScore.motivation && (
                <div className="mt-3">
                  <h5 className="font-medium text-golden mb-2">Motivazione:</h5>
                  <p className="text-gray-300">{leadScore.motivation}</p>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default AdminLeadRow;
