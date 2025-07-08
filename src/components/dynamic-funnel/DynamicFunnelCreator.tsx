import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DynamicProductFunnel } from './DynamicProductFunnel';
import { useToast } from '@/hooks/use-toast';
import { 
  Wand2, 
  Sparkles, 
  Target, 
  Users,
  Zap,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface ProductConfig {
  productName: string;
  productDescription: string;
  targetAudience: string;
  industry: string;
}

const industryOptions = [
  'Food & Beverage',
  'Health & Wellness',
  'Technology',
  'Fashion & Beauty',
  'Home & Garden',
  'Sports & Fitness',
  'Education',
  'Travel & Tourism',
  'Professional Services',
  'Entertainment',
  'Altro'
];

const audienceOptions = [
  'Giovani adulti (18-30)',
  'Professionisti (30-45)',
  'Famiglie con bambini',
  'Senior (50+)',
  'Studenti',
  'Imprenditori',
  'Appassionati di fitness',
  'Amanti del cibo',
  'Tech enthusiasts',
  'Altro'
];

export const DynamicFunnelCreator: React.FC = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<'config' | 'funnel'>('config');
  const [config, setConfig] = useState<ProductConfig>({
    productName: '',
    productDescription: '',
    targetAudience: '',
    industry: ''
  });

  const [presetExamples] = useState([
    {
      name: 'Pane ai Mirtilli Artigianale',
      description: 'Pane fresco fatto in casa con mirtilli biologici, senza conservanti, perfetto per una colazione sana e gustosa.',
      audience: 'Famiglie con bambini',
      industry: 'Food & Beverage'
    },
    {
      name: 'Corso di Yoga Online',
      description: 'Corso completo di yoga per principianti, con lezioni video HD e supporto personale dell\'istruttore.',
      audience: 'Professionisti (30-45)',
      industry: 'Health & Wellness'
    },
    {
      name: 'App di Meditazione',
      description: 'App mobile per la meditazione guidata con sessioni personalizzate e tracking del progresso.',
      audience: 'Giovani adulti (18-30)',
      industry: 'Health & Wellness'
    },
    {
      name: 'Consulenza Marketing',
      description: 'Servizi di consulenza marketing digitale per piccole e medie imprese, con focus sui social media.',
      audience: 'Imprenditori',
      industry: 'Professional Services'
    }
  ]);

  const handleInputChange = (field: keyof ProductConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const loadPreset = (preset: any) => {
    setConfig({
      productName: preset.name,
      productDescription: preset.description,
      targetAudience: preset.audience,
      industry: preset.industry
    });
  };

  const startFunnelGeneration = () => {
    if (!config.productName.trim()) {
      toast({
        title: "Campo Richiesto",
        description: "Inserisci il nome del prodotto per continuare.",
        variant: "destructive"
      });
      return;
    }

    setStep('funnel');
  };

  const handleLeadCapture = (leadData: any) => {
    console.log('Lead captured:', leadData);
    toast({
      title: "🎉 Lead Acquisito!",
      description: `Lead catturato per ${config.productName}`,
    });
  };

  const resetCreator = () => {
    setStep('config');
    setConfig({
      productName: '',
      productDescription: '',
      targetAudience: '',
      industry: ''
    });
  };

  if (step === 'funnel') {
    return (
      <div>
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Funnel Generato per: {config.productName}</h3>
              <p className="text-sm text-muted-foreground">
                {config.targetAudience} • {config.industry}
              </p>
            </div>
            <Button variant="outline" onClick={resetCreator}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Nuovo Funnel
            </Button>
          </div>
        </div>

        <DynamicProductFunnel
          productName={config.productName}
          productDescription={config.productDescription}
          targetAudience={config.targetAudience}
          industry={config.industry}
          onLeadCapture={handleLeadCapture}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🚀 Creatore di Funnel Dinamici
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Genera automaticamente landing page animate e persuasive per qualsiasi prodotto. 
          L'AI creerà un'esperienza personalizzata che converte.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center p-6">
          <CardContent className="p-0 space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Generazione AI</h3>
            <p className="text-muted-foreground">
              Contenuti persuasivi generati automaticamente per il tuo prodotto
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-6">
          <CardContent className="p-0 space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Animazioni Fluide</h3>
            <p className="text-muted-foreground">
              Landing page animate che catturano l'attenzione
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-6">
          <CardContent className="p-0 space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Conversione Ottimizzata</h3>
            <p className="text-muted-foreground">
              Progettato per massimizzare le conversioni senza essere invadente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Esempi Rapidi
          </CardTitle>
          <CardDescription>
            Clicca su un esempio per iniziare velocemente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presetExamples.map((preset, index) => (
              <Card key={index} className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => loadPreset(preset)}>
                <div className="space-y-2">
                  <h4 className="font-semibold">{preset.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {preset.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">{preset.audience}</Badge>
                    <Badge variant="outline" className="text-xs">{preset.industry}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Configura il Tuo Prodotto
          </CardTitle>
          <CardDescription>
            Fornisci informazioni sul tuo prodotto per generare un funnel personalizzato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nome del Prodotto <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="es. Pane ai Mirtilli Artigianale"
              value={config.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrizione del Prodotto</label>
            <Textarea
              placeholder="Descrivi il tuo prodotto, i suoi benefici e cosa lo rende speciale..."
              value={config.productDescription}
              onChange={(e) => handleInputChange('productDescription', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <Select value={config.targetAudience} onValueChange={(value) => handleInputChange('targetAudience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona il pubblico target" />
                </SelectTrigger>
                <SelectContent>
                  {audienceOptions.map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Settore</label>
              <Select value={config.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona il settore" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            size="lg"
            onClick={startFunnelGeneration}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            disabled={!config.productName.trim()}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Genera Funnel Dinamico
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};