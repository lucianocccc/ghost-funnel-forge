import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Palette } from 'lucide-react';

interface BrandStyleIndicatorProps {
  style: 'Apple' | 'Nike' | 'Amazon';
  className?: string;
}

const BrandStyleIndicator: React.FC<BrandStyleIndicatorProps> = ({ style, className }) => {
  const getStyleInfo = () => {
    switch (style) {
      case 'Apple':
        return {
          description: 'Minimalista ed Elegante',
          color: 'hsl(210 100% 50%)',
          traits: ['Clean', 'Sofisticato', 'Premium']
        };
      case 'Nike':
        return {
          description: 'Dinamico ed Energico',
          color: 'hsl(0 0% 0%)',
          traits: ['Motivazionale', 'Sportivo', 'Boldface']
        };
      case 'Amazon':
        return {
          description: 'Professionale e Affidabile',
          color: 'hsl(36 100% 50%)',
          traits: ['Trustworthy', 'Efficiente', 'Business']
        };
    }
  };

  const styleInfo = getStyleInfo();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className="w-4 h-4 rounded-full border-2 border-white shadow-md"
        style={{ backgroundColor: styleInfo.color }}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 opacity-70" />
          <span className="font-semibold">{style}</span>
          <span className="text-sm opacity-70">- {styleInfo.description}</span>
        </div>
        <div className="flex gap-1 mt-1">
          {styleInfo.traits.map((trait, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-xs py-0 px-2"
              style={{ 
                borderColor: styleInfo.color,
                color: styleInfo.color
              }}
            >
              {trait}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandStyleIndicator;