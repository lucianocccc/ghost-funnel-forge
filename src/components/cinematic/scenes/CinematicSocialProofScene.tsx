
// Cinematic Social Proof Scene - Testimonials and trust

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CinematicScene, IntelligentCinematicFunnel } from '@/services/intelligentCinematicService';
import { ArrowRight, Star, Quote } from 'lucide-react';

interface CinematicSocialProofSceneProps {
  scene: CinematicScene;
  funnel: IntelligentCinematicFunnel;
  onProgress: () => void;
  performanceMode: 'high' | 'medium' | 'low';
  userInteractions: number;
}

export const CinematicSocialProofScene: React.FC<CinematicSocialProofSceneProps> = ({
  scene,
  funnel,
  onProgress,
  performanceMode,
  userInteractions
}) => {
  const content = scene.content;
  const testimonials = content.testimonials || [];

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
              Storie di Successo
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Scopri come {funnel.productContext.name} ha trasformato il business dei nostri clienti
            </p>
          </motion.div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 + (index * 0.3) }}
              >
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 h-full hover:bg-white/15 transition-all duration-300">
                  <CardContent className="p-8 space-y-6">
                    {/* Quote Icon */}
                    <div className="flex justify-center">
                      <Quote className="w-8 h-8 text-primary opacity-60" />
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-white/90 text-lg leading-relaxed italic">
                      "{testimonial.text}"
                    </p>

                    {/* Rating */}
                    <div className="flex justify-center space-x-1">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>

                    {/* Author */}
                    <div className="text-center">
                      <div className="text-white font-semibold">
                        {testimonial.name}
                      </div>
                      <div className="text-white/60 text-sm">
                        {testimonial.role}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8"
          >
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-2">1,247+</div>
                <div className="text-white/60">Clienti Soddisfatti</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">98%</div>
                <div className="text-white/60">Tasso di Successo</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">4.9★</div>
                <div className="text-white/60">Rating Medio</div>
              </div>
            </div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex justify-center space-x-6"
          >
            <Badge className="bg-green-500/20 text-green-200 border-green-500/30">
              ✓ Certificato ISO 27001
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30">
              ✓ GDPR Compliant
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">
              ✓ 24/7 Support
            </Badge>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="pt-8"
          >
            <Button
              onClick={onProgress}
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl border-0"
            >
              <span className="flex items-center gap-3">
                Unisciti al Successo
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
