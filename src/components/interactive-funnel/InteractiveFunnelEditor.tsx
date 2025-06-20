
import React from 'react';
import FunnelEditorLoading from './components/FunnelEditorLoading';
import FunnelEditorError from './components/FunnelEditorError';
import FunnelEditorLayout from './components/FunnelEditorLayout';
import { useInteractiveFunnelEditor } from './hooks/useInteractiveFunnelEditor';

interface InteractiveFunnelEditorProps {
  funnelId: string;
  onSave?: () => void;
}

const InteractiveFunnelEditor: React.FC<InteractiveFunnelEditorProps> = ({ 
  funnelId, 
  onSave 
}) => {
  const {
    funnel,
    loading,
    saveStep,
    deleteStep,
    previewFunnel
  } = useInteractiveFunnelEditor(funnelId);

  if (loading) {
    return <FunnelEditorLoading />;
  }

  if (!funnel) {
    return <FunnelEditorError />;
  }

  return (
    <FunnelEditorLayout
      funnel={funnel}
      onSave={onSave}
      onPreview={previewFunnel}
      onSaveStep={saveStep}
      onDeleteStep={deleteStep}
    />
  );
};

export default InteractiveFunnelEditor;
