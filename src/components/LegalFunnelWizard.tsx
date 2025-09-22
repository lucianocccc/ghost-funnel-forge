import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Scale, FileText, Building2, Users, Clock, MapPin } from 'lucide-react';
import { useLegalFunnelGenerator, LegalFunnelRequest } from '@/hooks/useLegalFunnelGenerator';
import { ComplianceStatusIndicator } from '@/components/ComplianceStatusIndicator';

const STUDIO_TYPES = [
  { value: 'penale', label: 'Studio Penale', icon: '⚖️' },
  { value: 'civile', label: 'Studio Civile', icon: '🏠' },
  { value: 'commerciale', label: 'Studio Commerciale', icon: '💼' },
  { value: 'societario', label: 'Diritto Societario', icon: '🏢' },
  { value: 'tributario', label: 'Diritto Tributario', icon: '💰' },
  { value: 'notarile', label: 'Studio Notarile', icon: '📋' },
];

const SERVIZI_PER_TIPO = {
  penale: ['Difesa penale', 'Reati economici', 'Diritto penitenziario', 'Reati contro la persona'],
  civile: ['Divorzio consensuale', 'Successioni', 'Contratti immobiliari', 'Risarcimento danni'],
  commerciale: ['Recupero crediti', 'Contratti commerciali', 'Fallimenti', 'Arbitrato'],
  societario: ['Costituzione società', 'Fusioni e acquisizioni', 'Corporate governance', 'Due diligence'],
  tributario: ['Consulenza fiscale', 'Contenzioso tributario', 'Pianificazione fiscale', 'Transfer pricing'],
  notarile: ['Atti immobiliari', 'Costituzione società', 'Testamenti', 'Contratti preliminari'],
};

const TARGET_AUDIENCES = [
  { value: 'privati', label: 'Clienti Privati', description: 'Persone fisiche e famiglie' },
  { value: 'pmi', label: 'PMI', description: 'Piccole e medie imprese' },
  { value: 'grandi_aziende', label: 'Grandi Aziende', description: 'Multinazionali e corporate' },
  { value: 'enti_pubblici', label: 'Enti Pubblici', description: 'PA e organizzazioni pubbliche' },
];

