import React from 'react';
import { useLeads } from '@/hooks/useLeads';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, ChevronRight, Brain, Loader2 } from 'lucide-react';

const LeadAnalysisView = () => {
  const { leads, loading, triggerAnalysis } = useLeads();
  const [selectedLead, setSelectedLead] = React.useState<any>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 border-2 border-golden animate-spin" />
      </div>
    );
  }

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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Lead <span className="text-golden">Analysis</span>
        </h1>
        <p className="text-gray-300">
          Analisi GPT dei tuoi potenziali clienti
        </p>
      </div>

      {/* Lista semplificata dei lead */}
      <div className="grid gap-4">
        {leads.map((lead) => (
          <Card 
            key={lead.id}
            className="bg-gray-800 border-gray-700 hover:border-golden cursor-pointer transition-colors"
            onClick={() => setSelectedLead(lead)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-golden rounded-full">
                    <User className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{lead.nome}</h3>
                    <p className="text-sm text-gray-300">{lead.servizio}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lead.gpt_analysis && (
                    <Badge variant="default" className="bg-green-600 text-white">
                      <Brain className="w-3 h-3 mr-1" />
                      Analizzato
                    </Badge>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modale per i dettagli del lead */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          triggerAnalysis={triggerAnalysis}
        />
      )}
    </div>
  );
};

// Componente modale per i dettagli del lead
const LeadDetailModal: React.FC<{
  lead: any;
  isOpen: boolean;
  onClose: () => void;
  triggerAnalysis: (lead: any) => void;
}> = ({ lead, isOpen, onClose, triggerAnalysis }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{lead.nome}</h2>
              <p className="text-gray-300">{lead.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {!lead.gpt_analysis && (
                <button
                  onClick={() => triggerAnalysis(lead)}
                  className="bg-golden hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  Analizza con GPT
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <LeadAnalysisTable lead={lead} />
        </div>
      </div>
    </div>
  );
};

// Componente per l'analisi in formato tabella
const LeadAnalysisTable: React.FC<{ lead: any }> = ({ lead }) => {
  if (!lead.gpt_analysis) {
    return (
      <div className="text-center py-8">
        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Analisi Non Disponibile</h3>
        <p className="text-gray-400">Questo lead non è ancora stato analizzato con GPT</p>
      </div>
    );
  }

  const analysis = lead.gpt_analysis;

  // Import dei componenti Table UI
  const { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } = require("@/components/ui/table");

  return (
    <div className="space-y-6">
      {/* Informazioni Base */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-golden mb-3">Informazioni Base</h3>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium text-gray-400 w-1/3">Nome:</TableCell>
              <TableCell className="text-white font-medium">{lead.nome}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-gray-400 w-1/3">Email:</TableCell>
              <TableCell className="text-white font-medium">{lead.email}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-gray-400 w-1/3">Servizio di Interesse:</TableCell>
              <TableCell className="text-white font-medium">{lead.servizio}</TableCell>
            </TableRow>
            {analysis.categoria_cliente && (
              <TableRow>
                <TableCell className="font-medium text-gray-400 w-1/3">Categoria Cliente:</TableCell>
                <TableCell className="text-white font-medium">{analysis.categoria_cliente}</TableCell>
              </TableRow>
            )}
            {analysis.priorita && (
              <TableRow>
                <TableCell className="font-medium text-gray-400 w-1/3">Priorità:</TableCell>
                <TableCell>
                  <Badge className={`ml-2 ${
                    analysis.priorita.toLowerCase() === 'alta' ? 'bg-red-500' :
                      analysis.priorita.toLowerCase() === 'media' ? 'bg-yellow-500' :
                        'bg-green-500'
                  }`}>
                    {analysis.priorita}
                  </Badge>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Analisi del Profilo */}
      {analysis.analisi_profilo && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Analisi del Profilo</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-gray-400 w-1/3">Analisi Dettagliata</TableCell>
                <TableCell className="text-white leading-relaxed">{analysis.analisi_profilo}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {/* Funnel Personalizzato */}
      {Array.isArray(analysis.funnel_personalizzato) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Funnel Personalizzato</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-left text-gray-400">Step</TableHead>
                <TableHead className="text-left text-gray-400">Azione Strategica</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.funnel_personalizzato.map((step: string, index: number) => (
                <TableRow key={index}>
                  <TableCell className="text-blue-400 font-bold">{index + 1}</TableCell>
                  <TableCell className="text-white">{step}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Strategie di Approccio */}
      {Array.isArray(analysis.strategie_approccio) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Strategie di Approccio</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 text-left text-gray-400">#</TableHead>
                <TableHead className="text-left text-gray-400">Strategia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.strategie_approccio.map((strategia: string, index: number) => (
                <TableRow key={index}>
                  <TableCell className="text-golden">{index + 1}</TableCell>
                  <TableCell className="text-white">{strategia}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Punti di Dolore */}
      {Array.isArray(analysis.punti_dolore) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Punti di Dolore Identificati</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 text-left text-gray-400">#</TableHead>
                <TableHead className="text-left text-gray-400">Punto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.punti_dolore.map((punto: string, index: number) => (
                <TableRow key={index}>
                  <TableCell className="text-red-400">{index + 1}</TableCell>
                  <TableCell className="text-white">{punto}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Opportunità */}
      {Array.isArray(analysis.opportunita) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Opportunità di Business</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8 text-left text-gray-400">#</TableHead>
                <TableHead className="text-left text-gray-400">Opportunità</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.opportunita.map((opp: string, index: number) => (
                <TableRow key={index}>
                  <TableCell className="text-green-400">{index + 1}</TableCell>
                  <TableCell className="text-white">{opp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Prossimi Passi */}
      {Array.isArray(analysis.next_steps) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Piano d'Azione</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 text-left text-gray-400">Priorità</TableHead>
                <TableHead className="text-left text-gray-400">Azione</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.next_steps.map((step: string, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge className={`
                      ${index === 0 ? 'bg-red-500 text-white' :
                        index === 1 ? 'bg-orange-500 text-white' :
                          'bg-yellow-500 text-white'}
                      font-bold
                    `}>
                      {index === 0 ? 'ALTA' : index === 1 ? 'MEDIA' : 'BASSA'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">{step}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Bio se presente */}
      {lead.bio && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Biografia</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-gray-400 w-1/3">Bio</TableCell>
                <TableCell className="text-white leading-relaxed">{lead.bio}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default LeadAnalysisView;
