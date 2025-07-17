
// Cinematic Hero Scene - Dynamic hero section

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CinematicScene, IntelligentCinematicFunnel } from '@/services/intelligentCinematicService';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

interface CinematicHeroSceneProps {
  scene: CinematicScene;
  funnel: IntelligentCinematicFunnel;
  onProgress: () => void;
  performanceMode: 'high' | 'medium' | 'low';
  userInteractions: number;
}

export const CinematicHeroScene: React.FC<CinematicHeroSceneProps> = ({
  scene,
  funnel,
  onProgress,
  performanceMode,
  userInteractions
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const content = scene.content;

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        {/* Main Headlines */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Product Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Badge 
              variant="outline" 
              className="bg-white/10 text-white border-white/20 px-4 py-2 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {funnel.productContext.industry || 'Innovazione'}
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(255,255,255,0.1)',
            }}
          >
            {content.headline}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {content.subheadline}
          </motion.p>

          {/* Urgency Element */}
          {content.urgencyText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="inline-flex items-center bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-full px-4 py-2 text-orange-200"
            >
              <Zap className="w-4 h-4 mr-2" />
              {content.urgencyText}
            </motion.div>
          )}

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="pt-8"
          >
            <Button
              onClick={onProgress}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl border-0 transition-all duration-300"
              style={{
                boxShadow: isHovered ? '0 0 40px rgba(255,255,255,0.3)' : '0 0 20px rgba(255,255,255,0.1)',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <span className="flex items-center gap-3">
                {content.ctaText}
                <motion.div
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </span>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="pt-12 flex justify-center items-center space-x-8 text-white/60"
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔒</span>
              <span className="text-sm">100% Sicuro</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚡</span>
              <span className="text-sm">Risultati Immediati</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏆</span>
              <span className="text-sm">Garantito</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Action Hint */}
        {performanceMode === 'high' && (
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-white/40 text-sm">
              Scorri per continuare ↓
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
