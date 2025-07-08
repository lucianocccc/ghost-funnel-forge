import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowRight, Users, Clock } from 'lucide-react';

interface AdvancedSocialProofProps {
  data: any;
  theme: any;
  urgencyMechanics?: any;
  onNext: () => void;
}

export const AdvancedSocialProof: React.FC<AdvancedSocialProofProps> = ({
  data, theme, urgencyMechanics, onNext
}) => {
  return (
    <div className="space-y-12 py-12">
      <h2 className="text-3xl font-bold text-center">
        Cosa dicono i nostri clienti
      </h2>
      
      {/* Statistics */}
      {data?.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {data.statistics.map((stat: any, index: number) => (
            <div key={index} className="text-center">
              <div 
                className="text-4xl font-bold mb-2"
                style={{ color: theme?.primaryColor }}
              >
                {stat.number}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
      
      {/* Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.testimonials?.map((testimonial: any, index: number) => (
          <Card key={index} className="p-6 animate-fade-in" style={{ animationDelay: `${index * 0.3}s` }}>
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                {testimonial.verified && (
                  <Badge variant="outline" className="text-xs">✓ Verificato</Badge>
                )}
              </div>
              <p className="text-muted-foreground italic">"{testimonial.text}"</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                {testimonial.role && (
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Trust indicators */}
      <div className="text-center space-y-6">
        <div className="flex flex-wrap justify-center gap-2">
          {data?.trustIndicators?.map((indicator: string, index: number) => (
            <Badge key={index} variant="outline" className="text-sm">
              {indicator}
            </Badge>
          ))}
        </div>
        
        {/* Urgency mechanics */}
        {urgencyMechanics && (
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{urgencyMechanics.message}</span>
          </div>
        )}
        
        <Button size="lg" onClick={onNext}>
          Prova tu stesso
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};