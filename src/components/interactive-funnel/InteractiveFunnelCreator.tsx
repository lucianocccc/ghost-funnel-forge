
import React from 'react';
import TypedFunnelGenerator from '@/components/funnel-types/TypedFunnelGenerator';

const InteractiveFunnelCreator: React.FC = () => {
  const handleFunnelGenerated = (funnel: any) => {
    console.log('✅ Funnel created successfully:', funnel);
    // The funnel is already saved to the database by the generation process
    // The user can navigate to it using the preview link
  };

  return (
    <div className="space-y-6">
      <TypedFunnelGenerator 
        onFunnelGenerated={handleFunnelGenerated}
      />
    </div>
  );
};

export default InteractiveFunnelCreator;
