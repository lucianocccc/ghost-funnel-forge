
import React from 'react';

interface FormFooterProps {
  isAnalyzing: boolean;
}

const FormFooter: React.FC<FormFooterProps> = ({ isAnalyzing }) => {
  return (
    <div className="mt-8 text-center">
      <p className="text-sm text-gray-500">
        I tuoi dati sono al sicuro. Li utilizzeremo solo per contattarti.
      </p>
      {isAnalyzing && (
        <p className="text-xs text-golden mt-2">
          🧠 Stiamo creando un funnel personalizzato per te con l'AI
        </p>
      )}
    </div>
  );
};

export default FormFooter;
