
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  ExternalLink, 
  Share2, 
  BarChart3,
  Eye,
  Sparkles,
  Zap,
  Target,
  User,
  Package,
  CheckCircle,
  Star
} from 'lucide-react';

// Import del funnel cinematico personalizzato
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

  const handleLeadCapture = (leadData: any) => {
    console.log('🎯 Lead personalizzato acquisito:', leadData);
    toast({
      title: "🎉 Lead Personalizzato Acquisito!",
      description: `Richiesta per ${funnel.product_name} registrata con successo!`,
    });
  };

  // Extract personalized information
  const productName = funnel?.product_name || funnel?.name?.replace('Funnel per ', '') || 'Il Prodotto';
  const targetAudience = funnel?.target_audience || 'i clienti';
  const industry = funnel?.industry || 'business';
  const hasPersonalizedData = funnel?.advanced_funnel_data && 
    Object.keys(funnel.advanced_funnel_data).length > 0 &&
    funnel.product_name;

  if (previewMode === 'live') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <Button
            variant="outline"
            onClick={() => setPreviewMode('overview')}
            className="border-purple-300 text-purple-700 hover:bg-purple-100"
          >
            ← Torna all'Overview
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare} className="border-purple-300 text-purple-700">
              <Share2 className="w-4 h-4 mr-2" />
              Condividi
            </Button>
            <Button onClick={() => window.open('/funnels', '_blank')} className="bg-purple-600 hover:bg-purple-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              I Miei Funnel
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
      {/* Header con Info Personalizzazione */}
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
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-sm text-purple-600">
                  <User className="w-4 h-4" />
                  <span>{targetAudience}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-purple-600">
                  <Package className="w-4 h-4" />
                  <span>{industry}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>100% Personalizzato</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className="bg-green-500 text-white">
                ✅ Personalizzato AI
              </Badge>
              <Badge className="bg-blue-500 text-white">
                🎨 Design Interattivo
              </Badge>
              <Badge className="bg-purple-500 text-white">
                📋 Form Completo
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {funnel?.advanced_funnel_data?.productBenefits?.length || 3}
              </div>
              <div className="text-sm text-muted-foreground">Benefici Specifici</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {funnel?.advanced_funnel_data?.conversionForm?.steps?.length || 2}
              </div>
              <div className="text-sm text-muted-foreground">Step Form</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {funnel?.advanced_funnel_data?.socialProof?.testimonials?.length || 2}
              </div>
              <div className="text-sm text-muted-foreground">Testimonial</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                95%
              </div>
              <div className="text-sm text-muted-foreground">Personalizzazione</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenuti Personalizzati e Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              Contenuti Personalizzati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  name: 'Hero Section', 
                  desc: `Headline specifica per ${productName}`,
                  content: funnel?.advanced_funnel_data?.heroSection?.headline?.substring(0, 60) + '...' || 'Contenuto personalizzato',
                  color: 'bg-purple-100 text-purple-800'
                },
                { 
                  name: 'Benefici Prodotto', 
                  desc: `Vantaggi reali di ${productName}`,
                  content: funnel?.advanced_funnel_data?.productBenefits?.[0]?.title || 'Benefici specifici',
                  color: 'bg-blue-100 text-blue-800'
                },
                { 
                  name: 'Social Proof', 
                  desc: `Testimonial per ${targetAudience}`,
                  content: funnel?.advanced_funnel_data?.socialProof?.testimonials?.[0]?.text?.substring(0, 60) + '...' || 'Testimonial credibili',
                  color: 'bg-green-100 text-green-800'
                },
                { 
                  name: 'Call-to-Action', 
                  desc: `Azioni specifiche per ${productName}`,
                  content: funnel?.advanced_funnel_data?.conversionForm?.submitText || `Richiedi ${productName}`,
                  color: 'bg-orange-100 text-orange-800'
                }
              ].map((section, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">{section.name}</div>
                    <Badge className={section.color}>
                      ✨ AI
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">{section.desc}</div>
                  <div className="text-sm bg-white p-3 rounded border italic">
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
              Form di Lead Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Form Steps Preview */}
              {funnel?.advanced_funnel_data?.conversionForm?.steps?.map((step: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="font-medium text-sm mb-2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
                      {index + 1}
                    </div>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">{step.subtitle}</div>
                  <div className="space-y-2">
                    {step.fields?.map((field: any, fieldIndex: number) => (
                      <div key={fieldIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{field.label}</span>
                        {field.required && <span className="text-red-500">*</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Form Benefits */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">✅ Incentivi del Form</h4>
                <div className="text-sm text-green-700 whitespace-pre-line">
                  {funnel?.advanced_funnel_data?.conversionForm?.incentive || 
                   `• Consulenza gratuita personalizzata\n• Analisi delle esigenze\n• Proposta su misura per ${productName}`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metriche Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Performance Preview (Personalizzato)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">22%</div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
              <div className="text-xs text-green-600 mt-1">+5% vs generico</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">4.8x</div>
              <div className="text-sm text-muted-foreground">Engagement</div>
              <div className="text-xs text-green-600 mt-1">vs funnel standard</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">3:45</div>
              <div className="text-sm text-muted-foreground">Tempo Medio</div>
              <div className="text-xs text-green-600 mt-1">+45% vs generico</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">96%</div>
              <div className="text-sm text-muted-foreground">Form Completion</div>
              <div className="text-xs text-green-600 mt-1">Ottimizzato</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => setPreviewMode('live')}
          size="lg"
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
        >
          <Play className="w-5 h-5" />
          Anteprima Interattiva
        </Button>
        
        <Button
          variant="outline"
          onClick={handleShare}
          size="lg"
          className="flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-100 px-8 py-4"
        >
          <Share2 className="w-5 h-5" />
          Condividi Funnel
        </Button>
        
        <Button
          variant="outline"
          onClick={() => window.open('/funnels', '_blank')}
          size="lg"
          className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100 px-8 py-4"
        >
          <BarChart3 className="w-5 h-5" />
          Gestisci Funnel
        </Button>
      </div>

      {/* Vantaggi Personalizzazione */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-700 text-lg flex items-center gap-2">
            <Star className="w-5 h-5" />
            Vantaggi della Personalizzazione AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">🎯 Contenuti Specifici:</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Copy ottimizzato per {productName}</li>
                <li>• Linguaggio per {targetAudience}</li>
                <li>• Benefici reali del prodotto</li>
                <li>• CTA specifiche e pertinenti</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">📋 Form Avanzato:</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Campi personalizzati</li>
                <li>• Step progressivi</li>
                <li>• Validazione completa</li>
                <li>• Incentivi specifici</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">🎨 Design Interattivo:</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Animazioni fluide</li>
                <li>• Colori coordinati</li>
                <li>• UX ottimizzata</li>
                <li>• Mobile responsive</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CinematicFunnelPreview;
