
import React from 'react';

const FunnelEditorError: React.FC = () => {
  return (
    <div className="text-center py-8">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Funnel non trovato</h3>
      <p className="text-gray-500">Il funnel richiesto non esiste o non hai i permessi per visualizzarlo.</p>
    </div>
  );
};

export default FunnelEditorError;
