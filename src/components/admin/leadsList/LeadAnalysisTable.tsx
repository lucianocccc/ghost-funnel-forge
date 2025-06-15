
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';
import { AdminLead } from '@/hooks/useAdminLeads';

const LeadAnalysisTable: React.FC<{ lead: AdminLead }> = ({ lead }) => {
  if (!lead.gpt_analysis) {
    return (
      <div className="text-center py-8">
        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Questo lead non è ancora stato analizzato</p>
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
                'bg-green-500'}`}>
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
    </div>
  );
};

export default LeadAnalysisTable;
