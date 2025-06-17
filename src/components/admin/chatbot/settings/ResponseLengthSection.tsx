
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChatBotSettings } from '@/types/chatbot';

interface ResponseLengthSectionProps {
  responseLength: ChatBotSettings['responseLength'];
  onChange: (value: ChatBotSettings['responseLength']) => void;
}

const ResponseLengthSection: React.FC<ResponseLengthSectionProps> = ({
  responseLength,
  onChange
}) => {
  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium text-white mb-4">Lunghezza delle risposte</h3>
        
        <RadioGroup 
          value={responseLength}
          onValueChange={onChange}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="concise" id="concise" className="border-golden text-golden" />
            <Label htmlFor="concise" className="text-white cursor-pointer">Concise</Label>
            <span className="text-xs text-gray-400 ml-2">(Risposte brevi e al punto)</span>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="detailed" id="detailed" className="border-golden text-golden" />
            <Label htmlFor="detailed" className="text-white cursor-pointer">Dettagliate</Label>
            <span className="text-xs text-gray-400 ml-2">(Risposte con spiegazioni e contesto)</span>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="comprehensive" id="comprehensive" className="border-golden text-golden" />
            <Label htmlFor="comprehensive" className="text-white cursor-pointer">Complete</Label>
            <span className="text-xs text-gray-400 ml-2">(Risposte esaustive e approfondite)</span>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ResponseLengthSection;
