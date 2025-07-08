import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Shield, Heart, Zap } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  star: Star, shield: Shield, heart: Heart, zap: Zap
};

interface AdvancedBenefitsSectionProps {
  data: any[];
  theme: any;
  productName: string;
  onNext: () => void;
}

export const AdvancedBenefitsSection: React.FC<AdvancedBenefitsSectionProps> = ({
  data, theme, productName, onNext
}) => {
  return (
    <div className="space-y-12 py-12">
      <h2 className="text-3xl font-bold text-center">
        Perché scegliere {productName}?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((benefit, index) => {
          const IconComponent = iconMap[benefit.icon] || Star;
          
          return (
            <Card 
              key={index} 
              className={`p-6 hover:scale-105 transition-all duration-300 animate-fade-in ${
                benefit.highlight ? 'ring-2' : ''
              }`} 
              style={{ 
                animationDelay: `${index * 0.2}s`,
                borderColor: benefit.highlight ? theme?.primaryColor : undefined
              }}
            >
              <CardContent className="p-0 text-center space-y-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{
                    background: `linear-gradient(135deg, ${theme?.primaryColor || 'hsl(240, 100%, 50%)'}, ${theme?.secondaryColor || 'hsl(300, 100%, 60%)'})`
                  }}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
                {benefit.statistic && (
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: theme?.primaryColor }}
                  >
                    {benefit.statistic}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center">
        <Button size="lg" onClick={onNext}>
          Scopri le testimonianze
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};