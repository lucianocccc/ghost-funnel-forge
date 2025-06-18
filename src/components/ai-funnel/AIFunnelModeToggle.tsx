
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Zap } from 'lucide-react';

interface AIFunnelModeToggleProps {
  mode: 'quick' | 'conversation';
  onModeChange: (mode: 'quick' | 'conversation') => void;
}

const AIFunnelModeToggle: React.FC<AIFunnelModeToggleProps> = ({
  mode,
  onModeChange
}) => {
  return (
    <Card className="mb-6 bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            Scegli la modalità di creazione
          </h3>
          <p className="text-gray-400 text-sm">
            Preferisci una generazione rapida o una conversazione guidata?
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={mode === 'quick' ? 'default' : 'outline'}
            onClick={() => onModeChange('quick')}
            className={`h-auto p-4 flex flex-col items-center gap-2 ${
              mode === 'quick' 
                ? 'bg-golden hover:bg-yellow-600 text-black' 
                : 'border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Zap className="w-6 h-6" />
            <div className="text-center">
              <div className="font-semibold">Generazione Rapida</div>
              <div className="text-xs opacity-80">Risultati istantanei</div>
            </div>
          </Button>
          
          <Button
            variant={mode === 'conversation' ? 'default' : 'outline'}
            onClick={() => onModeChange('conversation')}
            className={`h-auto p-4 flex flex-col items-center gap-2 ${
              mode === 'conversation' 
                ? 'bg-golden hover:bg-yellow-600 text-black' 
                : 'border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <MessageCircle className="w-6 h-6" />
            <div className="text-center">
              <div className="font-semibold">Conversazione Guidata</div>
              <div className="text-xs opacity-80">Personalizzazione profonda</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIFunnelModeToggle;
