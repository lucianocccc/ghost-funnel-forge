import React from 'react';
import { motion } from 'framer-motion';
import { 
  MicroButton, 
  MicroCard, 
  MagneticElement, 
  ScrollTriggerAnimation, 
  StaggerContainer,
  ParticleField 
} from './index';
import { useMicroInteractions } from '@/hooks/useMicroInteractions';

export const MicroInteractionsDemo: React.FC = () => {
  const magneticProps = useMicroInteractions({
    magnetic: { strength: 0.5, distance: 80 },
    hover: { scale: 1.05, y: -3 }
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Particle Field Background */}
      <ParticleField 
        className="fixed inset-0 z-0"
        particleCount={30}
        colors={['hsl(var(--primary))', 'hsl(var(--golden))', 'hsl(var(--accent))']}
        interactive={true}
        showConnections={true}
      />

      <div className="relative z-10 p-8 space-y-16">
        {/* Header */}
        <ScrollTriggerAnimation animation="fadeIn" delay={0.2}>
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold parallax-text">
              Micro-Interazioni Avanzate
            </h1>
            <p className="text-xl text-muted-foreground">
              Sistema completo di animazioni e effetti interattivi
            </p>
          </div>
        </ScrollTriggerAnimation>

        {/* Button Demos */}
        <ScrollTriggerAnimation animation="slideUp" delay={0.4}>
          <section className="space-y-8">
            <h2 className="text-3xl font-semibold text-center">Bottoni Interattivi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium">Magnetic Effect</h3>
                <MicroButton variant="magnetic">
                  Hover Me
                </MicroButton>
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium">Ripple Effect</h3>
                <MicroButton variant="ripple">
                  Click Me
                </MicroButton>
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium">Glow Effect</h3>
                <MicroButton variant="glow">
                  Glow Me
                </MicroButton>
              </div>
            </div>
          </section>
        </ScrollTriggerAnimation>

        {/* Card Demos */}
        <ScrollTriggerAnimation animation="slideLeft" delay={0.6}>
          <section className="space-y-8">
            <h2 className="text-3xl font-semibold text-center">Card Interattive</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <MicroCard tiltEffect className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Tilt Effect</h3>
                  <p className="text-muted-foreground">Inclina al movimento del mouse</p>
                </div>
              </MicroCard>
              
              <MicroCard glowEffect className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Glow Effect</h3>
                  <p className="text-muted-foreground">Effetto luminoso al hover</p>
                </div>
              </MicroCard>
              
              <MicroCard floatEffect className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Float Effect</h3>
                  <p className="text-muted-foreground">Animazione di galleggiamento</p>
                </div>
              </MicroCard>
            </div>
          </section>
        </ScrollTriggerAnimation>

        {/* Magnetic Elements */}
        <ScrollTriggerAnimation animation="scale" delay={0.8}>
          <section className="space-y-8">
            <h2 className="text-3xl font-semibold text-center">Elementi Magnetici</h2>
            <div className="flex justify-center space-x-8">
              <MagneticElement strength={0.3} maxDistance={100}>
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                  Magnetic
                </div>
              </MagneticElement>
              
              <MagneticElement strength={0.5} maxDistance={120}>
                <div className="w-24 h-24 bg-golden rounded-lg flex items-center justify-center text-background font-bold text-lg">
                  Strong
                </div>
              </MagneticElement>
              
              <motion.div
                {...magneticProps.animationProps}
                {...magneticProps.eventHandlers}
                className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-lg cursor-pointer"
              >
                Custom
              </motion.div>
            </div>
          </section>
        </ScrollTriggerAnimation>

        {/* Stagger Animation Demo */}
        <ScrollTriggerAnimation animation="fadeIn" delay={1.0}>
          <section className="space-y-8">
            <h2 className="text-3xl font-semibold text-center">Animazioni Stagionate</h2>
            <StaggerContainer staggerDelay={0.15} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="h-32 bg-card border border-border rounded-lg flex items-center justify-center text-lg font-semibold micro-hover"
                >
                  Item {i + 1}
                </div>
              ))}
            </StaggerContainer>
          </section>
        </ScrollTriggerAnimation>

        {/* CSS Classes Demo */}
        <ScrollTriggerAnimation animation="slideRight" delay={1.2}>
          <section className="space-y-8">
            <h2 className="text-3xl font-semibold text-center">Classi CSS Utility</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary rounded-lg mx-auto animate-micro-bounce"></div>
                <p className="text-sm">Micro Bounce</p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-golden rounded-lg mx-auto animate-micro-pulse"></div>
                <p className="text-sm">Micro Pulse</p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-accent rounded-lg mx-auto animate-wiggle"></div>
                <p className="text-sm">Wiggle</p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-destructive rounded-lg mx-auto animate-heartbeat"></div>
                <p className="text-sm">Heartbeat</p>
              </div>
            </div>
          </section>
        </ScrollTriggerAnimation>

        {/* Text Effects */}
        <ScrollTriggerAnimation animation="fadeIn" delay={1.4}>
          <section className="space-y-8">
            <h2 className="text-3xl font-semibold text-center">Effetti Testo</h2>
            <div className="text-center space-y-6">
              <p className="text-4xl font-bold parallax-text">
                Testo con Effetto Parallax
              </p>
              <p className="text-2xl font-semibold animate-border-flow bg-clip-text text-transparent">
                Testo con Bordo Animato
              </p>
              <div className="inline-block p-4 rounded-lg ripple cursor-pointer">
                <span className="text-xl font-medium">Elemento con Ripple</span>
              </div>
            </div>
          </section>
        </ScrollTriggerAnimation>

        {/* Footer */}
        <ScrollTriggerAnimation animation="fadeIn" delay={1.6}>
          <footer className="text-center py-12">
            <p className="text-muted-foreground">
              Sistema di micro-interazioni implementato con Framer Motion e CSS Custom Properties
            </p>
          </footer>
        </ScrollTriggerAnimation>
      </div>
    </div>
  );
};