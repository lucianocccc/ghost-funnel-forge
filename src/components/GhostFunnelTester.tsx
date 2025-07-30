import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useGhostFunnelOrchestrator, type GhostFunnelRequest } from '@/hooks/useGhostFunnelOrchestrator';
import { applyBrandStyles } from '@/config/brandStyles';
import { PremiumCard } from '@/components/premium-ui/PremiumCard';
import { PremiumButton } from '@/components/premium-ui/PremiumButton';
import BrandStyleIndicator from '@/components/BrandStyleIndicator';

export function GhostFunnelTester() {
  const [formData, setFormData] = useState<GhostFunnelRequest>({
    business_name: '',
    business_type: '',
    description: '',
    tone: 'professionale',
    target_audience: '',
    language: 'italiano'
  });

  const { isGenerating, ghostFunnel, generateGhostFunnel, clearResults } = useGhostFunnelOrchestrator();

  // Applica automaticamente il brand style quando il Ghost Funnel viene generato
  useEffect(() => {
    if (ghostFunnel?.style) {
      const brandId = ghostFunnel.style.toLowerCase();
      console.log(`🎨 Applicando brand style: ${brandId}`);
      applyBrandStyles(brandId);
    }
  }, [ghostFunnel?.style]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateGhostFunnel(formData);
  };

  const handleInputChange = (field: keyof GhostFunnelRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Ottieni il variant per i componenti premium basato sul brand style
  const getBrandVariant = (): 'apple' | 'nike' | 'amazon' => {
    if (!ghostFunnel?.style) return 'apple';
    return ghostFunnel.style.toLowerCase() as 'apple' | 'nike' | 'amazon';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Ghost Funnel Orchestrator - Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">Nome Business</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  placeholder="Es. TechCorp"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="business_type">Tipo di Business</Label>
                <Input
                  id="business_type"
                  value={formData.business_type}
                  onChange={(e) => handleInputChange('business_type', e.target.value)}
                  placeholder="Es. Software Development"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrivi il tuo business e cosa fa..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professionale">Professionale</SelectItem>
                    <SelectItem value="amichevole">Amichevole</SelectItem>
                    <SelectItem value="energico">Energico</SelectItem>
                    <SelectItem value="elegante">Elegante</SelectItem>
                    <SelectItem value="innovativo">Innovativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_audience">Target Audience</Label>
                <Input
                  id="target_audience"
                  value={formData.target_audience}
                  onChange={(e) => handleInputChange('target_audience', e.target.value)}
                  placeholder="Es. Imprenditori 25-45 anni"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Lingua</Label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="italiano">Italiano</SelectItem>
                    <SelectItem value="inglese">Inglese</SelectItem>
                    <SelectItem value="spagnolo">Spagnolo</SelectItem>
                    <SelectItem value="francese">Francese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isGenerating} className="flex-1">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generando Ghost Funnel...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Genera Ghost Funnel
                  </>
                )}
              </Button>
              
              {ghostFunnel && (
                <Button type="button" variant="outline" onClick={clearResults}>
                  Pulisci Risultati
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {ghostFunnel && (
        <div className="space-y-6">
          {/* Anteprima Funnel con Brand Style Applicato */}
          <PremiumCard variant={getBrandVariant()} size="lg" animation="glow">
            <div className="text-center space-y-6">
              {/* Hero Section con Brand Style */}
              <div className="space-y-4">
                <h1 
                  className="text-4xl font-bold leading-tight"
                  style={{ 
                    fontFamily: 'var(--brand-font-heading)', 
                    fontWeight: 'var(--brand-weight-heading)',
                    color: `hsl(var(--brand-text))`
                  }}
                >
                  {ghostFunnel.hero.headline}
                </h1>
                <p 
                  className="text-xl opacity-90"
                  style={{ 
                    fontFamily: 'var(--brand-font-body)',
                    color: `hsl(var(--brand-muted))`
                  }}
                >
                  {ghostFunnel.hero.subheadline}
                </p>
                <div className="mt-6">
                  <PremiumButton 
                    variant={getBrandVariant()} 
                    size="lg" 
                    animation={getBrandVariant() === 'nike' ? 'bounce' : 'glow'}
                  >
                    {ghostFunnel.hero.cta_text}
                  </PremiumButton>
                </div>
              </div>

              {/* Advantages con Brand Style */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {ghostFunnel.advantages.map((advantage, index) => (
                  <PremiumCard 
                    key={index} 
                    variant={getBrandVariant()} 
                    size="md" 
                    animation="scale"
                    className="text-center"
                  >
                    <div className="space-y-3">
                      {advantage.icon && (
                        <div 
                          className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-2xl"
                          style={{ 
                            backgroundColor: `hsl(var(--brand-primary) / 0.1)`,
                            color: `hsl(var(--brand-primary))`
                          }}
                        >
                          📊
                        </div>
                      )}
                      <h3 
                        className="font-semibold text-lg"
                        style={{ 
                          fontFamily: 'var(--brand-font-heading)',
                          color: `hsl(var(--brand-text))`
                        }}
                      >
                        {advantage.title}
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ 
                          color: `hsl(var(--brand-muted))`
                        }}
                      >
                        {advantage.description}
                      </p>
                    </div>
                  </PremiumCard>
                ))}
              </div>

              {/* Story Section con Brand Style */}
              <PremiumCard variant={getBrandVariant()} size="lg" className="mt-12">
                <div className="space-y-4">
                  <h2 
                    className="text-2xl font-bold"
                    style={{ 
                      fontFamily: 'var(--brand-font-heading)',
                      color: `hsl(var(--brand-text))`
                    }}
                  >
                    La Nostra Storia
                  </h2>
                  <p 
                    className="text-lg leading-relaxed"
                    style={{ 
                      fontFamily: 'var(--brand-font-body)',
                      color: `hsl(var(--brand-muted))`
                    }}
                  >
                    {ghostFunnel.emotional.story}
                  </p>
                  
                  {/* Pain Points */}
                  <div className="space-y-2">
                    <h3 
                      className="font-semibold text-lg"
                      style={{ color: `hsl(var(--brand-text))` }}
                    >
                      Problemi che risolviamo:
                    </h3>
                    <ul className="space-y-1">
                      {ghostFunnel.emotional.pain_points.map((point, index) => (
                        <li 
                          key={index} 
                          className="flex items-center space-x-2"
                          style={{ color: `hsl(var(--brand-muted))` }}
                        >
                          <span style={{ color: `hsl(var(--brand-primary))` }}>✗</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Transformation */}
                  <div 
                    className="p-4 rounded-lg mt-6"
                    style={{ 
                      backgroundColor: `hsl(var(--brand-primary) / 0.1)`,
                      border: `1px solid hsl(var(--brand-primary) / 0.2)`
                    }}
                  >
                    <h3 
                      className="font-semibold text-lg mb-2"
                      style={{ color: `hsl(var(--brand-primary))` }}
                    >
                      La Tua Trasformazione
                    </h3>
                    <p style={{ color: `hsl(var(--brand-text))` }}>
                      {ghostFunnel.emotional.transformation}
                    </p>
                  </div>
                </div>
              </PremiumCard>

              {/* Final CTA con Brand Style */}
              <div className="space-y-4 mt-12">
                <div className="space-y-2">
                  <PremiumButton 
                    variant={getBrandVariant()} 
                    size="lg" 
                    animation={getBrandVariant() === 'nike' ? 'bounce' : 'glow'}
                    className="w-full md:w-auto"
                  >
                    {ghostFunnel.cta.primary_text}
                  </PremiumButton>
                  <div className="flex gap-2 justify-center">
                    <PremiumButton 
                      variant="ghost" 
                      size="md"
                    >
                      {ghostFunnel.cta.secondary_text}
                    </PremiumButton>
                  </div>
                </div>
                
                {/* Urgency Message */}
                <p 
                  className="text-sm font-medium"
                  style={{ 
                    color: `hsl(var(--brand-primary))`,
                    fontFamily: 'var(--brand-font-body)'
                  }}
                >
                  ⏰ {ghostFunnel.cta.urgency}
                </p>
              </div>
            </div>
          </PremiumCard>

          {/* Dettagli Tecnici (Collassabile) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Dettagli Tecnici</span>
                <BrandStyleIndicator style={ghostFunnel.style} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Immagini Suggerite */}
              <div className="space-y-2">
                <h3 className="font-semibold">Immagini Suggerite</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ghostFunnel.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="p-3 rounded-lg border"
                      style={{ 
                        borderColor: `hsl(var(--brand-primary) / 0.2)`,
                        backgroundColor: `hsl(var(--brand-surface))`
                      }}
                    >
                      <h4 className="font-medium capitalize">{image.type}</h4>
                      <p className="text-sm text-muted-foreground">{image.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              {ghostFunnel.execution_metadata && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Metadata Esecuzione</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Tempo totale:</strong> {ghostFunnel.execution_metadata.total_time_ms}ms</p>
                    <p><strong>Modelli utilizzati:</strong> {ghostFunnel.execution_metadata.models_used?.join(', ')}</p>
                    <p><strong>Confidence Score:</strong> 
                      <span className="ml-2">
                        Market: {(ghostFunnel.execution_metadata.confidence_scores?.market_research * 100).toFixed(1)}%, 
                        Story: {(ghostFunnel.execution_metadata.confidence_scores?.storytelling * 100).toFixed(1)}%, 
                        Orchestration: {(ghostFunnel.execution_metadata.confidence_scores?.orchestration * 100).toFixed(1)}%
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}