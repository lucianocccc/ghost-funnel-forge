import React from 'react';
import { SavedGhostFunnel } from '@/hooks/useGhostFunnels';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Zap, 
  Target, 
  Clock,
  Sparkles,
  Lightbulb,
  ShieldCheck,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { GhostFunnelResponse } from '@/hooks/useGhostFunnelOrchestrator';

interface GhostFunnelPreviewModalProps {
  funnel: SavedGhostFunnel | null;
  open: boolean;
  onClose: () => void;
}

export function GhostFunnelPreviewModal({ funnel, open, onClose }: GhostFunnelPreviewModalProps) {
  if (!funnel) return null;

  const funnelData = funnel.funnel_data as GhostFunnelResponse;
  
  if (!funnelData) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Anteprima Ghost Funnel</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Dati del funnel non disponibili</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getBrandVariant = (style: string): "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" => {
    switch (style) {
      case 'Apple': return 'default';
      case 'Nike': return 'destructive';
      case 'Amazon': return 'secondary';
      default: return 'default';
    }
  };

  const brandVariant = getBrandVariant(funnelData.style);

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'lightbulb': Lightbulb,
      'shield-check': ShieldCheck,
      'chart-bar': BarChart3,
      'zap': Zap,
      'target': Target,
      'heart': Heart,
      'clock': Clock,
    };
    
    return iconMap[iconName] || Lightbulb;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-golden" />
            {funnel.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hero Section */}
          <Card className={`${brandVariant === 'default' ? 'bg-gradient-to-r from-primary/5 to-primary-light/5 border-primary/20' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Hero Section
                <Badge variant="outline" className="ml-auto">
                  Stile {funnelData.style}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className={`text-2xl font-bold mb-2 ${brandVariant === 'default' ? 'text-primary' : ''}`}>
                  {funnelData.hero.headline}
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  {funnelData.hero.subheadline}
                </p>
                <Button variant={brandVariant} size="lg">
                  {funnelData.hero.cta_text}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Advantages Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Vantaggi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {funnelData.advantages.map((advantage, index) => {
                  const IconComponent = getIconComponent(advantage.icon || 'lightbulb');
                  return (
                    <div key={index} className="text-center p-4 rounded-lg bg-secondary/20">
                      <IconComponent className={`w-8 h-8 mx-auto mb-3 ${brandVariant === 'default' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <h3 className="font-semibold mb-2">{advantage.title}</h3>
                      <p className="text-sm text-muted-foreground">{advantage.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Emotional Story Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Storia Emotiva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">La Nostra Storia</h4>
                <p className="text-muted-foreground">{funnelData.emotional.story}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Pain Points</h4>
                <ul className="space-y-1">
                  {funnelData.emotional.pain_points.map((point, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-destructive">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Trasformazione</h4>
                <p className="text-muted-foreground">{funnelData.emotional.transformation}</p>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Call to Action
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-3">
                <Button variant={brandVariant} size="lg" className="w-full">
                  {funnelData.cta.primary_text}
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  {funnelData.cta.secondary_text}
                </Button>
                <p className="text-sm text-muted-foreground font-medium">
                  ⚡ {funnelData.cta.urgency}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Images Suggestions */}
          {funnelData.images && funnelData.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Immagini Suggerite</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {funnelData.images.map((image, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-1 capitalize">{image.type}</h4>
                      <p className="text-sm text-muted-foreground mb-1">{image.description}</p>
                      <p className="text-xs text-muted-foreground italic">{image.alt_text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Execution Metadata */}
          {funnelData.execution_metadata && (
            <Card>
              <CardHeader>
                <CardTitle>Dettagli Tecnici</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Performance</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>Tempo totale: {funnelData.execution_metadata.total_time_ms}ms</li>
                      <li>Fasi completate: {funnelData.execution_metadata.phases_completed}</li>
                      <li>Modelli utilizzati: {funnelData.execution_metadata.models_used.length}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Punteggi di Confidenza</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>Market Research: {Math.round(funnelData.execution_metadata.confidence_scores.market_research * 100)}%</li>
                      <li>Storytelling: {Math.round(funnelData.execution_metadata.confidence_scores.storytelling * 100)}%</li>
                      <li>Orchestrazione: {Math.round(funnelData.execution_metadata.confidence_scores.orchestration * 100)}%</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                const shareUrl = `${window.location.origin}/funnel/${funnel.share_token}`;
                navigator.clipboard.writeText(shareUrl);
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Copia Link Condivisione
            </Button>
            <Button onClick={onClose}>
              Chiudi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}