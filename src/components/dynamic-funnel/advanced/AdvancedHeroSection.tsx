import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface AdvancedHeroSectionProps {
  data: any;
  theme: any;
  productImage?: string;
  onNext: () => void;
}

export const AdvancedHeroSection: React.FC<AdvancedHeroSectionProps> = ({
  data,
  theme,
  productImage,
  onNext
}) => {
  return (
    <div className="text-center space-y-8 py-16 relative overflow-hidden">
      {/* Background with theme colors */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${theme?.primaryColor || 'hsl(240, 100%, 50%)'}, ${theme?.secondaryColor || 'hsl(300, 100%, 60%)'})`
        }}
      />
      
      <div className="relative z-10 space-y-6">
        {productImage && (
          <div className="flex justify-center mb-8">
            <img 
              src={productImage} 
              alt="Product" 
              className="w-64 h-64 object-cover rounded-2xl shadow-2xl animate-fade-in"
            />
          </div>
        )}
        
        <div className="space-y-4 animate-fade-in">
          <h1 
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${theme?.primaryColor || 'hsl(240, 100%, 50%)'}, ${theme?.secondaryColor || 'hsl(300, 100%, 60%)'})`
            }}
          >
            {data?.headline || 'Amazing Product'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {data?.subheadline || 'Transform your life today'}
          </p>
          {data?.urgencyText && (
            <div className="inline-block px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium animate-pulse">
              ⚡ {data.urgencyText}
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={onNext} 
            className="animate-pulse hover:scale-105 transition-transform"
            style={{
              background: `linear-gradient(135deg, ${theme?.primaryColor || 'hsl(240, 100%, 50%)'}, ${theme?.accentColor || 'hsl(45, 100%, 55%)'})`
            }}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {data?.ctaText || 'Scopri di più'}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};