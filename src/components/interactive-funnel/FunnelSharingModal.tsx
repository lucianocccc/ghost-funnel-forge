
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Copy, Eye, Users, RefreshCw, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InteractiveFunnelWithSteps } from '@/types/interactiveFunnel';

interface FunnelSharingModalProps {
  funnel: InteractiveFunnelWithSteps & { 
    share_token?: string; 
    is_public?: boolean;
    views_count?: number;
    submissions_count?: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onTogglePublic: (isPublic: boolean) => void;
  onRegenerateToken: () => Promise<string>;
}

const FunnelSharingModal: React.FC<FunnelSharingModalProps> = ({
  funnel,
  isOpen,
  onClose,
  onTogglePublic,
  onRegenerateToken
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  const shareUrl = funnel.share_token 
    ? `${window.location.origin}/shared-funnel/${funnel.share_token}`
    : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copiato!",
        description: "Link di condivisione copiato negli appunti",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile copiare il link",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateToken = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateToken();
    } finally {
      setIsRegenerating(false);
    }
  };

  const openPreview = () => {
    if (shareUrl && funnel.is_public) {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Condividi Funnel: {funnel.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="public-toggle" className="text-base font-medium">
                Funnel Pubblico
              </Label>
              <p className="text-sm text-gray-500">
                Rendi il funnel accessibile tramite link pubblico
              </p>
            </div>
            <Switch
              id="public-toggle"
              checked={funnel.is_public || false}
              onCheckedChange={onTogglePublic}
            />
          </div>

          {funnel.is_public && (
            <>
              {/* Share URL */}
              <div className="space-y-2">
                <Label htmlFor="share-url">Link di Condivisione</Label>
                <div className="flex gap-2">
                  <Input
                    id="share-url"
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    title="Copia link"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={openPreview}
                    title="Apri anteprima"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Analytics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {funnel.views_count || 0}
                  </div>
                  <div className="text-sm text-gray-500">Visualizzazioni</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {funnel.submissions_count || 0}
                  </div>
                  <div className="text-sm text-gray-500">Submissions</div>
                </div>
              </div>

              {/* Regenerate Token */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Token di Sicurezza</h4>
                    <p className="text-sm text-gray-500">
                      Rigenera il token per invalidare il link attuale
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateToken}
                    disabled={isRegenerating}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                    {isRegenerating ? 'Rigenerando...' : 'Rigenera'}
                  </Button>
                </div>
              </div>
            </>
          )}

          {!funnel.is_public && (
            <div className="text-center py-8 text-gray-500">
              <ExternalLink className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Attiva la condivisione pubblica per generare un link condivisibile</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FunnelSharingModal;
