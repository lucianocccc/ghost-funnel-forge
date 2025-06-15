
import React from 'react';
import { useLeads } from '@/hooks/useLeads';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, ChevronRight, Brain, Loader2 } from 'lucide-react';
// Rimossi Table/TableX import: ora sono usati nei componenti estratti

// Import dei nuovi componenti estratti
import LeadDetailModal from './leadAnalysis/LeadDetailModal';

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

export default LeadAnalysisView;
