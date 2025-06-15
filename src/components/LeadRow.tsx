
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Brain, User, Target, Lightbulb, AlertTriangle, CheckCircle, Star, TrendingUp } from 'lucide-react';
import { LeadAnalysis } from '@/hooks/useLeads';

interface LeadRowProps {
  lead: LeadAnalysis;
  onAnalyze: (lead: LeadAnalysis) => void;
}

const LeadRow: React.FC<LeadRowProps> = ({ lead, onAnalyze }) => {
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

  return (
    <Card className="bg-white border-golden border-2 shadow-lg">
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

      <CardContent className="p-6">
        <div className="mb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-golden/20">
                <TableHead className="font-semibold text-gray-700">Informazioni Base</TableHead>
                <TableHead className="font-semibold text-gray-700">Dettagli</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-gray-600">Servizio di Interesse</TableCell>
                <TableCell className="text-black font-semibold">{lead.servizio}</TableCell>
              </TableRow>
              {lead.bio && (
                <TableRow>
                  <TableCell className="font-medium text-gray-600">Biografia</TableCell>
                  <TableCell className="text-black">{lead.bio}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {lead.gpt_analysis && (
          <div className="space-y-6 border-t border-golden/20 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-golden rounded-full">
                <Brain className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-xl font-bold text-black">Analisi Intelligente GPT</h3>
              {lead.gpt_analysis.priorita && (
                <Badge className={`${getPriorityColor(lead.gpt_analysis.priorita)} px-3 py-1 flex items-center gap-1`}>
                  {getPriorityIcon(lead.gpt_analysis.priorita)}
                  Priorità {lead.gpt_analysis.priorita}
                </Badge>
              )}
            </div>

            {/* Tabella Analisi del Profilo */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="flex items-center gap-2 text-lg font-semibold text-black mb-3">
                <Target className="w-5 h-5 text-golden" />
                Profilo Cliente
              </h4>
              <Table>
                <TableBody>
                  {lead.gpt_analysis.categoria_cliente && (
                    <TableRow>
                      <TableCell className="font-medium text-gray-600 w-1/3">Categoria</TableCell>
                      <TableCell className="text-black font-semibold">{lead.gpt_analysis.categoria_cliente}</TableCell>
                    </TableRow>
                  )}
                  {lead.gpt_analysis.analisi_profilo && (
                    <TableRow>
                      <TableCell className="font-medium text-gray-600 w-1/3">Analisi Dettagliata</TableCell>
                      <TableCell className="text-black">{lead.gpt_analysis.analisi_profilo}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Tabella Funnel Personalizzato */}
            {lead.gpt_analysis.funnel_personalizzato && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-black mb-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Strategia Funnel Consigliata
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Step</TableHead>
                      <TableHead>Azione Strategica</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lead.gpt_analysis.funnel_personalizzato.map((step: string, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 font-bold">
                            {index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-black font-medium">{step}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Tabella Opportunità */}
            {lead.gpt_analysis.opportunita && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-black mb-3">
                  <Lightbulb className="w-5 h-5 text-green-600" />
                  Opportunità di Business
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Opportunità Identificata</TableHead>
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
                        <TableCell className="text-black font-medium">{opp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Tabella Prossimi Passi */}
            {lead.gpt_analysis.next_steps && (
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-black mb-3">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Piano d'Azione Consigliato
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Priorità</TableHead>
                      <TableHead>Azione Richiesta</TableHead>
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
                        <TableCell className="text-black font-medium">{step}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadRow;
