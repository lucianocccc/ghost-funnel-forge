
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

  return (
    <div className="space-y-6">
      {/* Informazioni Base */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-golden mb-3">Informazioni Base</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-400">Nome:</span>
            <p className="text-white font-medium">{lead.nome}</p>
          </div>
          <div>
            <span className="text-sm text-gray-400">Email:</span>
            <p className="text-white font-medium">{lead.email}</p>
          </div>
          <div>
            <span className="text-sm text-gray-400">Servizio di Interesse:</span>
            <p className="text-white font-medium">{lead.servizio}</p>
          </div>
          {analysis.categoria_cliente && (
            <div>
              <span className="text-sm text-gray-400">Categoria Cliente:</span>
              <p className="text-white font-medium">{analysis.categoria_cliente}</p>
            </div>
          )}
          {analysis.priorita && (
            <div>
              <span className="text-sm text-gray-400">Priorità:</span>
              <Badge className={`ml-2 ${
                analysis.priorita.toLowerCase() === 'alta' ? 'bg-red-500' :
                analysis.priorita.toLowerCase() === 'media' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}>
                {analysis.priorita}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Analisi del Profilo */}
      {analysis.analisi_profilo && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Analisi del Profilo</h3>
          <p className="text-white leading-relaxed">{analysis.analisi_profilo}</p>
        </div>
      )}

      {/* Funnel Personalizzato */}
      {analysis.funnel_personalizzato && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Funnel Personalizzato</h3>
          <div className="space-y-2">
            {analysis.funnel_personalizzato.map((step: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">
                  {index + 1}
                </div>
                <p className="text-white flex-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategie di Approccio */}
      {analysis.strategie_approccio && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Strategie di Approccio</h3>
          <ul className="space-y-2">
            {analysis.strategie_approccio.map((strategia: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-golden mt-1">•</span>
                <p className="text-white">{strategia}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Punti di Dolore */}
      {analysis.punti_dolore && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Punti di Dolore Identificati</h3>
          <ul className="space-y-2">
            {analysis.punti_dolore.map((punto: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-400 mt-1">⚠</span>
                <p className="text-white">{punto}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Opportunità */}
      {analysis.opportunita && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Opportunità di Business</h3>
          <ul className="space-y-2">
            {analysis.opportunita.map((opp: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-400 mt-1">💡</span>
                <p className="text-white">{opp}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prossimi Passi */}
      {analysis.next_steps && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Piano d'Azione</h3>
          <div className="space-y-2">
            {analysis.next_steps.map((step: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <Badge className={`${
                  index === 0 ? 'bg-red-500' :
                  index === 1 ? 'bg-orange-500' :
                  'bg-yellow-500'
                } text-white font-bold`}>
                  {index === 0 ? 'ALTA' : index === 1 ? 'MEDIA' : 'BASSA'}
                </Badge>
                <p className="text-white flex-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bio se presente */}
      {lead.bio && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-golden mb-3">Biografia</h3>
          <p className="text-white leading-relaxed">{lead.bio}</p>
        </div>
      )}
    </div>
  );
};

export default LeadAnalysisView;
