import React, { useState } from 'react';
import { useAIContentPopulator } from '@/hooks/useAIContentPopulator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const AIContentTester: React.FC = () => {
  const {
    isGenerating,
    generateSectionContent,
    contentCache
  } = useAIContentPopulator();

  const [formData, setFormData] = useState({
    productName: 'blablala',
    industry: 'technology',
    audience: 'aziende di 10-200 dipendenti',
    benefits: ['facoltà d\'uso', 'integrazione semplice'],
    brandVoice: 'professional' as 'apple' | 'nike' | 'amazon' | 'luxury' | 'friendly' | 'professional' | 'startup',
    sectionType: 'hero' as 'hero' | 'discovery' | 'benefits' | 'emotional' | 'conversion' | 'qualification'
  });

  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const handleGenerate = async () => {
    try {
      const content = await generateSectionContent({
        sectionType: formData.sectionType,
        productName: formData.productName,
        industry: formData.industry,
        audience: formData.audience,
        benefits: formData.benefits,
        brandVoice: formData.brandVoice
      });

      setGeneratedContent(content);
      toast.success('Contenuto generato con successo!');
    } catch (error) {
      console.error('Errore nella generazione:', error);
      toast.error('Errore nella generazione del contenuto');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Test AI Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productName">Nome Prodotto</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="Es. ProjectFlow Pro"
              />
            </div>

            <div>
              <Label htmlFor="industry">Settore</Label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                value={formData.audience}
                onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
                placeholder="Es. aziende di 10-200 dipendenti"
              />
            </div>

            <div>
              <Label htmlFor="brandVoice">Brand Voice</Label>
              <Select 
                value={formData.brandVoice} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, brandVoice: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="apple">Apple-like</SelectItem>
                  <SelectItem value="nike">Nike-style</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="benefits">Benefits (separati da virgola)</Label>
              <Input
                id="benefits"
                value={formData.benefits.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  benefits: e.target.value.split(',').map(b => b.trim()).filter(Boolean)
                }))}
                placeholder="Es. facilità d'uso, integrazione, velocità"
              />
            </div>

            <div>
              <Label htmlFor="sectionType">Tipo Sezione</Label>
              <Select 
                value={formData.sectionType} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, sectionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero">Hero Section</SelectItem>
                  <SelectItem value="discovery">Discovery</SelectItem>
                  <SelectItem value="benefits">Benefits</SelectItem>
                  <SelectItem value="emotional">Emotional</SelectItem>
                  <SelectItem value="conversion">Conversion</SelectItem>
                  <SelectItem value="qualification">Qualification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !formData.productName}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generando contenuto...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Genera Contenuto AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content Display */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Contenuto Generato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-primary">Title:</Label>
              <p className="text-lg font-bold">{generatedContent.title}</p>
            </div>
            
            <div>
              <Label className="text-sm font-semibold text-primary">Subtitle:</Label>
              <p className="text-base">{generatedContent.subtitle}</p>
            </div>
            
            <div>
              <Label className="text-sm font-semibold text-primary">Content:</Label>
              <p className="text-sm text-muted-foreground">{generatedContent.content}</p>
            </div>
            
            <div>
              <Label className="text-sm font-semibold text-primary">CTA:</Label>
              <p className="text-sm font-medium bg-primary text-primary-foreground px-3 py-1 rounded inline-block">
                {generatedContent.cta}
              </p>
            </div>

            {generatedContent.metadata && (
              <div className="bg-muted p-3 rounded text-xs">
                <Label className="text-sm font-semibold">Metadata:</Label>
                <pre className="mt-1 overflow-x-auto">
                  {JSON.stringify(generatedContent.metadata, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cache Display */}
      {Object.keys(contentCache).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Content Cache ({Object.keys(contentCache).length} items)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(contentCache).map(([key, content]) => (
                <div key={key} className="bg-muted p-2 rounded text-xs">
                  <div className="font-medium">{key}</div>
                  <div className="text-muted-foreground">{content.title}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};