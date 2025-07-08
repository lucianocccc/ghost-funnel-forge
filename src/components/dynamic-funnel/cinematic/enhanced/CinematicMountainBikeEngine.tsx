import React, { useEffect, useRef, useState } from 'react';

interface BikeParticle {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  size: number;
  type: 'dirt' | 'dust' | 'mud' | 'leaves' | 'rocks';
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
}

interface CinematicMountainBikeEngineProps {
  scrollVelocity: number;
  isActive: boolean;
  sceneType: 'hero' | 'benefit' | 'proof' | 'demo' | 'conversion';
}

export const CinematicMountainBikeEngine: React.FC<CinematicMountainBikeEngineProps> = ({
  scrollVelocity,
  isActive,
  sceneType
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<BikeParticle[]>([]);
  const animationFrameRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const createBikeParticle = (type: BikeParticle['type']): BikeParticle => {
    const configs = {
      dirt: {
        size: Math.random() * 6 + 2,
        color: '#8B4513',
        velocityX: (Math.random() - 0.5) * 8,
        velocityY: Math.random() * -4 - 2,
        maxLife: 180,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      },
      dust: {
        size: Math.random() * 15 + 8,
        color: '#D2B48C',
        velocityX: (Math.random() - 0.5) * 6,
        velocityY: Math.random() * -2 - 1,
        maxLife: 220,
        rotationSpeed: (Math.random() - 0.5) * 0.1
      },
      mud: {
        size: Math.random() * 4 + 3,
        color: '#654321',
        velocityX: (Math.random() - 0.5) * 5,
        velocityY: Math.random() * -3 - 1.5,
        maxLife: 160,
        rotationSpeed: (Math.random() - 0.5) * 0.3
      },
      leaves: {
        size: Math.random() * 8 + 4,
        color: '#228B22',
        velocityX: (Math.random() - 0.5) * 3,
        velocityY: Math.random() * -1.5 - 0.5,
        maxLife: 300,
        rotationSpeed: (Math.random() - 0.5) * 0.15
      },
      rocks: {
        size: Math.random() * 3 + 2,
        color: '#696969',
        velocityX: (Math.random() - 0.5) * 7,
        velocityY: Math.random() * -5 - 2,
        maxLife: 140,
        rotationSpeed: (Math.random() - 0.5) * 0.4
      }
    };

    const config = configs[type];
    return {
      id: Math.random().toString(36),
      x: Math.random() * dimensions.width,
      y: dimensions.height + 20,
      type,
      rotation: Math.random() * Math.PI * 2,
      opacity: 1,
      life: config.maxLife,
      ...config
    };
  };

  const generateMountainBikeEffects = () => {
    if (!isActive || !dimensions.width) return;

    const intensity = Math.abs(scrollVelocity) * 2 + 3;
    
    for (let i = 0; i < intensity; i++) {
      let particleType: BikeParticle['type'] = 'dust';
      
      const rand = Math.random();
      if (sceneType === 'hero') {
        if (rand < 0.35) particleType = 'dirt';
        else if (rand < 0.6) particleType = 'dust';
        else if (rand < 0.8) particleType = 'mud';
        else if (rand < 0.95) particleType = 'leaves';
        else particleType = 'rocks';
      } else if (sceneType === 'demo') {
        if (rand < 0.5) particleType = 'dirt';
        else if (rand < 0.8) particleType = 'dust';
        else particleType = 'rocks';
      }

      const particle = createBikeParticle(particleType);
      
      // Adjust based on scroll velocity
      particle.velocityX *= (1 + Math.abs(scrollVelocity) * 0.2);
      particle.velocityY *= (1 + Math.abs(scrollVelocity) * 0.15);
      
      particlesRef.current.push(particle);
    }

    // Performance limit
    if (particlesRef.current.length > 150) {
      particlesRef.current = particlesRef.current.slice(-150);
    }
  };

  const updateParticlePhysics = () => {
    const gravity = 0.15;
    const airResistance = 0.98;
    const wind = scrollVelocity * 0.03;

    particlesRef.current = particlesRef.current.filter(particle => {
      // Apply mountain bike physics
      particle.velocityY += gravity;
      particle.velocityX += wind;
      particle.velocityX *= airResistance;
      particle.velocityY *= airResistance;
      
      // Update position and rotation
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.rotation += particle.rotationSpeed;

      // Update life and opacity
      particle.life--;
      particle.opacity = Math.max(0, particle.life / particle.maxLife);

      return particle.life > 0 && 
             particle.x > -100 && particle.x < dimensions.width + 100 && 
             particle.y > -100 && particle.y < dimensions.height + 100;
    });
  };

  const renderMountainBikeParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      
      switch (particle.type) {
        case 'dirt':
          ctx.fillStyle = particle.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = particle.color;
          ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
          break;
          
        case 'dust':
          ctx.fillStyle = particle.color;
          ctx.shadowBlur = 15;
          ctx.shadowColor = particle.color;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'mud':
          ctx.fillStyle = particle.color;
          ctx.shadowBlur = 5;
          ctx.shadowColor = particle.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, particle.size, particle.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'leaves':
          ctx.fillStyle = particle.color;
          ctx.shadowBlur = 3;
          ctx.shadowColor = particle.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, particle.size, particle.size * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'rocks':
          ctx.fillStyle = particle.color;
          ctx.shadowBlur = 2;
          ctx.shadowColor = particle.color;
          const sides = 6;
          ctx.beginPath();
          for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * particle.size;
            const y = Math.sin(angle) * particle.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          break;
      }
      
      ctx.restore();
    });
  };

  const animate = () => {
    if (isActive) {
      generateMountainBikeEffects();
      updateParticlePhysics();
      renderMountainBikeParticles();
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isActive && dimensions.width > 0) {
      animate();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, dimensions]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="absolute inset-0 pointer-events-none z-20"
      style={{
        mixBlendMode: 'multiply'
      }}
    />
  );
};