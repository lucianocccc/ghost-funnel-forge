import React, { useEffect, useRef, useState } from 'react';

interface PhysicsObject {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  mass: number;
  size: number;
  type: 'particle' | 'debris' | 'dust' | 'sparks';
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
}

interface CinematicPhysicsEngineProps {
  sceneType: 'hero' | 'benefit' | 'proof' | 'demo' | 'conversion';
  scrollVelocity: number;
  isActive: boolean;
  productType?: string;
}

export const CinematicPhysicsEngine: React.FC<CinematicPhysicsEngineProps> = ({
  sceneType,
  scrollVelocity,
  isActive,
  productType = 'mountain-bike'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const objectsRef = useRef<PhysicsObject[]>([]);
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

  const createParticle = (type: PhysicsObject['type'], x: number, y: number): PhysicsObject => {
    const configs = {
      particle: {
        size: Math.random() * 3 + 1,
        color: '#ffffff',
        velocityX: (Math.random() - 0.5) * 2,
        velocityY: Math.random() * -2 - 1,
        mass: Math.random() * 0.5 + 0.1,
        maxLife: 120
      },
      debris: {
        size: Math.random() * 8 + 3,
        color: '#8B4513',
        velocityX: (Math.random() - 0.5) * 4,
        velocityY: Math.random() * -3 - 2,
        mass: Math.random() * 1.5 + 0.5,
        maxLife: 180
      },
      dust: {
        size: Math.random() * 12 + 5,
        color: '#D2B48C',
        velocityX: (Math.random() - 0.5) * 3,
        velocityY: Math.random() * -1.5 - 0.5,
        mass: Math.random() * 0.3 + 0.1,
        maxLife: 200
      },
      sparks: {
        size: Math.random() * 2 + 1,
        color: '#FFD700',
        velocityX: (Math.random() - 0.5) * 6,
        velocityY: Math.random() * -4 - 2,
        mass: Math.random() * 0.2 + 0.05,
        maxLife: 60
      }
    };

    const config = configs[type];
    return {
      id: Math.random().toString(36),
      x,
      y,
      type,
      ...config,
      opacity: 1,
      life: config.maxLife
    };
  };

  const generateSceneParticles = () => {
    if (!isActive || !dimensions.width) return;

    const particleCount = Math.abs(scrollVelocity) * 3 + 5;
    
    for (let i = 0; i < particleCount; i++) {
      let particleType: PhysicsObject['type'] = 'particle';
      
      // Different particle types based on scene and product
      if (sceneType === 'hero' && productType === 'mountain-bike') {
        const rand = Math.random();
        if (rand < 0.4) particleType = 'dust';
        else if (rand < 0.7) particleType = 'debris';
        else if (rand < 0.9) particleType = 'particle';
        else particleType = 'sparks';
      }

      const particle = createParticle(
        particleType,
        Math.random() * dimensions.width,
        dimensions.height + 20
      );

      // Adjust velocity based on scroll speed
      particle.velocityX *= (1 + Math.abs(scrollVelocity) * 0.1);
      particle.velocityY *= (1 + Math.abs(scrollVelocity) * 0.1);

      objectsRef.current.push(particle);
    }

    // Limit total particles for performance
    if (objectsRef.current.length > 200) {
      objectsRef.current = objectsRef.current.slice(-200);
    }
  };

  const updatePhysics = () => {
    const gravity = 0.1;
    const airResistance = 0.98;
    const wind = scrollVelocity * 0.02;

    objectsRef.current = objectsRef.current.filter(obj => {
      // Apply physics
      obj.velocityY += gravity;
      obj.velocityX += wind;
      obj.velocityX *= airResistance;
      obj.velocityY *= airResistance;

      // Update position
      obj.x += obj.velocityX;
      obj.y += obj.velocityY;

      // Update life
      obj.life--;
      obj.opacity = obj.life / obj.maxLife;

      // Remove dead or off-screen particles
      return obj.life > 0 && 
             obj.x > -50 && obj.x < dimensions.width + 50 && 
             obj.y > -50 && obj.y < dimensions.height + 50;
    });
  };

  const renderParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    objectsRef.current.forEach(obj => {
      ctx.save();
      ctx.globalAlpha = obj.opacity;
      
      // Different rendering for different particle types
      switch (obj.type) {
        case 'dust':
          ctx.fillStyle = obj.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = obj.color;
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'debris':
          ctx.fillStyle = obj.color;
          ctx.fillRect(obj.x - obj.size/2, obj.y - obj.size/2, obj.size, obj.size);
          break;
          
        case 'sparks':
          ctx.strokeStyle = obj.color;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 5;
          ctx.shadowColor = obj.color;
          ctx.beginPath();
          ctx.moveTo(obj.x, obj.y);
          ctx.lineTo(obj.x - obj.velocityX * 3, obj.y - obj.velocityY * 3);
          ctx.stroke();
          break;
          
        default: // particle
          ctx.fillStyle = obj.color;
          ctx.shadowBlur = 3;
          ctx.shadowColor = obj.color;
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.size, 0, Math.PI * 2);
          ctx.fill();
      }
      
      ctx.restore();
    });
  };

  const animate = () => {
    if (isActive) {
      generateSceneParticles();
      updatePhysics();
      renderParticles();
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
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        mixBlendMode: 'screen'
      }}
    />
  );
};