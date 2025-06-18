
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wand2, Share2, Eye, ExternalLink, Zap } from 'lucide-react';
import { GeneratedFunnel } from '@/types/chatbotFunnel';
import { useChatBotFunnels } from '@/hooks/useChatBotFunnels';
import AIFunnelTransformModal from './AIFunnelTransformModal';

interface AIFunnelGeneratedListProps {
  generatedFunnels: GeneratedFunnel[];
  sessionId: string;
}

const AIFunnelGeneratedList: React.FC<AIFunnelGeneratedListProps> = ({
  generatedFunnels,
  sessionId
}) => {
  const [selectedFunnel, setSelectedFunnel] = useState<GeneratedFunnel | null>(null);
  const { saveFunnel, shareFunnel, deleteFunnel } = useChatBotFunnels(sessionId);

  const handleShare = async (funnelId: string) => {
    await shareFunnel(funnelId);
  };

  const handleTransformSuccess = () => {
    // Reload the list or show success message
    setSelectedFunnel(null);
  };

  const openPreview = (funnel: GeneratedFunnel) => {
    const shareUrl = `${window.location.origin}/shared-funnel/${funnel.share_token}`;
    window.open(shareUrl, '_blank');
  };

  if (generatedFunnels.length === 0) return null;

  return (
    <>
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-golden flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Funnel Generati dall'AI ({generatedFunnels.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {generatedFunnels.map((funnel) => (
              <div key={funnel.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-white">{funnel.name}</h4>
                      <Badge variant={funnel.is_active ? 'default' : 'secondary'}>
                        {funnel.is_active ? 'Attivo' : 'Bozza'}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{funnel.description}</p>
                    
                    {/* Statistiche */}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{funnel.views_count} visualizzazioni</span>
                      </div>
                      <div>
                        Creato: {new Date(funnel.created_at).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => setSelectedFunnel(funnel)}
                    className="bg-golden hover:bg-yellow-600 text-black"
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Trasforma in Interattivo
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShare(funnel.id)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Share2 className="w-3 h-3 mr-1" />
                    Condividi
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openPreview(funnel)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Anteprima
                  </Button>

                  {!funnel.is_active && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => saveFunnel(funnel.id)}
                      className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                    >
                      Salva in Libreria
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AIFunnelTransformModal
        funnel={selectedFunnel}
        isOpen={!!selectedFunnel}
        onClose={() => setSelectedFunnel(null)}
        onSuccess={handleTransformSuccess}
      />
    </>
  );
};

export default AIFunnelGeneratedList;
