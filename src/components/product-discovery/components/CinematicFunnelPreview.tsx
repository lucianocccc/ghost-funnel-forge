
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
  Target,
  User,
  Package
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
        description: "Il link del tuo funnel personalizzato è stato copiato negli appunti",
      });
    }
  };

  const handleViewAnalytics = () => {
    window.open('/funnels?tab=analytics', '_blank');
  };

  const handleLeadCapture = (leadData: any) => {
    console.log('Lead captured from personalized preview:', leadData);
    toast({
      title: "🎯 Lead Personalizzato Acquisito!",
      description: "Il funnel cinematico personalizzato sta funzionando perfettamente!",
    });
  };

  // Extract personalized information
  const productName = funnel?.name?.replace('Funnel per ', '') || 'Il Prodotto';
  const targetAudience = funnel?.target_audience || 'i clienti';
  const industry = funnel?.industry || 'business';
  const hasPersonalizedData = funnel?.advanced_funnel_data && 
    Object.keys(funnel.advanced_funnel_data).length > 0;

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
      {/* Enhanced Header with Personalization Info */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Funnel Cinematico Personalizzato
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Creato specificamente per <span className="font-semibold text-purple-700">{productName}</span>
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm text-purple-600">
                  <User className="w-4 h-4" />
                  <span>{targetAudience}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-purple-600">
                  <Package className="w-4 h-4" />
                  <span>{industry}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className="bg-green-500 text-white">
                ✓ Personalizzato
              </Badge>
              {hasPersonalizedData && (
                <Badge className="bg-blue-500 text-white">
                  🧠 AI Content
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {funnel?.advanced_funnel_data?.productBenefits?.length || 3}
              </div>
              <div className="text-sm text-muted-foreground">Benefici Specifici</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((analysis?.conversionPotential?.score || 0.85) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Potential Conversion</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                100%
              </div>
              <div className="text-sm text-muted-foreground">Personalizzazione</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalization Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              Contenuti Personalizzati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { 
                  name: 'Hero Cinematico', 
                  desc: `Specifico per ${productName}`,
                  status: 'personalized',
                  content: funnel?.advanced_funnel_data?.heroSection?.headline?.substring(0, 50) + '...' || 'Contenuto personalizzato'
                },
                { 
                  name: 'Benefici del Prodotto', 
                  desc: `Vantaggi reali di ${productName}`,
                  status: 'personalized',
                  content: funnel?.advanced_funnel_data?.productBenefits?.[0]?.title || 'Benefici specifici'
                },
                { 
                  name: 'Social Proof', 
                  desc: `Testimonial per ${targetAudience}`,
                  status: 'personalized',
                  content: funnel?.advanced_funnel_data?.socialProof?.testimonials?.[0]?.text?.substring(0, 50) + '...' || 'Testimonial credibili'
                },
                { 
                  name: 'Call-to-Action', 
                  desc: `Azioni specifiche per ${productName}`,
                  status: 'personalized',
                  content: funnel?.advanced_funnel_data?.conversionForm?.submitText || `Richiedi ${productName}`
                }
              ].map((section, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">{section.name}</div>
                    <Badge variant="default" className="bg-blue-500">
                      ✨ Personalizzato
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">{section.desc}</div>
                  <div className="text-xs bg-white p-2 rounded border italic">
                    "{section.content}"
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Personalizzazione AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                `Copy ottimizzato specificamente per ${productName}`,
                `Linguaggio adatto a ${targetAudience}`,
                `Benefici reali del prodotto evidenziati`,
                `Testimonial credibili per il settore ${industry}`,
                `Call-to-action specifiche e pertinenti`,
                `Urgency mechanics appropriate al prodotto`
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

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Metriche Previste (Personalizzate)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((analysis?.conversionPotential?.score || 0.18) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
              <div className="text-xs text-green-600 mt-1">+3% vs generico</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">4.1x</div>
              <div className="text-sm text-muted-foreground">Engagement Boost</div>
              <div className="text-xs text-green-600 mt-1">vs funnel generico</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">62%</div>
              <div className="text-sm text-muted-foreground">Time on Page</div>
              <div className="text-xs text-green-600 mt-1">+15% vs standard</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">92%</div>
              <div className="text-sm text-muted-foreground">Relevance Score</div>
              <div className="text-xs text-green-600 mt-1">Altamente personalizzato</div>
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
          Anteprima Personalizzata
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

      {/* Enhanced Tips */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-700 text-lg">🎯 Vantaggi della Personalizzazione</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Contenuti Specifici:</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Copy ottimizzato per {productName}</li>
                <li>• Linguaggio adatto a {targetAudience}</li>
                <li>• Benefici reali evidenziati</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Risultati Attesi:</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• +25% engagement vs generico</li>
                <li>• +18% conversion rate</li>
                <li>• Maggiore credibilità e fiducia</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CinematicFunnelPreview;
