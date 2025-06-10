
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, User, Target, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LeadAnalysis {
  id: string;
  nome: string;
  email: string;
  servizio: string;
  bio: string;
  gpt_analysis: any;
  analyzed_at: string;
  created_at: string;
}

const LeadAnalysisView = () => {
  const [leads, setLeads] = useState<LeadAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        toast({
          title: "Errore",
          description: "Errore nel caricamento dei leads",
          variant: "destructive",
        });
        return;
      }

      setLeads(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async (lead: LeadAnalysis) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-lead', {
        body: { 
          leadData: {
            nome: lead.nome,
            email: lead.email,
            servizio: lead.servizio,
            bio: lead.bio
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Analisi Completata",
        description: "Il lead è stato rianalizzato con GPT",
      });

      fetchLeads(); // Refresh data
    } catch (error) {
      console.error('Error triggering analysis:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'analisi",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'bassa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
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

      <div className="grid gap-6">
        {leads.map((lead) => (
          <Card key={lead.id} className="bg-white border-golden border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-golden" />
                  <div>
                    <CardTitle className="text-black">{lead.nome}</CardTitle>
                    <p className="text-sm text-gray-600">{lead.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lead.gpt_analysis ? (
                    <Badge className="bg-green-100 text-green-800">
                      <Brain className="w-3 h-3 mr-1" />
                      Analizzato
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => triggerAnalysis(lead)}
                      className="bg-golden hover:bg-yellow-600 text-black"
                    >
                      <Brain className="w-4 h-4 mr-1" />
                      Analizza
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Servizio di interesse:</p>
                  <p className="font-medium text-black">{lead.servizio}</p>
                </div>
                {lead.bio && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Bio:</p>
                    <p className="text-sm text-black">{lead.bio}</p>
                  </div>
                )}
              </div>

              {lead.gpt_analysis && (
                <div className="space-y-4 mt-6 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-golden" />
                    <h3 className="font-semibold text-black">Analisi GPT</h3>
                    {lead.gpt_analysis.priorita && (
                      <Badge className={getPriorityColor(lead.gpt_analysis.priorita)}>
                        {lead.gpt_analysis.priorita}
                      </Badge>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {lead.gpt_analysis.categoria_cliente && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-golden" />
                          <p className="font-medium text-black">Categoria Cliente</p>
                        </div>
                        <p className="text-sm text-gray-700">{lead.gpt_analysis.categoria_cliente}</p>
                      </div>
                    )}

                    {lead.gpt_analysis.analisi_profilo && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-golden" />
                          <p className="font-medium text-black">Profilo</p>
                        </div>
                        <p className="text-sm text-gray-700">{lead.gpt_analysis.analisi_profilo}</p>
                      </div>
                    )}
                  </div>

                  {lead.gpt_analysis.funnel_personalizzato && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-golden" />
                        <p className="font-medium text-black">Funnel Personalizzato</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {lead.gpt_analysis.funnel_personalizzato.map((step: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {index + 1}. {step}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {lead.gpt_analysis.opportunita && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-golden" />
                        <p className="font-medium text-black">Opportunità</p>
                      </div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {lead.gpt_analysis.opportunita.map((opp: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-golden mt-1">•</span>
                            {opp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {lead.gpt_analysis.next_steps && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-golden" />
                        <p className="font-medium text-black">Prossimi Passi</p>
                      </div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {lead.gpt_analysis.next_steps.map((step: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-golden mt-1">•</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {leads.length === 0 && (
          <Card className="bg-white border-golden border">
            <CardContent className="text-center py-8">
              <Brain className="w-12 h-12 text-golden mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">Nessun Lead Presente</h3>
              <p className="text-gray-600">I lead verranno visualizzati qui quando verranno creati</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LeadAnalysisView;
