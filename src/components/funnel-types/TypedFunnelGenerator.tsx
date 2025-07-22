
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import StandardFunnelTypeSelector from './StandardFunnelTypeSelector';
import { useStandardFunnelGeneration } from '@/hooks/useStandardFunnelGeneration';
import { StandardFunnelStructure } from '@/services/standardFunnelStructures';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TypedFunnelGeneratorProps {
  onFunnelGenerated?: (funnel: any) => void;
  onBack?: () => void;
}

const TypedFunnelGenerator: React.FC<TypedFunnelGeneratorProps> = ({
  onFunnelGenerated,
  onBack
}) => {
  const [selectedStructure, setSelectedStructure] = useState<StandardFunnelStructure | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [step, setStep] = useState<'select' | 'generate' | 'result'>('select');
  
  const {
    loading,
    generatedFunnel,
    generateCustomFunnel,
    generateStandardFunnel,
    clearGeneratedFunnel
  } = useStandardFunnelGeneration();

  const handleSelectStructure = async (structure: StandardFunnelStructure) => {
    console.log('🎯 Structure selected:', structure.name);
    setSelectedStructure(structure);
    setStep('generate');
    
    // Generate funnel using the standardized structure
    await generateFunnel(structure, null);
  };

  const handleGenerateCustom = async (prompt: string) => {
    console.log('🎯 Custom generation started with prompt:', prompt.substring(0, 100));
    setCustomPrompt(prompt);
    setSelectedStructure(null);
    setStep('generate');
    await generateFunnel(null, prompt);
  };

  const generateFunnel = async (structure: StandardFunnelStructure | null, prompt: string | null) => {
    try {
      console.log('🚀 Starting funnel generation:', { 
        structure: structure?.name || 'custom',
        prompt: prompt?.substring(0, 50) + '...' || 'from structure'
      });
      
      const funnel = structure 
        ? await generateStandardFunnel(structure)
        : await generateCustomFunnel(prompt!);
      
      if (funnel) {
        console.log('✅ Funnel generated successfully:', funnel.name);
        setStep('result');
        onFunnelGenerated?.(funnel);
      } else {
        console.error('❌ Funnel generation failed - no funnel returned');
        setStep('select');
      }
    } catch (error) {
      console.error('💥 Error in generateFunnel:', error);
      setStep('select');
    }
  };

  const handleBack = () => {
    if (step === 'generate') {
      setStep('select');
      setSelectedStructure(null);
      setCustomPrompt('');
    } else if (step === 'result') {
      setStep('select');
      clearGeneratedFunnel();
      setSelectedStructure(null);
      setCustomPrompt('');
    } else {
      onBack?.();
    }
  };

  const openFunnelPreview = () => {
    if (generatedFunnel?.share_token) {
      window.open(`/shared-interactive-funnel/${generatedFunnel.share_token}`, '_blank');
    }
  };

  if (step === 'select') {
    return (
      <div className="space-y-6">
        {onBack && (
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Indietro
          </Button>
        )}
        
        <StandardFunnelTypeSelector
          onSelectType={handleSelectStructure}
          onGenerateWithoutType={handleGenerateCustom}
        />
      </div>
    );
  }

  if (step === 'generate') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} disabled={loading}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Indietro
          </Button>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-golden border-t-transparent rounded-full animate-spin"></div>
          <h3 className="text-xl font-semibold mb-2">
            {selectedStructure ? `Generazione ${selectedStructure.name}...` : 'Generazione Funnel Personalizzato...'}
          </h3>
          <p className="text-gray-600">
            Stiamo creando il tuo funnel utilizzando le migliori pratiche del settore...
          </p>
          
          {loading && (
            <div className="mt-4 text-sm text-gray-500">
              ⚡ Applicazione struttura standardizzata...
            </div>
          )}
        </div>

        {selectedStructure && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedStructure.name}
                <Badge className="ml-2">{selectedStructure.category}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{selectedStructure.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Settore:</strong> {selectedStructure.industry}
                </div>
                <div>
                  <strong>Target:</strong> {selectedStructure.target_audience}
                </div>
                <div>
                  <strong>Complessità:</strong> {selectedStructure.complexity_level}
                </div>
                <div>
                  <strong>Passi:</strong> {selectedStructure.steps.length}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (step === 'result' && generatedFunnel) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Genera Altro Funnel
          </Button>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            ✅ Funnel Generato con Successo!
          </h2>
          <p className="text-gray-600">
            Il tuo funnel è pronto e già pubblicato
          </p>
        </div>

        <Card className="border-green-200">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{generatedFunnel.name}</CardTitle>
                {selectedStructure && (
                  <div className="flex gap-2 mt-2">
                    <Badge>{selectedStructure.name}</Badge>
                    <Badge variant="outline">{selectedStructure.category}</Badge>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={openFunnelPreview}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Anteprima
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{generatedFunnel.description}</p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Passi del Funnel ({generatedFunnel.steps?.length || 0})</h4>
                <div className="space-y-2">
                  {generatedFunnel.steps?.map((step: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-golden rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {step.step_order || index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{step.title}</div>
                        <div className="text-sm text-gray-600">{step.description}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {step.step_type}
                      </Badge>
                    </div>
                  )) || []}
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={openFunnelPreview}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visualizza Funnel Completo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default TypedFunnelGenerator;
