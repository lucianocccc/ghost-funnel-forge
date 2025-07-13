
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  ExternalLink, 
  Share2, 
  Download, 
  BarChart3,
  Eye,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

// Import del funnel cinematico esistente
import { HybridAdvancedFunnel } from '@/components/ai-funnel/HybridAdvancedFunnel';

interface CinematicFunnelPreviewProps {
  funnel: any;
  analysis: any;
}

const CinematicFunnelPreview: React.FC<CinematicFunnelPreviewProps> = ({
  funnel,
  analysis
}) => {
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState<'overview' | 'live'>('overview');

  const handleShare = () => {
    if (funnel?.share_token) {
      const shareUrl = `${window.location.origin}/shared-interactive-funnel/${funnel.share_token}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "🔗 Link Copiato!",
        description: "Il link del tuo funnel è stato copiato negli appunti",
      });
    }
  };

  const handleViewAnalytics = () => {
    window.open('/funnels?tab=analytics', '_blank');
  };

  const handleLeadCapture = (leadData: any) => {
    console.log('Lead captured from preview:', leadData);
    toast({
      title: "🎯 Lead di Test Acquisito!",
      description: "Il funnel sta funzionando perfettamente!",
    });
  };

  if (previewMode === 'live') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setPreviewMode('overview')}
          >
            ← Torna alla Overview
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Condividi
            </Button>
            <Button onClick={handleViewAnalytics}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        <HybridAdvancedFunnel
          funnel={funnel}
          onLeadCapture={handleLeadCapture}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Funnel Cinematico Generato
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Il tuo funnel personalizzato è pronto per conquistare il mercato
              </p>
            </div>
            <Badge className="bg-green-500 text-white">
              ✓ Pronto per il Launch
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {funnel.steps?.length || 5}
              </div>
              <div className="text-sm text-muted-foreground">Sezioni Cinematiche</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((analysis?.conversionPotential?.score || 0.85) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Conversion Potential</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                A/B
              </div>
              <div className="text-sm text-muted-foreground">Test Ready</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funnel Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              Struttura del Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Hero Cinematico', desc: 'Video/animazioni coinvolgenti', status: 'ready' },
                { name: 'Benefici Specifici', desc: 'Vantaggi personalizzati per il prodotto', status: 'ready' },
                { name: 'Social Proof', desc: 'Testimonial e case study rilevanti', status: 'ready' },
                { name: 'Demo Interattiva', desc: 'Preview del prodotto in azione', status: 'ready' },
                { name: 'Conversione Ottimizzata', desc: 'Form multi-step intelligente', status: 'ready' }
              ].map((section, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{section.name}</div>
                    <div className="text-xs text-muted-foreground">{section.desc}</div>
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    ✓ Ready
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Ottimizzazioni AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                'Copy ottimizzato per il target audience',
                'Colori e design per la conversione',
                'Timing e animazioni studiate',
                'Call-to-action personalizzate',
                'Mobile-first responsive design'
              ].map((optimization, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>{optimization}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Metriche Previste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((analysis?.conversionPotential?.score || 0.15) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">3.2x</div>
              <div className="text-sm text-muted-foreground">Engagement Boost</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">47%</div>
              <div className="text-sm text-muted-foreground">Time on Page</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">85%</div>
              <div className="text-sm text-muted-foreground">Mobile Optimized</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => setPreviewMode('live')}
          size="lg"
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Play className="w-5 h-5" />
          Anteprima Live
        </Button>
        
        <Button
          variant="outline"
          onClick={handleShare}
          size="lg"
          className="flex items-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Condividi Funnel
        </Button>
        
        <Button
          variant="outline"
          onClick={handleViewAnalytics}
          size="lg"
          className="flex items-center gap-2"
        >
          <BarChart3 className="w-5 h-5" />
          Vai ai Miei Funnel
        </Button>
      </div>

      {/* Quick Tips */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-700 text-lg">💡 Prossimi Passi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Per il Testing:</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Testa il funnel con traffico ridotto</li>
                <li>• Monitora le metriche in tempo reale</li>
                <li>• Raccogli feedback dai primi utenti</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Per l'Ottimizzazione:</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Attiva A/B test sulle CTA</li>
                <li>• Analizza heatmap comportamentali</li>
                <li>• Ottimizza in base ai dati</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CinematicFunnelPreview;
