
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, Trash2, Plus, Target, Building, Share2, Eye, ExternalLink } from 'lucide-react';
import { GeneratedFunnel, useChatBotFunnels } from '@/hooks/useChatBotFunnels';

interface AdminGeneratedFunnelsProps {
  sessionId: string;
}

const AdminGeneratedFunnels: React.FC<AdminGeneratedFunnelsProps> = ({ sessionId }) => {
  const { generatedFunnels, loading, saveFunnel, deleteFunnel, createActualFunnel, shareFunnel } = useChatBotFunnels(sessionId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Caricamento funnel generati...</div>
      </div>
    );
  }

  if (generatedFunnels.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-gray-400">
          <div className="text-lg mb-2">Nessun funnel generato</div>
          <div className="text-sm">I funnel generati dall'AI appariranno qui</div>
        </div>
      </div>
    );
  }

  const FunnelCard: React.FC<{ funnel: GeneratedFunnel }> = ({ funnel }) => {
    const funnelData = funnel.funnel_data || {};
    const steps = funnelData.steps || [];

    return (
      <Card className="bg-gray-800 border-gray-700 mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-golden text-lg">
              {funnel.name}
            </CardTitle>
            <div className="flex gap-2 items-center">
              {funnel.is_active && (
                <Badge variant="secondary" className="bg-green-900 text-green-300">
                  Attivo
                </Badge>
              )}
              {funnel.views_count > 0 && (
                <Badge variant="outline" className="border-blue-500 text-blue-300">
                  <Eye className="w-3 h-3 mr-1" />
                  {funnel.views_count} visualizzazioni
                </Badge>
              )}
            </div>
          </div>
          {funnel.description && (
            <p className="text-gray-300 text-sm mt-2">
              {funnel.description}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Target e Industria */}
          <div className="flex flex-wrap gap-4">
            {funnelData.target_audience && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="font-medium">Target:</span>
                <span>{funnelData.target_audience}</span>
              </div>
            )}
            {funnelData.industry && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Building className="w-4 h-4 text-purple-400" />
                <span className="font-medium">Industria:</span>
                <span>{funnelData.industry}</span>
              </div>
            )}
          </div>

          {/* Step del funnel */}
          {steps.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-3">Step del Funnel:</h4>
              <div className="space-y-2">
                {steps.map((step: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="bg-golden text-black w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="text-gray-300 flex-1">
                      {step.replace(/^\d+\.\s*/, '')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategia */}
          {funnelData.strategy && (
            <div>
              <h4 className="text-white font-medium mb-2">Strategia di Distribuzione:</h4>
              <p className="text-gray-300 text-sm bg-gray-900 p-3 rounded">
                {funnelData.strategy}
              </p>
            </div>
          )}

          <Separator className="bg-gray-700" />

          {/* Azioni */}
          <div className="flex gap-2 flex-wrap">
            {!funnel.is_active && (
              <Button
                onClick={() => saveFunnel(funnel.id)}
                variant="outline"
                size="sm"
                className="bg-blue-900 hover:bg-blue-800 border-blue-700 text-blue-300"
              >
                <Save className="w-4 h-4 mr-2" />
                Attiva Funnel
              </Button>
            )}
            
            <Button
              onClick={() => createActualFunnel(funnel)}
              size="sm"
              className="bg-golden hover:bg-yellow-600 text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crea Funnel Completo
            </Button>

            <Button
              onClick={() => shareFunnel(funnel.id)}
              variant="outline"
              size="sm"
              className="bg-purple-900 hover:bg-purple-800 border-purple-700 text-purple-300"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Condividi
            </Button>

            <Button
              onClick={() => window.open(`/shared-funnel/${funnel.share_token}`, '_blank')}
              variant="outline"
              size="sm"
              className="bg-green-900 hover:bg-green-800 border-green-700 text-green-300"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Anteprima
            </Button>
            
            <Button
              onClick={() => deleteFunnel(funnel.id)}
              variant="outline"
              size="sm"
              className="bg-red-900 hover:bg-red-800 border-red-700 text-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Elimina
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">
          Funnel Generati ({generatedFunnels.length})
        </h3>
        <Badge variant="outline" className="border-golden text-golden">
          Sessione Attiva
        </Badge>
      </div>
      
      <div className="space-y-4">
        {generatedFunnels.map((funnel) => (
          <FunnelCard key={funnel.id} funnel={funnel} />
        ))}
      </div>
    </div>
  );
};

export default AdminGeneratedFunnels;
