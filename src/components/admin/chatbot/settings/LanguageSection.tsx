
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChatBotSettings } from '@/types/chatbot';

interface LanguageSectionProps {
  language: ChatBotSettings['language'];
  onChange: (value: ChatBotSettings['language']) => void;
}

const LanguageSection: React.FC<LanguageSectionProps> = ({
  language,
  onChange
}) => {
  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium text-white mb-4">Lingua</h3>
        
        <RadioGroup 
          value={language}
          onValueChange={onChange}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="italian" id="italian" className="border-golden text-golden" />
            <Label htmlFor="italian" className="text-white cursor-pointer">Italiano</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="english" id="english" className="border-golden text-golden" />
            <Label htmlFor="english" className="text-white cursor-pointer">Inglese</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default LanguageSection;
