
// Cinematic Benefits Scene - Showcase product benefits

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CinematicScene, IntelligentCinematicFunnel } from '@/services/intelligentCinematicService';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface CinematicBenefitsSceneProps {
  scene: CinematicScene;
  funnel: IntelligentCinematicFunnel;
  onProgress: () => void;
  performanceMode: 'high' | 'medium' | 'low';
  userInteractions: number;
}

export const CinematicBenefitsScene: React.FC<CinematicBenefitsSceneProps> = ({
  scene,
  funnel,
  onProgress,
  performanceMode,
  userInteractions
}) => {
  const content = scene.content;
  const benefits = content.benefits || [];

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center space-y-12">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Vantaggi Rivoluzionari
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Scopri come {funnel.productContext.name} può trasformare il tuo business
            </p>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 + (index * 0.2) }}
              >
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 h-full hover:bg-white/15 transition-all duration-300">
                  <CardContent className="p-8 text-center space-y-6">
                    <motion.div
                      className="text-6xl"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.5
                      }}
                    >
                      {benefit.icon}
                    </motion.div>
                    
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-white">
                        {benefit.title}
                      </h3>
                      <p className="text-white/70">
                        {benefit.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-center text-green-400">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Garantito</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="pt-8"
          >
            <Button
              onClick={onProgress}
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl border-0"
            >
              <span className="flex items-center gap-3">
                Scopri di Più
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
