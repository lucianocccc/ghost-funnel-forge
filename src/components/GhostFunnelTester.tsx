import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useGhostFunnelOrchestrator, type GhostFunnelRequest } from '@/hooks/useGhostFunnelOrchestrator';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateGhostFunnel(formData);
  };

  const handleInputChange = (field: keyof GhostFunnelRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        <Card>
          <CardHeader>
            <CardTitle>Risultato Ghost Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hero Section */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Hero Section</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p><strong>Headline:</strong> {ghostFunnel.hero.headline}</p>
                <p><strong>Subheadline:</strong> {ghostFunnel.hero.subheadline}</p>
                <p><strong>CTA:</strong> {ghostFunnel.hero.cta_text}</p>
              </div>
            </div>

            {/* Advantages */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Vantaggi</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ghostFunnel.advantages.map((advantage, index) => (
                  <div key={index} className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium">{advantage.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{advantage.description}</p>
                    {advantage.icon && <p className="text-xs mt-2">Icon: {advantage.icon}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Emotional Section */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Sezione Emotiva</h3>
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <h4 className="font-medium">Storia:</h4>
                  <p className="text-sm">{ghostFunnel.emotional.story}</p>
                </div>
                <div>
                  <h4 className="font-medium">Pain Points:</h4>
                  <ul className="text-sm list-disc list-inside">
                    {ghostFunnel.emotional.pain_points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Trasformazione:</h4>
                  <p className="text-sm">{ghostFunnel.emotional.transformation}</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Call to Action</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p><strong>CTA Primaria:</strong> {ghostFunnel.cta.primary_text}</p>
                <p><strong>CTA Secondaria:</strong> {ghostFunnel.cta.secondary_text}</p>
                <p><strong>Urgenza:</strong> {ghostFunnel.cta.urgency}</p>
              </div>
            </div>

            {/* Style and Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Stile Brand</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium">{ghostFunnel.style}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Immagini Suggerite</h3>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  {ghostFunnel.images.map((image, index) => (
                    <div key={index} className="text-sm">
                      <p><strong>{image.type}:</strong> {image.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}