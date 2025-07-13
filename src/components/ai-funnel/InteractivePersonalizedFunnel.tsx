
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  ArrowRight, 
  Star, 
  Users, 
  Shield, 
  Zap,
  Heart,
  CheckCircle,
  Sparkles,
  Target,
  Clock
} from 'lucide-react';

interface PersonalizedFunnelProps {
  funnel: any;
  onLeadCapture?: (data: any) => void;
}

export const InteractivePersonalizedFunnel: React.FC<PersonalizedFunnelProps> = ({
  funnel,
  onLeadCapture
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const steps = ['hero', 'benefits', 'proof', 'demo', 'form'];

  const productName = funnel.product_name || 'Il Prodotto';
  const targetAudience = funnel.target_audience || 'i clienti';
  const theme = funnel.advanced_funnel_data?.visualTheme || {};

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      setScrollProgress(Math.max(0, Math.min(100, scrollPercent)));

      // Intersection observer for animations
      sectionRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const inView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
          if (inView && !isVisible[steps[index]]) {
            setIsVisible(prev => ({ ...prev, [steps[index]]: true }));
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const leadData = {
        ...formData,
        funnelId: funnel.id,
        funnelName: funnel.name,
        productName,
        targetAudience,
        timestamp: new Date().toISOString(),
        source: 'interactive_personalized_funnel'
      };

      onLeadCapture?.(leadData);

      toast({
        title: "🎉 Richiesta Inviata!",
        description: `Ti contatteremo presto per parlare di ${productName}`,
      });

      setFormData({});
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'invio. Riprova.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const HeroSection = () => {
    const heroData = funnel.advanced_funnel_data?.heroSection || {};
    
    return (
      <div 
        ref={el => sectionRefs.current[0] = el}
        className={`min-h-screen relative overflow-hidden flex items-center justify-center ${
          isVisible.hero ? 'animate-fade-in' : 'opacity-0'
        }`}
        style={{
          background: heroData.backgroundGradient || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)'
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <div className="mb-6">
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Personalizzato per {targetAudience}
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {heroData.headline || `Scopri ${productName}`}
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            {heroData.subheadline || `La soluzione perfetta per ${targetAudience}`}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              size="lg"
              onClick={() => setCurrentStep(4)}
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              {heroData.ctaText || `Richiedi ${productName}`}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentStep(1)}
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-full"
            >
              Scopri i Benefici
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {heroData.urgencyText && (
            <div className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-full inline-block font-semibold animate-pulse">
              🔥 {heroData.urgencyText}
            </div>
          )}
        </div>
      </div>
    );
  };

  const BenefitsSection = () => {
    const benefits = funnel.advanced_funnel_data?.productBenefits || [];
    
    return (
      <div 
        ref={el => sectionRefs.current[1] = el}
        className={`py-20 px-6 ${isVisible.benefits ? 'animate-fade-in' : 'opacity-0'}`}
        style={{ backgroundColor: theme.backgroundColor || '#0f0f23' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Perché {productName} è Perfetto per Te
            </h2>
            <p className="text-xl text-white/80">
              Benefici concreti pensati per {targetAudience}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit: any, index: number) => (
              <Card 
                key={index}
                className={`relative overflow-hidden border-0 transform hover:scale-105 transition-all duration-500 ${
                  isVisible.benefits ? 'animate-slide-in-up' : 'opacity-0'
                }`}
                style={{ 
                  background: theme.cardBackground || 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <CardContent className="p-8 text-center">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{ backgroundColor: benefit.color || theme.primaryColor || '#6366f1' }}
                  >
                    {benefit.icon === 'zap' && <Zap className="w-8 h-8 text-white" />}
                    {benefit.icon === 'heart' && <Heart className="w-8 h-8 text-white" />}
                    {benefit.icon === 'shield' && <Shield className="w-8 h-8 text-white" />}
                    {benefit.icon === 'star' && <Star className="w-8 h-8 text-white" />}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-white/80 mb-6 leading-relaxed">
                    {benefit.description}
                  </p>

                  {benefit.statistic && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white mb-1">
                        {benefit.statistic}
                      </div>
                      <div className="text-sm text-white/70">
                        Risultato medio
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const SocialProofSection = () => {
    const socialProof = funnel.advanced_funnel_data?.socialProof || {};
    const testimonials = socialProof.testimonials || [];
    const statistics = socialProof.statistics || [];
    
    return (
      <div 
        ref={el => sectionRefs.current[2] = el}
        className={`py-20 px-6 bg-gradient-to-br from-white/5 to-white/10 ${
          isVisible.proof ? 'animate-fade-in' : 'opacity-0'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {targetAudience} Soddisfatti Parlano di {productName}
            </h2>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-16">
            {statistics.map((stat: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial: any, index: number) => (
              <Card 
                key={index}
                className="border-0 bg-white/10 backdrop-blur-md transform hover:scale-105 transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <img 
                      src={testimonial.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-white/70">{testimonial.role}</div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-white/90 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  
                  {testimonial.verified && (
                    <div className="flex items-center mt-4 text-green-400">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm">Recensione Verificata</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const InteractiveDemoSection = () => {
    const demoData = funnel.advanced_funnel_data?.interactiveDemo || {};
    
    return (
      <div 
        ref={el => sectionRefs.current[3] = el}
        className={`py-20 px-6 ${isVisible.demo ? 'animate-fade-in' : 'opacity-0'}`}
        style={{ backgroundColor: theme.backgroundColor || '#0f0f23' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {demoData.title || `Prova ${productName} in Azione`}
          </h2>
          
          <p className="text-xl text-white/80 mb-12">
            {demoData.description || `Scopri come ${productName} risolve i tuoi problemi`}
          </p>

          <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 backdrop-blur-md">
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-8 flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-white mb-4 mx-auto" />
                <p className="text-white/80">Demo Interattiva di {productName}</p>
              </div>
            </div>

            {demoData.features && (
              <div className="grid md:grid-cols-3 gap-4">
                {demoData.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center text-white/90">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    {feature}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            size="lg"
            onClick={() => setCurrentStep(4)}
            className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-300"
          >
            <Target className="w-5 h-5 mr-2" />
            Inizia Ora con {productName}
          </Button>
        </div>
      </div>
    );
  };

  const ConversionFormSection = () => {
    const formConfig = funnel.advanced_funnel_data?.conversionForm || {};
    const currentFormStep = Math.floor(Object.keys(formData).length / 3);
    const totalSteps = formConfig.steps?.length || 2;
    
    return (
      <div 
        ref={el => sectionRefs.current[4] = el}
        className={`py-20 px-6 ${isVisible.form ? 'animate-fade-in' : 'opacity-0'}`}
        style={{ 
          background: formConfig.styling?.background || 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))'
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {formConfig.title || `Richiedi ${productName}`}
            </h2>
            <p className="text-xl text-white/80">
              {formConfig.description || `Compila il form per ricevere informazioni su ${productName}`}
            </p>
          </div>

          <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-8">
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-white/70 mb-2">
                  <span>Progresso</span>
                  <span>{Math.round((currentFormStep / totalSteps) * 100)}%</span>
                </div>
                <Progress 
                  value={(currentFormStep / totalSteps) * 100} 
                  className="h-2"
                />
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Dynamic form fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Nome e Cognome *
                    </label>
                    <Input
                      required
                      placeholder="Il tuo nome completo"
                      value={formData.nome || ''}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="La tua email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Telefono *
                    </label>
                    <Input
                      type="tel"
                      required
                      placeholder="+39 XXX XXX XXXX"
                      value={formData.telefono || ''}
                      onChange={(e) => handleInputChange('telefono', e.target.value)}
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Azienda
                    </label>
                    <Input
                      placeholder="La tua azienda"
                      value={formData.azienda || ''}
                      onChange={(e) => handleInputChange('azienda', e.target.value)}
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Le tue esigenze *
                  </label>
                  <Textarea
                    required
                    placeholder={`Come ${productName} può aiutarti? Quali problemi vuoi risolvere?`}
                    value={formData.esigenze || ''}
                    onChange={(e) => handleInputChange('esigenze', e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60 min-h-[120px]"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Budget di riferimento
                    </label>
                    <select
                      value={formData.budget || ''}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="w-full bg-white/10 border border-white/30 text-white rounded-md px-3 py-2"
                    >
                      <option value="">Seleziona budget</option>
                      <option value="under-1k">Sotto €1.000</option>
                      <option value="1k-5k">€1.000 - €5.000</option>
                      <option value="5k-15k">€5.000 - €15.000</option>
                      <option value="over-15k">Oltre €15.000</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Tempistiche
                    </label>
                    <select
                      value={formData.tempistiche || ''}
                      onChange={(e) => handleInputChange('tempistiche', e.target.value)}
                      className="w-full bg-white/10 border border-white/30 text-white rounded-md px-3 py-2"
                    >
                      <option value="">Seleziona tempistiche</option>
                      <option value="immediate">Subito</option>
                      <option value="1-month">Entro 1 mese</option>
                      <option value="3-months">Entro 3 mesi</option>
                      <option value="6-months">Oltre 3 mesi</option>
                    </select>
                  </div>
                </div>

                {/* Incentives */}
                {formConfig.incentive && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <div className="text-green-400 font-medium whitespace-pre-line">
                      {formConfig.incentive}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-300"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      {formConfig.submitText || `Richiedi Consulenza per ${productName}`}
                    </>
                  )}
                </Button>

                {/* Social proof inline */}
                {formConfig.socialProofInline && (
                  <div className="text-center text-white/70 text-sm">
                    <Users className="w-4 h-4 inline mr-2" />
                    {formConfig.socialProofInline}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={scrollProgress} className="h-1 bg-transparent" />
      </div>

      {/* Floating CTA */}
      {scrollProgress > 20 && scrollProgress < 80 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setCurrentStep(4)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full px-6 py-3 shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Target className="w-5 h-5 mr-2" />
            Richiedi {productName}
          </Button>
        </div>
      )}

      {/* Sections */}
      <HeroSection />
      <BenefitsSection />
      <SocialProofSection />  
      <InteractiveDemoSection />
      <ConversionFormSection />

      {/* Development info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs">
          <div>Prodotto: {productName}</div>
          <div>Target: {targetAudience}</div>
          <div>Scroll: {scrollProgress}%</div>
        </div>
      )}
    </div>
  );
};
