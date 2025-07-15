
import React from 'react';
import { InteractiveFunnelWithSteps } from '@/types/interactiveFunnel';
import FunnelEditorHeader from './FunnelEditorHeader';
import DraggableStepsList from './DraggableStepsList';
import StepFormCreator from './StepFormCreator';
import FunnelPreview from './FunnelPreview';
import { useStepFormData } from '../hooks/useStepFormData';

interface FunnelEditorLayoutProps {
  funnel: InteractiveFunnelWithSteps;
  onSave?: () => void;
  onPreview: () => void;
  onSaveStep: () => void;
  onDeleteStep: (stepId: string) => void;
  onEditStep: (step: any) => void;
  onStepsReorder: (steps: any[]) => void;
}

const FunnelEditorLayout: React.FC<FunnelEditorLayoutProps> = ({
  funnel,
  onSave,
  onPreview,
  onSaveStep,
  onDeleteStep,
  onEditStep,
  onStepsReorder
}) => {
  const { stepData, updateStepData } = useStepFormData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <FunnelEditorHeader
          funnel={funnel}
          onSave={onSave}
          onPreview={onPreview}
        />

        <DraggableStepsList
          steps={funnel.interactive_funnel_steps || []}
          onDeleteStep={onDeleteStep}
          onEditStep={onEditStep}
          onStepsReorder={onStepsReorder}
        />

        <StepFormCreator
          stepData={stepData}
          onUpdateStepData={updateStepData}
          onSave={onSaveStep}
        />
      </div>
      
      <div className="lg:col-span-1">
        <FunnelPreview 
          steps={funnel.interactive_funnel_steps || []}
          currentEditingStep={stepData.title ? stepData : undefined}
        />
      </div>
    </div>
  );
};

export default FunnelEditorLayout;
