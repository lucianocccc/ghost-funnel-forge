
// Intelligent Product Showcase - Integration component

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IntelligentCinematicPlayer } from '@/components/cinematic/IntelligentCinematicPlayer';
import { ProductContext } from '@/services/intelligentCinematicService';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { generateBrandVisualTheme } from '@/theme/visualTheme';

interface IntelligentProductShowcaseProps {
  productName: string;
  productDescription?: string;
  targetAudience?: string;
  industry?: string;
  visualStyle?: 'minimal' | 'dynamic' | 'elegant' | 'technical';
  onLeadCapture?: (data: any) => void;
  className?: string;
}

export const IntelligentProductShowcase: React.FC<IntelligentProductShowcaseProps> = ({
  productName,
  productDescription,
  targetAudience,
  industry,
  visualStyle = 'dynamic',
  onLeadCapture,
  className = ''
}) => {
  const { toast } = useToast();
  const [showCinematic, setShowCinematic] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const visualTheme = generateBrandVisualTheme(productName, industry, visualStyle);

  const productContext: ProductContext = {
    name: productName,
    description: productDescription,
    industry,
    targetAudience,
    visualStyle,
    brandColors: {
      primary: `hsl(${visualTheme.palette.primary})`,
      secondary: `hsl(${visualTheme.palette.secondary})`, 
      accent: `hsl(${visualTheme.palette.accent})`
    }
  };

  useEffect(() => {
    // Auto-start cinematic experience after a brief delay
    const timer = setTimeout(() => {
      setShowCinematic(true);
      setIsReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLeadCapture = (leadData: any) => {
    console.log('🎯 Lead captured through intelligent cinematic funnel:', leadData);
    onLeadCapture?.(leadData);

    toast({
      title: "🎉 Perfetto!",
      description: `Grazie per il tuo interesse in ${productName}. Ti contatteremo presto!`,
      duration: 5000,
    });
  };

  const handleComplete = () => {
    toast({
      title: "✨ Esperienza Completata",
      description: "Grazie per aver esplorato la nostra esperienza cinematica!",
      duration: 4000,
    });
  };

  if (!isReady) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 ${className}`}>
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Preparando l'Esperienza
            </h2>
            <p className="text-muted-foreground">
              Creando una presentazione cinematica per <span className="font-semibold text-primary">{productName}</span>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={visualTheme}>
      <div className={`relative ${className}`}>
        <AnimatePresence mode="wait">
          {showCinematic ? (
            <motion.div
              key="cinematic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="min-h-screen"
            >
              <IntelligentCinematicPlayer
                productContext={productContext}
                onLeadCapture={handleLeadCapture}
                onComplete={handleComplete}
                className="min-h-screen"
              />
            </motion.div>
          ) : (
            <motion.div
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex items-center justify-center"
            >
              <Card className="max-w-md w-full mx-4">
                <CardContent className="p-8 text-center space-y-6">
                  <h2 className="text-2xl font-bold">🎬 Esperienza Cinematica</h2>
                  <p className="text-muted-foreground">
                    Stai per vivere una presentazione immersiva di {productName}
                  </p>
                  <Button 
                    onClick={() => setShowCinematic(true)}
                    size="lg"
                    className="w-full"
                  >
                    Inizia l'Esperienza
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
};
