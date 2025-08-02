import React, { useState } from 'react';
import { Wand2, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ModularFunnelConfig } from '@/hooks/useModularFunnelConfig';
import { ModularFunnelGeneration } from '@/hooks/useModularFunnelGeneration';

interface GenerationPanelProps {
  onGenerate: (prompt: string, options: any) => Promise<void>;
  loading: boolean;
  currentGeneration: ModularFunnelGeneration | null;
  config: ModularFunnelConfig;
}

export const GenerationPanel: React.FC<GenerationPanelProps> = ({
  onGenerate,
  loading,
  currentGeneration,
  config
}) => {
  const [prompt, setPrompt] = useState('');
  const [advancedOptions, setAdvancedOptions] = useState({
    tone: 'professional',
    style: 'modern',
    complexity: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    include_analytics: true,
    mobile_optimized: true
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    await onGenerate(prompt, advancedOptions);
    setPrompt('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return <Loader2 className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completata';
      case 'failed': return 'Fallita';
      case 'processing': return 'In elaborazione...';
      case 'pending': return 'In attesa...';
      default: return 'Sconosciuto';
    }
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-medium">AI Generator</h3>
      </div>

      {/* Current Generation Status */}
      {currentGeneration && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Generazione Corrente</CardTitle>
              <div className="flex items-center gap-2">
                {getStatusIcon(currentGeneration.generation_status)}
                <span className="text-xs">
                  {getStatusText(currentGeneration.generation_status)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {currentGeneration.generation_status === 'processing' && (
              <div className="space-y-2">
                <Progress value={65} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  L'AI sta analizzando i tuoi requisiti e generando il funnel...
                </p>
              </div>
            )}
            {currentGeneration.generation_status === 'completed' && (
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">
                  Generazione completata con successo
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Il tuo funnel è pronto! Controlla il canvas per vedere i risultati.
                </p>
              </div>
            )}
            {currentGeneration.generation_status === 'failed' && (
              <div className="space-y-2">
                <Badge variant="destructive" className="text-xs">
                  Generazione fallita
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Si è verificato un errore. Riprova con un prompt diverso.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generation Form */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-sm">Genera con AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Context Info */}
          <div className="bg-muted/50 rounded-md p-3 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">Contesto:</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>• Settore: {config.industry || 'Non specificato'}</div>
              <div>• Target: {config.target_audience || 'Non specificato'}</div>
              <div>• Obiettivo: {config.funnel_objective || 'Non specificato'}</div>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Descrivi il funnel che vuoi generare</Label>
            <Textarea
              id="prompt"
              placeholder="es. Crea un funnel per vendere un corso online di marketing digitale. Deve includere una landing page accattivante, sezioni di social proof e un form di iscrizione con sconto limitato nel tempo."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Advanced Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Opzioni Avanzate</Label>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Tono</Label>
                <Select
                  value={advancedOptions.tone}
                  onValueChange={(value) => 
                    setAdvancedOptions({ ...advancedOptions, tone: value })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="professional">Professionale</SelectItem>
                    <SelectItem value="friendly">Amichevole</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Complessità</Label>
                <Select
                  value={advancedOptions.complexity}
                  onValueChange={(value: any) => 
                    setAdvancedOptions({ ...advancedOptions, complexity: value })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="beginner">Semplice</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Ottimizzato Mobile</Label>
                <Switch
                  checked={advancedOptions.mobile_optimized}
                  onCheckedChange={(checked) =>
                    setAdvancedOptions({ ...advancedOptions, mobile_optimized: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs">Include Analytics</Label>
                <Switch
                  checked={advancedOptions.include_analytics}
                  onCheckedChange={(checked) =>
                    setAdvancedOptions({ ...advancedOptions, include_analytics: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim() || currentGeneration?.generation_status === 'processing'}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generazione in corso...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Genera Funnel
              </>
            )}
          </Button>

          {/* Quick Templates */}
          <div className="space-y-2">
            <Label className="text-xs">Template Rapidi</Label>
            <div className="grid gap-1">
              {[
                'Funnel lead generation con magnet',
                'Landing page vendita corso online',
                'Funnel webinar con iscrizione',
                'Pagina vendita prodotto fisico'
              ].map((template) => (
                <Button
                  key={template}
                  variant="ghost"
                  size="sm"
                  className="justify-start h-8 text-xs"
                  onClick={() => setPrompt(template)}
                  disabled={loading}
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};