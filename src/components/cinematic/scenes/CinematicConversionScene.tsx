
// Cinematic Conversion Scene - Final conversion form

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CinematicScene, IntelligentCinematicFunnel } from '@/services/intelligentCinematicService';
import { Gift, Shield, Zap, ArrowRight } from 'lucide-react';

interface CinematicConversionSceneProps {
  scene: CinematicScene;
  funnel: IntelligentCinematicFunnel;
  onLeadSubmit: (data: any) => void;
  performanceMode: 'high' | 'medium' | 'low';
  userInteractions: number;
}

export const CinematicConversionScene: React.FC<CinematicConversionSceneProps> = ({
  scene,
  funnel,
  onLeadSubmit,
  performanceMode,
  userInteractions
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const content = scene.content;
  const form = content.form;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      const requiredFields = form.fields.filter((field: any) => field.required);
      const missingFields = requiredFields.filter((field: any) => !formData[field.name]);
      
      if (missingFields.length > 0) {
        throw new Error('Compila tutti i campi richiesti');
      }

      await onLeadSubmit(formData);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Headlines & Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Main Headline */}
            <div className="space-y-4">
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-white leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {content.headline}
              </motion.h2>
              
              {content.subheadline && (
                <motion.p
                  className="text-xl text-white/80 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                >
                  {content.subheadline}
                </motion.p>
              )}
            </div>

            {/* Benefits Grid */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <div className="flex items-center space-x-3 text-white/90">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <span>Dati protetti e sicuri al 100%</span>
              </div>
              
              <div className="flex items-center space-x-3 text-white/90">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <span>Risposta entro 24 ore garantita</span>
              </div>
              
              <div className="flex items-center space-x-3 text-white/90">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-purple-400" />
                </div>
                <span>{form.incentive}</span>
              </div>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i}
                      className={`w-8 h-8 rounded-full bg-gradient-to-r ${
                        i === 1 ? 'from-blue-400 to-purple-500' :
                        i === 2 ? 'from-green-400 to-blue-500' :
                        'from-purple-400 to-pink-500'
                      } border-2 border-white/20 flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {['MR', 'LB', 'AG'][i-1]}
                    </div>
                  ))}
                </div>
                <div className="text-white/80 text-sm">
                  <strong className="text-white">1,247+</strong> clienti hanno già trasformato il loro business
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Conversion Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Form Header */}
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white">{form.title}</h3>
                    <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
                      <Gift className="w-4 h-4 mr-2" />
                      {form.incentive}
                    </Badge>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    {form.fields.map((field: any, index: number) => (
                      <motion.div
                        key={field.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 + (index * 0.1) }}
                      >
                        <div className="relative">
                          <Input
                            type={field.type}
                            placeholder={field.label}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            onFocus={() => setFocusedField(field.name)}
                            onBlur={() => setFocusedField(null)}
                            required={field.required}
                            className="bg-white/10 border-white/30 text-white placeholder-white/60 focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 transition-all duration-300"
                            style={{
                              backgroundColor: focusedField === field.name ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
                              transform: focusedField === field.name ? 'scale(1.02)' : 'scale(1)',
                            }}
                          />
                          {field.required && (
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400">*</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                  >
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white py-4 text-lg font-semibold rounded-full shadow-2xl border-0 transition-all duration-300"
                      style={{
                        boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
                      }}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Invio in corso...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          {form.submitText}
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>
                  </motion.div>

                  {/* Trust Badge */}
                  <motion.div
                    className="text-center text-white/60 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                  >
                    🔒 I tuoi dati sono protetti e non verranno mai condivisi
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