export const LegalFunnelWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<LegalFunnelRequest>>({});
  const { isGenerating, generatedFunnel, complianceReport, generateLegalFunnel } = useLegalFunnelGenerator();

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (isFormValid()) {
      await generateLegalFunnel(formData as LegalFunnelRequest);
    }
  };

  const isFormValid = () => {
    return formData.studioType && 
           formData.nomeStudio && 
           formData.citta && 
           formData.targetAudience &&
           formData.servizi && formData.servizi.length > 0;
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep1 = () => (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          Tipo di Studio Legale
        </CardTitle>
        <CardDescription>
          Seleziona l'area principale di specializzazione del tuo studio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {STUDIO_TYPES.map((tipo) => (
            <div
              key={tipo.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                formData.studioType === tipo.value ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => updateFormData('studioType', tipo.value)}
            >
              <div className="text-2xl mb-2">{tipo.icon}</div>
              <div className="font-medium">{tipo.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Servizi e Specializzazioni
        </CardTitle>
        <CardDescription>
          Seleziona i servizi che offre il tuo studio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-3 block">Servizi Principali</Label>
          <div className="grid grid-cols-2 gap-3">
            {formData.studioType && SERVIZI_PER_TIPO[formData.studioType as keyof typeof SERVIZI_PER_TIPO]?.map((servizio) => (
              <div key={servizio} className="flex items-center space-x-2">
                <Checkbox
                  id={servizio}
                  checked={formData.servizi?.includes(servizio)}
                  onCheckedChange={(checked) => {
                    const currentServizi = formData.servizi || [];
                    if (checked) {
                      updateFormData('servizi', [...currentServizi, servizio]);
                    } else {
                      updateFormData('servizi', currentServizi.filter(s => s !== servizio));
                    }
                  }}
                />
                <Label htmlFor={servizio} className="text-sm">{servizio}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="anni_esperienza">Anni di Esperienza</Label>
          <Input
            id="anni_esperienza"
            type="number"
            placeholder="es. 15"
            value={formData.anni_esperienza || ''}
            onChange={(e) => updateFormData('anni_esperienza', parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Target di Clientela
        </CardTitle>
        <CardDescription>
          Chi sono i tuoi clienti principali?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {TARGET_AUDIENCES.map((target) => (
            <div
              key={target.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                formData.targetAudience === target.value ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => updateFormData('targetAudience', target.value)}
            >
              <div className="font-medium">{target.label}</div>
              <div className="text-sm text-muted-foreground">{target.description}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Informazioni Studio
        </CardTitle>
        <CardDescription>
          Dettagli del tuo studio legale
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="nomeStudio">Nome dello Studio</Label>
          <Input
            id="nomeStudio"
            placeholder="es. Studio Legale Rossi & Associati"
            value={formData.nomeStudio || ''}
            onChange={(e) => updateFormData('nomeStudio', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="citta">Città</Label>
          <Input
            id="citta"
            placeholder="es. Milano"
            value={formData.citta || ''}
            onChange={(e) => updateFormData('citta', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="budgetMedio">Budget Medio per Pratica</Label>
          <Select value={formData.budgetMedio} onValueChange={(value) => updateFormData('budgetMedio', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Seleziona range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="500-2000">€500 - €2.000</SelectItem>
              <SelectItem value="2000-5000">€2.000 - €5.000</SelectItem>
              <SelectItem value="5000-15000">€5.000 - €15.000</SelectItem>
              <SelectItem value="15000+">€15.000+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="urgenza">Tipologia Clienti</Label>
          <Select value={formData.urgenza} onValueChange={(value) => updateFormData('urgenza', value as any)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Seleziona tipologia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bassa">Pratiche di routine</SelectItem>
              <SelectItem value="media">Casi mediamente complessi</SelectItem>
              <SelectItem value="alta">Emergenze e casi urgenti</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          Riepilogo e Generazione
        </CardTitle>
        <CardDescription>
          Verifica i dettagli prima di generare il funnel legale professionale
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/30 p-4 rounded-lg space-y-3">
          <div><strong>Studio:</strong> {formData.nomeStudio} - {formData.citta}</div>
          <div><strong>Specializzazione:</strong> {STUDIO_TYPES.find(t => t.value === formData.studioType)?.label}</div>
          <div><strong>Target:</strong> {TARGET_AUDIENCES.find(t => t.value === formData.targetAudience)?.label}</div>
          <div>
            <strong>Servizi:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {formData.servizi?.map(servizio => (
                <Badge key={servizio} variant="secondary" className="text-xs">
                  {servizio}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Scale className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <div className="font-medium text-amber-800 dark:text-amber-200">Conformità Deontologica</div>
              <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Il funnel sarà generato nel rispetto del Codice Deontologico Forense,
                evitando linguaggio promozionale aggressivo e garantendo trasparenza professionale.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (generatedFunnel) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Funnel Legale Generato</h2>
          <ComplianceStatusIndicator 
            isCompliant={generatedFunnel.compliance_status.isCompliant}
            errorCount={generatedFunnel.compliance_status.issues?.filter(i => i.severity === 'error').length || 0}
            warningCount={generatedFunnel.compliance_status.issues?.filter(i => i.severity === 'warning').length || 0}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{generatedFunnel.name}</CardTitle>
            <CardDescription>{generatedFunnel.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Struttura Funnel</h3>
                <div className="space-y-2">
                  {generatedFunnel.funnel_structure?.steps?.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                      <Badge variant="outline">{step.type}</Badge>
                      <span className="font-medium">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Preview HTML</h3>
                <div className="border rounded p-4 bg-white max-h-96 overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: generatedFunnel.html_content }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Legal Funnel Generator</h1>
          <p className="text-muted-foreground">
            Crea funnel professionali conformi al Codice Deontologico Forense
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Step {currentStep} di 5
        </Badge>
      </div>

      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / 5) * 100}%` }}
        />
      </div>

      <div className="min-h-[500px]">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          Indietro
        </Button>
        
        {currentStep < 5 ? (
          <Button 
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !formData.studioType) ||
              (currentStep === 2 && (!formData.servizi || formData.servizi.length === 0)) ||
              (currentStep === 3 && !formData.targetAudience) ||
              (currentStep === 4 && (!formData.nomeStudio || !formData.citta))
            }
          >
            Avanti
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid() || isGenerating}
            className="min-w-[120px]"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generando...
              </div>
            ) : (
              'Genera Funnel'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};