
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAIFunnels } from '@/hooks/useAIFunnels';
import { Brain, Share2, Eye, BarChart3, Play, Pause, ExternalLink, Zap } from 'lucide-react';

const AIFunnelsList: React.FC = () => {
  const { aiFunnels, loading, isGenerating, updateFunnelStatus, generateTestFunnel } = useAIFunnels();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleToggleStatus = async (funnelId: string, currentStatus: boolean) => {
    setProcessingId(funnelId);
    await updateFunnelStatus(funnelId, !currentStatus);
    setProcessingId(null);
  };

  const copyShareLink = (shareToken: string) => {
    const shareUrl = `${window.location.origin}/funnel/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-golden border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (aiFunnels.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">Nessun funnel AI generato</p>
        <p className="text-sm mb-4">Completa prima un'intervista cliente per generare funnel AI personalizzati.</p>
        <Button 
          onClick={generateTestFunnel}
          disabled={isGenerating}
          className="bg-golden hover:bg-golden/90 text-black flex items-center gap-2 mx-auto"
          data-testid="button-generate-test-funnel"
        >
          <Zap className="w-4 h-4" />
          {isGenerating ? 'Generazione in corso...' : 'Genera Funnel di Test'}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      {aiFunnels.map((funnel) => (
        <Card key={funnel.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{funnel.name}</CardTitle>
                  <Badge variant={funnel.is_active ? 'default' : 'secondary'}>
                    {funnel.is_active ? 'Attivo' : 'Disattivato'}
                  </Badge>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div className="mb-1">
                  {format(new Date(funnel.created_at), 'dd MMM yyyy', { locale: it })}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Eye className="w-3 h-3" />
                  {funnel.views_count} visualizzazioni
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {funnel.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {funnel.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                size="sm"
                variant={funnel.is_active ? "destructive" : "default"}
                onClick={() => handleToggleStatus(funnel.id, funnel.is_active)}
                disabled={processingId === funnel.id}
                className="flex items-center gap-2"
              >
                {funnel.is_active ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Disattiva
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Attiva
                  </>
                )}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyShareLink(funnel.share_token)}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Condividi
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(`/funnel/${funnel.share_token}`, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Anteprima
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AIFunnelsList;
