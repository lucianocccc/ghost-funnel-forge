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
    <div className="text-center space-y-8 py-16 relative min-h-screen flex items-center justify-center">
      <div className="relative z-10 space-y-6 bg-black/20 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
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
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r bg-clip-text text-transparent text-white"
            style={{
              backgroundImage: `linear-gradient(to right, ${theme?.primaryColor || 'hsl(240, 100%, 50%)'}, ${theme?.secondaryColor || 'hsl(300, 100%, 60%)'})`
            }}
          >
            {data?.headline || 'Amazing Product'}
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            {data?.subheadline || 'Transform your life today'}
          </p>
          {data?.urgencyText && (
            <div className="inline-block px-4 py-2 bg-orange-500/80 text-white rounded-full text-sm font-medium animate-pulse">
              ⚡ {data.urgencyText}
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={onNext} 
            className="animate-pulse hover:scale-105 transition-transform text-white font-bold"
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