import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SimpleParallax } from './SimpleParallax';
import { ArrowRight, Check, Star, Shield, Zap, Users } from 'lucide-react';

interface ProductContext {
  name: string;
  description: string;
  targetAudience: string;
  industry: string;
  visualStyle: 'minimal' | 'dynamic' | 'elegant' | 'technical';
}

interface StaticCinematicFunnelProps {
  productContext: ProductContext;
  onLeadCapture?: (data: any) => void;
}

export const StaticCinematicFunnel: React.FC<StaticCinematicFunnelProps> = ({
  productContext,
  onLeadCapture
}) => {
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Color scheme using semantic tokens from design system
  const getColorScheme = () => {
    const schemes = {
      'Technology': {
        primary: 'from-blue-600 to-primary',
        secondary: 'from-accent to-secondary',
        accent: 'bg-primary',
        text: 'text-primary-foreground',
        glass: 'bg-muted/10',
        surface: 'bg-card',
        border: 'border-border'
      },
      'Health & Wellness': {
        primary: 'from-green-600 to-emerald-600',
        secondary: 'from-secondary to-accent',
        accent: 'bg-golden',
        text: 'text-golden',
        glass: 'bg-muted/10',
        surface: 'bg-card',
        border: 'border-golden/20'
      },
      'Food & Beverage': {
        primary: 'from-golden to-yellow-500',
        secondary: 'from-accent to-golden',
        accent: 'bg-golden',
        text: 'text-golden',
        glass: 'bg-muted/10',
        surface: 'bg-card',
        border: 'border-golden/20'
      },
      'Professional Services': {
        primary: 'from-primary to-muted-foreground',
        secondary: 'from-secondary to-accent',
        accent: 'bg-primary',
        text: 'text-primary-foreground',
        glass: 'bg-muted/10',
        surface: 'bg-card',
        border: 'border-border'
      },
      default: {
        primary: 'from-primary to-golden',
        secondary: 'from-secondary to-accent',
        accent: 'bg-golden',
        text: 'text-golden',
        glass: 'bg-muted/10',
        surface: 'bg-card',
        border: 'border-golden/20'
      }
    };
    return schemes[productContext.industry as keyof typeof schemes] || schemes.default;
  };

  const colorScheme = getColorScheme();

  // Typography based on visual style using design system
  const getTypography = () => {
    const fonts = {
      minimal: 'font-light tracking-wide text-foreground',
      dynamic: 'font-bold tracking-tight text-foreground',
      elegant: 'font-medium tracking-wider text-foreground',
      technical: 'font-mono tracking-normal text-foreground'
    };
    return fonts[productContext.visualStyle] || fonts.dynamic;
  };

  const typography = getTypography();

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollTop / docHeight;
        setScrollProgress(Math.min(progress, 1));

        // Update current section based on scroll
        const sections = 5; // hero, benefits, proof, demo, conversion
        const sectionIndex = Math.floor(progress * sections);
        setCurrentSection(Math.min(sectionIndex, sections - 1));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    try {
      const leadData = {
        ...formData,
        product: productContext,
        funnelType: 'static_cinematic',
        scrollProgress,
        currentSection,
        timestamp: Date.now()
      };

      onLeadCapture?.(leadData);
      
      toast({
        title: "🎉 Perfetto!",
        description: "Grazie per il tuo interesse! Ti contatteremo presto.",
      });

      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'invio del form",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted/20 z-50">
        <div 
          className={`h-full bg-gradient-to-r ${colorScheme.primary} transition-all duration-300`}
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Hero Section */}
      <section className={`relative min-h-screen flex items-center justify-center bg-gradient-to-br ${colorScheme.primary} overflow-hidden`}>
        {/* Parallax background effects */}
        <SimpleParallax colorScheme={colorScheme} sceneType="hero" />

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className={`text-5xl md:text-7xl ${typography} text-primary-foreground mb-6 animate-fade-in`}>
            Scopri {productContext.name}
          </h1>
          <p className={`text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto animate-fade-in`} style={{ animationDelay: '0.5s' }}>
            {productContext.description}
          </p>
          <Button 
            size="lg" 
            className={`${colorScheme.accent} hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold animate-fade-in text-black hover:bg-golden/90`}
            style={{ animationDelay: '1s' }}
            onClick={() => {
              const nextSection = document.getElementById('benefits');
              nextSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Scopri di più <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative min-h-screen bg-background flex items-center py-20">
        <SimpleParallax colorScheme={colorScheme} sceneType="benefits" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl ${typography} text-foreground mb-6`}>
              Perché scegliere {productContext.name}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Vantaggi che fanno la differenza nel settore {productContext.industry}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Prestazioni Superior', desc: 'Risultati oltre ogni aspettativa' },
              { icon: Shield, title: 'Affidabilità Garantita', desc: 'Sicurezza e qualità certificate' },
              { icon: Users, title: 'Supporto Dedicato', desc: 'Team di esperti sempre disponibile' }
            ].map((benefit, index) => (
              <div 
                key={index}
                className={`${colorScheme.surface} ${colorScheme.border} border rounded-xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <benefit.icon className={`w-12 h-12 ${colorScheme.text} mx-auto mb-4`} />
                <h3 className={`text-xl ${typography} text-foreground mb-3`}>{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className={`relative min-h-screen bg-gradient-to-br ${colorScheme.secondary} flex items-center py-20`}>
        <SimpleParallax colorScheme={colorScheme} sceneType="proof" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className={`text-4xl md:text-5xl ${typography} text-primary-foreground mb-12`}>
            Risultati Comprovati
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { number: '10,000+', label: 'Clienti Soddisfatti' },
              { number: '99.9%', label: 'Uptime Garantito' },
              { number: '24/7', label: 'Supporto Attivo' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-5xl ${typography} text-primary-foreground mb-2`}>{stat.number}</div>
                <div className={`text-lg text-primary-foreground/80`}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div className={`${colorScheme.surface} ${colorScheme.border} border rounded-xl p-8 max-w-2xl mx-auto shadow-xl`}>
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-golden fill-current" />
              ))}
            </div>
            <blockquote className={`text-lg text-muted-foreground italic mb-4`}>
              "{productContext.name} ha trasformato completamente il nostro business. 
              Risultati incredibili in tempi record!"
            </blockquote>
            <cite className="text-foreground font-semibold">- Cliente Verificato</cite>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="relative min-h-screen bg-muted/5 flex items-center py-20">
        <SimpleParallax colorScheme={colorScheme} sceneType="demo" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-4xl md:text-5xl ${typography} text-foreground mb-6`}>
                {productContext.name} in Azione
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Scopri come {productContext.name} rivoluziona l'approccio tradizionale 
                nel settore {productContext.industry}.
              </p>
              <div className="space-y-4">
                {[
                  'Implementazione rapida e semplice',
                  'Interfaccia intuitiva e user-friendly',
                  'Risultati misurabili in tempo reale',
                  'Integrazione perfetta con sistemi esistenti'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className={`w-5 h-5 ${colorScheme.text} mr-3`} />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${colorScheme.surface} ${colorScheme.border} border rounded-xl p-8 relative overflow-hidden shadow-xl`}>
              <div className="absolute inset-0 bg-gradient-to-br from-muted/5 to-transparent" />
              <div className="relative">
                <div className={`w-full h-64 bg-gradient-to-br ${colorScheme.primary} rounded-lg mb-6 flex items-center justify-center`}>
                  <div className="text-primary-foreground text-center">
                    <div className="text-4xl mb-2">🚀</div>
                    <div className={`text-lg ${typography}`}>{productContext.name}</div>
                    <div className="text-sm opacity-75">Demo Interattiva</div>
                  </div>
                </div>
                <p className="text-muted-foreground text-center">
                  Esperienza completa del prodotto in azione
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion Section */}
      <section className={`relative min-h-screen bg-gradient-to-br ${colorScheme.primary} flex items-center py-20`}>
        <SimpleParallax colorScheme={colorScheme} sceneType="conversion" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className={`text-4xl md:text-5xl ${typography} text-primary-foreground mb-6`}>
              Inizia Ora la Tua Trasformazione
            </h2>
            <p className={`text-xl text-primary-foreground/90 mb-12`}>
              Non aspettare oltre. Scopri come {productContext.name} può 
              rivoluzionare il tuo approccio nel settore {productContext.industry}.
            </p>

            <form onSubmit={handleSubmit} className={`${colorScheme.surface} ${colorScheme.border} border rounded-xl p-8 space-y-6 shadow-xl backdrop-blur-sm`}>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder="Il tuo nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
                <Input
                  type="email"
                  placeholder="La tua email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
              
              <Textarea
                placeholder={`Racconta la tua sfida nel settore ${productContext.industry}...`}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-background/80 border-border text-foreground placeholder:text-muted-foreground min-h-[120px]"
              />

              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="w-full bg-golden hover:bg-golden/90 text-black font-semibold py-4 transition-all duration-300 hover:scale-105"
              >
                {isSubmitting ? 'Invio in corso...' : 'Richiedi Demo Gratuita'} 
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <p className="text-muted-foreground text-sm text-center">
                Riceverai una demo personalizzata entro 24 ore
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};