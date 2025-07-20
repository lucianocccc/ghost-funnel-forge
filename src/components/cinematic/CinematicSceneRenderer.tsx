
// Cinematic Scene Renderer - Updated for Dynamic Adaptive Content

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Star, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  Shield, 
  Heart,
  Zap,
  Target,
  Users,
  TrendingUp
} from 'lucide-react';
import { CinematicScene, IntelligentCinematicFunnel } from '@/services/intelligentCinematicService';
import { UserBehaviorProfile } from '@/services/adaptiveStepGenerator';

interface CinematicSceneRendererProps {
  scene: CinematicScene;
  funnel: IntelligentCinematicFunnel;
  onProgress: (userResponse?: any) => void;
  onLeadSubmit: (data: any) => void;
  performanceMode: 'high' | 'medium' | 'low';
  userInteractions: any[];
  adaptiveData?: {
    userProfile?: UserBehaviorProfile;
    currentEngagement: number;
    sessionTime: number;
  };
}

export const CinematicSceneRenderer: React.FC<CinematicSceneRendererProps> = ({
  scene,
  funnel,
  onProgress,
  onLeadSubmit,
  performanceMode,
  userInteractions,
  adaptiveData
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});

  // Ottieni contenuto personalizzato basato sul dispositivo
  const getResponsiveContent = () => {
    const deviceType = adaptiveData?.userProfile?.deviceType || 'desktop';
    return scene.content.responsiveContent?.[deviceType] || scene.content;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (scene.type === 'capture') {
        // Submit del lead con tutti i dati raccolti
        await onLeadSubmit({
          ...formData,
          sceneResponses: selectedOptions,
          adaptiveInsights: adaptiveData
        });
      } else {
        // Progresso normale con risposta dell'utente
        onProgress({
          ...formData,
          ...selectedOptions,
          sceneId: scene.id,
          sceneType: scene.type
        });
      }
    } catch (error) {
      console.error('Error submitting scene data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSceneContent = () => {
    const content = getResponsiveContent();
    
    switch (scene.type) {
      case 'hook':
        return renderHookScene(content);
      case 'qualify':
        return renderQualificationScene(content);
      case 'solution':
      case 'benefits':
        return renderSolutionScene(content);
      case 'social_proof':
        return renderSocialProofScene(content);
      case 'urgency':
        return renderUrgencyScene(content);
      case 'capture':
        return renderCaptureScene(content);
      default:
        return renderGenericScene(content);
    }
  };

  const renderHookScene = (content: any) => (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-4"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          {content.headline}
        </h1>
        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
          {content.subheadline}
        </p>
      </motion.div>

      {/* Elementi visivi adattivi */}
      {content.cinematicEnhancements?.particleEffects && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Particle effects basati su engagement */}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Button
          onClick={() => onProgress({ engaged: true })}
          size="lg"
          className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90"
        >
          {content.cta} <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );

  const renderQualificationScene = (content: any) => (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          {content.headline}
        </h2>
        <p className="text-lg text-white/80">
          Aiutaci a personalizzare la tua esperienza
        </p>
      </motion.div>

      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-8">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {content.questions?.map((question: any, index: number) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="space-y-3"
              >
                <label className="text-white font-medium">
                  {question.text}
                </label>
                
                {question.type === 'radio' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {question.options?.map((option: string, optIndex: number) => (
                      <motion.button
                        key={optIndex}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedOptions(prev => ({
                          ...prev,
                          [question.id]: option
                        }))}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedOptions[question.id] === option
                            ? 'border-white bg-white/20'
                            : 'border-white/30 hover:border-white/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white">{option}</span>
                          {selectedOptions[question.id] === option && (
                            <CheckCircle className="w-5 h-5 text-white" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {question.type === 'select' && (
                  <select
                    value={selectedOptions[question.id] || ''}
                    onChange={(e) => setSelectedOptions(prev => ({
                      ...prev,
                      [question.id]: e.target.value
                    }))}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/30 text-white"
                  >
                    <option value="">Seleziona...</option>
                    {question.options?.map((option: string, optIndex: number) => (
                      <option key={optIndex} value={option} className="text-black">
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {question.type === 'textarea' && (
                  <Textarea
                    value={selectedOptions[question.id] || ''}
                    onChange={(e) => setSelectedOptions(prev => ({
                      ...prev,
                      [question.id]: e.target.value
                    }))}
                    placeholder="Racconta di più..."
                    className="bg-white/10 border-white/30 text-white placeholder-white/50"
                    rows={3}
                  />
                )}
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center"
            >
              <Button
                type="submit"
                disabled={isSubmitting || Object.keys(selectedOptions).length === 0}
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
              >
                {isSubmitting ? 'Elaborazione...' : 'Continua'} 
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderSolutionScene = (content: any) => (
    <div className="max-w-6xl mx-auto space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-white">
          {content.headline}
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {content.benefits?.map((benefit: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <Card className="h-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                  {getBenefitIcon(benefit.title)}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {benefit.title}
                </h3>
                <p className="text-white/80">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Proof points adattivi */}
      {content.proof && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {content.proof.map((proof: any, index: number) => (
            <Card key={index} className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                {proof.type === 'testimonial' && (
                  <div className="space-y-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <p className="text-white italic">"{proof.content}"</p>
                    <p className="text-white/60">- {proof.author}</p>
                  </div>
                )}
                {proof.type === 'statistic' && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {proof.content}
                    </div>
                    <p className="text-white/80">{proof.source}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <Button
          onClick={() => onProgress({ needsMoreInfo: false })}
          size="lg"
          className="bg-white text-primary hover:bg-white/90"
        >
          Perfetto, continuiamo <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );

  const renderCaptureScene = (content: any) => (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          {content.headline}
        </h2>
        
        {content.incentive && (
          <Badge className="bg-yellow-500 text-yellow-900 text-lg px-4 py-2">
            🎁 {content.incentive}
          </Badge>
        )}

        {content.urgency && (
          <div className="flex items-center justify-center space-x-2 text-orange-300">
            <Clock className="w-5 h-5" />
            <span className="font-medium">{content.urgency}</span>
          </div>
        )}
      </motion.div>

      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-8">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {content.form?.fields?.map((field: any, index: number) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <label className="block text-white font-medium mb-2">
                  {field.label} {field.required && <span className="text-red-300">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <Textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))}
                    required={field.required}
                    className="bg-white/10 border-white/30 text-white placeholder-white/50"
                    rows={3}
                  />
                ) : (
                  <Input
                    type={field.type || 'text'}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))}
                    required={field.required}
                    className="bg-white/10 border-white/30 text-white placeholder-white/50"
                  />
                )}
              </motion.div>
            ))}

            {/* Trust indicators */}
            {content.trust && (
              <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60">
                {content.trust.map((trustItem: string, index: number) => (
                  <div key={index} className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>{trustItem}</span>
                  </div>
                ))}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold"
              >
                {isSubmitting ? 'Invio in corso...' : content.form?.submitText || 'Ottieni la Tua Soluzione'}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderGenericScene = (content: any) => (
    <div className="text-center space-y-8">
      <h2 className="text-3xl md:text-4xl font-bold text-white">
        {content.headline || scene.title}
      </h2>
      <p className="text-lg text-white/80 max-w-2xl mx-auto">
        {content.subheadline || content.description}
      </p>
      <Button
        onClick={() => onProgress()}
        size="lg"
        className="bg-white text-primary hover:bg-white/90"
      >
        Continua <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  );

  const renderSocialProofScene = (content: any) => (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {content.headline}
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {content.testimonials?.map((testimonial: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.2 }}
          >
            <Card className="h-full bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-white/60">{testimonial.company}</div>
                  </div>
                </div>
                <div className="text-green-400 font-bold text-lg">
                  {testimonial.result}
                </div>
                <div className="flex text-yellow-400">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <Button
          onClick={() => onProgress()}
          size="lg"
          className="bg-white text-primary hover:bg-white/90"
        >
          Unisciti a loro <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );

  const renderUrgencyScene = (content: any) => (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="text-6xl">⚡</div>
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          {content.headline}
        </h2>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          {content.description}
        </p>
        
        {content.urgency && (
          <Badge className="bg-red-500 text-white text-lg px-4 py-2 animate-pulse">
            🔥 {content.urgency}
          </Badge>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={() => onProgress({ urgency: 'immediate' })}
          size="lg"
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold"
        >
          {content.cta || 'Approfitta Ora'} <Zap className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );

  const getBenefitIcon = (title: string) => {
    if (title.toLowerCase().includes('tempo')) return <Clock className="w-8 h-8 text-white" />;
    if (title.toLowerCase().includes('risultat')) return <TrendingUp className="w-8 h-8 text-white" />;
    if (title.toLowerCase().includes('cost')) return <Target className="w-8 h-8 text-white" />;
    if (title.toLowerCase().includes('qualit') || title.toLowerCase().includes('serviz')) return <Star className="w-8 h-8 text-white" />;
    return <CheckCircle className="w-8 h-8 text-white" />;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Parallax layers */}
        {scene.cinematicElements.parallaxLayers.map((layer, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 flex items-center justify-center text-8xl opacity-20 pointer-events-none"
            style={{
              opacity: layer.opacity,
              scale: layer.scale
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 4 + index,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {layer.element}
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full">
        {renderSceneContent()}
      </div>
    </div>
  );
};
