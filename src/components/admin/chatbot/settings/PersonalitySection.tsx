
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChatBotSettings } from '@/types/chatbot';

interface PersonalitySectionProps {
  personality: ChatBotSettings['personality'];
  onChange: (value: ChatBotSettings['personality']) => void;
}

const PersonalitySection: React.FC<PersonalitySectionProps> = ({
  personality,
  onChange
}) => {
  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium text-white mb-4">Personalità</h3>
        
        <RadioGroup 
          value={personality}
          onValueChange={onChange}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="professional" id="professional" className="border-golden text-golden" />
            <Label htmlFor="professional" className="text-white cursor-pointer">Professionale</Label>
            <span className="text-xs text-gray-400 ml-2">(Tono formale e orientato ai risultati)</span>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="friendly" id="friendly" className="border-golden text-golden" />
            <Label htmlFor="friendly" className="text-white cursor-pointer">Amichevole</Label>
            <span className="text-xs text-gray-400 ml-2">(Tono cordiale e conversazionale)</span>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="analytical" id="analytical" className="border-golden text-golden" />
            <Label htmlFor="analytical" className="text-white cursor-pointer">Analitico</Label>
            <span className="text-xs text-gray-400 ml-2">(Focus su dati e analisi dettagliate)</span>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="creative" id="creative" className="border-golden text-golden" />
            <Label htmlFor="creative" className="text-white cursor-pointer">Creativo</Label>
            <span className="text-xs text-gray-400 ml-2">(Pensiero laterale e soluzioni innovative)</span>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default PersonalitySection;
