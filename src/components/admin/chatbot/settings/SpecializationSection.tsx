
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChatBotSettings } from '@/types/chatbot';

interface SpecializationSectionProps {
  specialization: ChatBotSettings['specialization'];
  onChange: (value: ChatBotSettings['specialization']) => void;
}

const SpecializationSection: React.FC<SpecializationSectionProps> = ({
  specialization,
  onChange
}) => {
  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium text-white mb-4">Specializzazione</h3>
        
        <RadioGroup 
          value={specialization}
          onValueChange={onChange}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="marketing" id="marketing" className="border-golden text-golden" />
            <Label htmlFor="marketing" className="text-white cursor-pointer">Marketing</Label>
            <span className="text-xs text-gray-400 ml-2">(Focus su strategie e contenuti di marketing)</span>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sales" id="sales" className="border-golden text-golden" />
            <Label htmlFor="sales" className="text-white cursor-pointer">Vendite</Label>
            <span className="text-xs text-gray-400 ml-2">(Orientato alla conversione e alla vendita)</span>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="technical" id="technical" className="border-golden text-golden" />
            <Label htmlFor="technical" className="text-white cursor-pointer">Tecnico</Label>
            <span className="text-xs text-gray-400 ml-2">(Conoscenze tecniche e implementazioni)</span>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="general" id="general" className="border-golden text-golden" />
            <Label htmlFor="general" className="text-white cursor-pointer">Generale</Label>
            <span className="text-xs text-gray-400 ml-2">(Bilanciato tra tutti gli aspetti)</span>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default SpecializationSection;
