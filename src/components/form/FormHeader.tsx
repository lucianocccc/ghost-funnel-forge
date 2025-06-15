
import React from 'react';
import { Sparkles, Brain } from 'lucide-react';

interface FormHeaderProps {
  isAnalyzing: boolean;
}

const FormHeader: React.FC<FormHeaderProps> = ({ isAnalyzing }) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
        <Sparkles className="w-8 h-8 text-golden" />
      </div>
      <h2 className="text-3xl font-bold text-black mb-2">
        Inizia il Tuo Percorso
      </h2>
      <p className="text-gray-600">
        Compila il form per ricevere una consulenza personalizzata
      </p>
      {isAnalyzing && (
        <div className="mt-4 flex items-center justify-center gap-2 text-black">
          <Brain className="w-5 h-5 text-golden animate-pulse" />
          <span className="text-sm">GPT sta analizzando i tuoi dati...</span>
        </div>
      )}
    </div>
  );
};

export default FormHeader;
