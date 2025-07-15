import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, ArrowDown, CheckCircle, Circle } from 'lucide-react';
import { InteractiveFunnelStep } from '@/types/interactiveFunnel';

interface FunnelPreviewProps {
  steps: InteractiveFunnelStep[];
  currentEditingStep?: {
    id?: string;
    title: string;
    description: string;
    step_type: string;
    is_required: boolean;
    fields_config?: any[];
    settings?: any;
    step_order?: number;
  };
}

const FunnelPreview: React.FC<FunnelPreviewProps> = ({ steps, currentEditingStep }) => {
  // Combina gli step esistenti con quello che si sta editando
  const previewSteps = React.useMemo(() => {
    if (!currentEditingStep) return steps;
    
    // Se si sta editando uno step esistente, sostituiscilo
    const existingIndex = steps.findIndex(step => step.id === currentEditingStep.id);
    if (existingIndex !== -1) {
      const newSteps = [...steps];
      newSteps[existingIndex] = { ...newSteps[existingIndex], ...currentEditingStep };
      return newSteps;
    }
    
    // Se si sta creando un nuovo step, aggiungilo
    const newStep = {
      ...currentEditingStep,
      id: currentEditingStep.id || `preview-${Date.now()}`,
      step_order: currentEditingStep.step_order || steps.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      funnel_id: '',
      fields_config: (currentEditingStep.fields_config || []) as any,
      settings: (currentEditingStep.settings || {}) as any
    } as InteractiveFunnelStep;
    
    return [...steps, newStep];
  }, [steps, currentEditingStep]);

  const sortedSteps = [...previewSteps].sort((a, b) => a.step_order - b.step_order);

  return (
    <Card className="h-fit sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Preview Funnel
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Anteprima in tempo reale del tuo funnel
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedSteps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Circle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nessun passo nel funnel</p>
            <p className="text-sm">Inizia creando il primo passo</p>
          </div>
        ) : (
          sortedSteps.map((step, index) => (
            <div key={step.id || `preview-${index}`} className="space-y-2">
              <div className={`
                relative p-4 border rounded-lg transition-all duration-300
                ${step.id === currentEditingStep?.id 
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/30'
                }
              `}>
                <div className="flex items-start gap-3">
                  <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {step.title || 'Nuovo Passo'}
                    </h4>
                    {step.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {step.description}
                      </p>
                    )}
                    
                    <div className="flex gap-1 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs h-5">
                        {step.step_type}
                      </Badge>
                      {step.is_required && (
                        <Badge variant="secondary" className="text-xs h-5">
                          Obbligatorio
                        </Badge>
                      )}
                      {step.fields_config && Array.isArray(step.fields_config) && step.fields_config.length > 0 && (
                        <Badge variant="outline" className="text-xs h-5">
                          {step.fields_config.length} campi
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {step.id === currentEditingStep?.id && (
                    <div className="text-primary">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
                
                {step.id === currentEditingStep?.id && (
                  <div className="absolute inset-0 bg-primary/5 rounded-lg pointer-events-none" />
                )}
              </div>
              
              {index < sortedSteps.length - 1 && (
                <div className="flex justify-center">
                  <ArrowDown className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))
        )}
        
        {sortedSteps.length > 0 && (
          <div className="border-t pt-3 mt-4">
            <div className="text-center text-sm text-muted-foreground">
              <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <p>Funnel completo!</p>
              <p className="text-xs">
                {sortedSteps.length} {sortedSteps.length === 1 ? 'passo' : 'passi'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FunnelPreview;