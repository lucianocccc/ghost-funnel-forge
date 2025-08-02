import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useModularFunnelConfig, ModularFunnelConfig } from '@/hooks/useModularFunnelConfig';
import { useToast } from '@/hooks/use-toast';

interface FunnelConfigFormProps {
  onConfigCreated?: (config: ModularFunnelConfig) => void;
  initialConfig?: Partial<ModularFunnelConfig>;
}

const industries = [
  'coaching',
  'consulting', 
  'ecommerce',
  'saas',
  'education',
  'healthcare',
  'finance',
  'real-estate',
  'fitness',
  'altri'
];

const objectives = [
  'lead_generation',
  'sales',
  'email_collection',
  'webinar_signup',
  'product_launch',
  'brand_awareness',
  'customer_retention'
];

export const FunnelConfigForm: React.FC<FunnelConfigFormProps> = ({
  onConfigCreated,
  initialConfig
}) => {
  const [formData, setFormData] = useState({
    config_name: initialConfig?.config_name || '',
    industry: initialConfig?.industry || '',
    target_audience: initialConfig?.target_audience || '',
    funnel_objective: initialConfig?.funnel_objective || '',
    description: ''
  });

  const { createConfig, loading } = useModularFunnelConfig();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.config_name.trim()) {
      toast({
        title: "Errore",
        description: "Il nome della configurazione è obbligatorio",
        variant: "destructive"
      });
      return;
    }

    try {
      const newConfig = await createConfig({
        config_name: formData.config_name,
        industry: formData.industry,
        target_audience: formData.target_audience,
        funnel_objective: formData.funnel_objective,
        sections_config: [],
        global_settings: {
          theme: 'professional',
          colorScheme: 'primary',
          typography: 'modern'
        }
      });

      if (newConfig && onConfigCreated) {
        onConfigCreated(newConfig);
      }

      toast({
        title: "Successo",
        description: "Configurazione creata con successo"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile creare la configurazione",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialConfig ? 'Modifica Configurazione' : 'Nuova Configurazione Funnel'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="config_name">Nome Configurazione *</Label>
            <Input
              id="config_name"
              placeholder="es. Funnel Lead Generation B2B"
              value={formData.config_name}
              onChange={(e) => setFormData({ ...formData, config_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Settore</Label>
              <Select value={formData.industry} onValueChange={(value) => 
                setFormData({ ...formData, industry: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona settore" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry.charAt(0).toUpperCase() + industry.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="funnel_objective">Obiettivo Principale</Label>
              <Select value={formData.funnel_objective} onValueChange={(value) => 
                setFormData({ ...formData, funnel_objective: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona obiettivo" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {objectives.map((objective) => (
                    <SelectItem key={objective} value={objective}>
                      {objective.replace('_', ' ').charAt(0).toUpperCase() + 
                       objective.replace('_', ' ').slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_audience">Target Audience</Label>
            <Textarea
              id="target_audience"
              placeholder="Descrivi il tuo pubblico target (es. Imprenditori 30-50 anni, PMI nel settore tech, etc.)"
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creazione...' : 'Crea Configurazione'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};