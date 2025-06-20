
import React from 'react';
import { InteractiveFunnelWithSteps } from '@/types/interactiveFunnel';
import FunnelEditorHeader from './FunnelEditorHeader';
import ExistingStepsList from './ExistingStepsList';
import StepFormCreator from './StepFormCreator';
import { useStepFormData } from '../hooks/useStepFormData';

interface FunnelEditorLayoutProps {
  funnel: InteractiveFunnelWithSteps;
  onSave?: () => void;
  onPreview: () => void;
  onSaveStep: () => void;
  onDeleteStep: (stepId: string) => void;
}

const FunnelEditorLayout: React.FC<FunnelEditorLayoutProps> = ({
  funnel,
  onSave,
  onPreview,
  onSaveStep,
  onDeleteStep
}) => {
  const { stepData, updateStepData } = useStepFormData();

  return (
    <div className="space-y-6">
      <FunnelEditorHeader
        funnel={funnel}
        onSave={onSave}
        onPreview={onPreview}
      />

      <ExistingStepsList
        steps={funnel.interactive_funnel_steps || []}
        onDeleteStep={onDeleteStep}
      />

      <StepFormCreator
        stepData={stepData}
        onUpdateStepData={updateStepData}
        onSave={onSaveStep}
      />
    </div>
  );
};

export default FunnelEditorLayout;
