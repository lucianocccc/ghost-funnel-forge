
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface TemperatureSectionProps {
  temperature: number;
  onChange: (value: number) => void;
}

const TemperatureSection: React.FC<TemperatureSectionProps> = ({
  temperature,
  onChange
}) => {
  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Creatività (Temperature)</h3>
          <span className="text-golden font-semibold">{temperature.toFixed(1)}</span>
        </div>
        
        <Slider
          value={[temperature]}
          min={0}
          max={1}
          step={0.1}
          onValueChange={(value) => onChange(value[0])}
          className="my-4"
        />
        
        <div className="flex justify-between text-sm text-gray-400">
          <span>Preciso</span>
          <span>Bilanciato</span>
          <span>Creativo</span>
        </div>
        
        <p className="text-xs text-gray-400 mt-4">
          Un valore più basso produce risposte più deterministiche e coerenti.
          Un valore più alto produce risposte più diverse e creative.
        </p>
      </CardContent>
    </Card>
  );
};

export default TemperatureSection;
