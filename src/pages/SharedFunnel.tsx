
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Target, Building, Eye, ArrowLeft, ExternalLink } from 'lucide-react';
import { GeneratedFunnel } from '@/hooks/useChatBotFunnels';

const SharedFunnel: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [funnel, setFunnel] = useState<GeneratedFunnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedFunnel = async () => {
      if (!shareToken) {
        setError('Token di condivisione non valido');
        setLoading(false);
        return;
      }

      try {
        // First, increment the view count using a proper SQL function call
        const { error: updateError } = await (supabase as any).rpc('increment_funnel_views', {
          share_token_param: shareToken
        });

        if (updateError) {
          console.error('Error updating view count:', updateError);
          // Continue even if view count update fails
        }

        // Then fetch the funnel data
        const { data, error } = await supabase
          .from('ai_generated_funnels')
          .select('*')
          .eq('share_token', shareToken)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Funnel non trovato');
          } else {
            setError('Errore nel caricamento del funnel');
          }
          return;
        }

        setFunnel(data);
      } catch (error) {
        console.error('Error loading shared funnel:', error);
        setError('Errore nel caricamento del funnel');
      } finally {
        setLoading(false);
      }
    };

    loadSharedFunnel();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Caricamento funnel...</div>
      </div>
    );
  }

  if (error || !funnel) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Funnel non trovato</h1>
          <p className="text-gray-400 mb-6">{error || 'Il funnel che stai cercando non esiste o è stato rimosso.'}</p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-golden hover:bg-yellow-600 text-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Home
          </Button>
        </div>
      </div>
    );
  }

  const funnelData = funnel.funnel_data || {};
  const steps = funnelData.steps || [];

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="mb-4 border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Indietro
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-golden mb-2">Funnel Condiviso</h1>
            <p className="text-gray-400">Creato con Ghost Funnel AI</p>
          </div>
        </div>

        {/* Funnel Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-golden text-2xl">
                {funnel.name}
              </CardTitle>
              <div className="flex gap-2 items-center">
                <Badge variant="secondary" className="bg-blue-900 text-blue-300">
                  <Eye className="w-3 h-3 mr-1" />
                  {funnel.views_count} visualizzazioni
                </Badge>
                <Badge variant="outline" className="border-golden text-golden">
                  AI Generated
                </Badge>
              </div>
            </div>
            {funnel.description && (
              <p className="text-gray-300 text-lg mt-4">
                {funnel.description}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Target e Industria */}
            <div className="grid md:grid-cols-2 gap-4">
              {funnelData.target_audience && (
                <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
                  <Target className="w-6 h-6 text-blue-400" />
                  <div>
                    <span className="font-medium text-white">Target Audience</span>
                    <p className="text-gray-300">{funnelData.target_audience}</p>
                  </div>
                </div>
              )}
              {funnelData.industry && (
                <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
                  <Building className="w-6 h-6 text-purple-400" />
                  <div>
                    <span className="font-medium text-white">Industria</span>
                    <p className="text-gray-300">{funnelData.industry}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Step del funnel */}
            {steps.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Step del Funnel</h3>
                <div className="space-y-4">
                  {steps.map((step: string, index: number) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-900 rounded-lg">
                      <div className="bg-golden text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-300 leading-relaxed">
                          {step.replace(/^\d+\.\s*/, '')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategia */}
            {funnelData.strategy && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Strategia di Distribuzione</h3>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-gray-300 leading-relaxed">
                    {funnelData.strategy}
                  </p>
                </div>
              </div>
            )}

            <Separator className="bg-gray-700" />

            {/* CTA Section */}
            <div className="text-center py-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Vuoi creare il tuo funnel personalizzato?
              </h3>
              <p className="text-gray-400 mb-6">
                Scopri Ghost Funnel e crea funnel marketing professionali con l'aiuto dell'AI
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                size="lg"
                className="bg-golden hover:bg-yellow-600 text-black"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Inizia Gratis con Ghost Funnel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>Powered by Ghost Funnel AI - La piattaforma per funnel marketing intelligenti</p>
        </div>
      </div>
    </div>
  );
};

export default SharedFunnel;
