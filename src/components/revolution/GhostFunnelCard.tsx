import React, { useState } from 'react';
import { SavedGhostFunnel } from '@/hooks/useGhostFunnels';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  ExternalLink, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Calendar,
  Users,
  Building2,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface GhostFunnelCardProps {
  funnel: SavedGhostFunnel;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onPreview: (funnel: SavedGhostFunnel) => void;
}

export function GhostFunnelCard({ funnel, onDelete, onToggleActive, onPreview }: GhostFunnelCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(funnel.id);
    setIsDeleting(false);
  };

  const handleToggle = () => {
    onToggleActive(funnel.id, !funnel.is_active);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/funnel/${funnel.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    // Could add a toast here
  };

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-200">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-golden to-golden-light" />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground line-clamp-1">
              {funnel.name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {funnel.description || 'Nessuna descrizione disponibile'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <Badge variant={funnel.is_active ? "default" : "secondary"} className="text-xs">
              {funnel.is_active ? 'Attivo' : 'Inattivo'}
            </Badge>
            <Badge variant="outline" className="text-xs bg-golden/10 text-golden border-golden/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Ghost
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {funnel.industry && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{funnel.industry}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="w-4 h-4 flex-shrink-0" />
              <span>{funnel.views_count} visualizzazioni</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>
                Creato {formatDistanceToNow(new Date(funnel.created_at), { 
                  addSuffix: true,
                  locale: it 
                })}
              </span>
            </div>
          </div>

          {/* Generation Metadata */}
          {funnel.funnel_data?.generation_metadata && (
            <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
              <div className="text-xs font-medium text-secondary-foreground">
                Dettagli Generazione
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                {funnel.funnel_data.generation_metadata.target_audience && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span className="truncate">
                      {funnel.funnel_data.generation_metadata.target_audience}
                    </span>
                  </div>
                )}
                {funnel.funnel_data.generation_metadata.tone && (
                  <div className="truncate">
                    Tono: {funnel.funnel_data.generation_metadata.tone}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPreview(funnel)}
                className="h-8 px-2 text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                Anteprima
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="h-8 px-2 text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Condividi
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggle}
                className="h-8 px-2"
              >
                {funnel.is_active ? (
                  <ToggleRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 px-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}