import React, { useRef, useEffect, useCallback } from 'react';

interface PhysicsState {
  position: number;
  velocity: number;
  acceleration: number;
  damping: number;
  elasticity: number;
  mass: number;
}

interface MicroPhysicsEngineProps {
  children: React.ReactNode;
  targetPosition: number;
  velocity: number;
  enabled?: boolean;
  onPositionChange?: (position: number) => void;
  className?: string;
}

export const MicroPhysicsEngine: React.FC<MicroPhysicsEngineProps> = ({
  children,
  targetPosition,
  velocity,
  enabled = true,
  onPositionChange,
  className = ''
}) => {
  const physicsState = useRef<PhysicsState>({
    position: 0,
    velocity: 0,
    acceleration: 0,
    damping: 0.85, // Ice-like friction
    elasticity: 0.02,
    mass: 1
  });
  
  const animationRef = useRef<number>();
  const lastTime = useRef<number>(0);
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Physics simulation with spring dynamics
  const simulatePhysics = useCallback((deltaTime: number) => {
    const state = physicsState.current;
    
    // Spring force calculation
    const displacement = targetPosition - state.position;
    const springForce = displacement * state.elasticity;
    
    // Damping force
    const dampingForce = -state.velocity * state.damping;
    
    // Total force
    const totalForce = springForce + dampingForce;
    
    // Update acceleration (F = ma)
    state.acceleration = totalForce / state.mass;
    
    // Velocity integration with momentum preservation
    state.velocity += state.acceleration * deltaTime;
    state.velocity += velocity * 0.1; // Input velocity influence
    
    // Position integration
    state.position += state.velocity * deltaTime;
    
    // Micro-damping for ultra-stability
    if (Math.abs(state.velocity) < 0.001 && Math.abs(displacement) < 0.001) {
      state.velocity *= 0.9;
      state.position += displacement * 0.1;
    }
    
    return state.position;
  }, [targetPosition, velocity]);
  
  // Animation loop
  const animate = useCallback((currentTime: number) => {
    if (!enabled) return;
    
    const deltaTime = lastTime.current ? (currentTime - lastTime.current) / 1000 : 0;
    lastTime.current = currentTime;
    
    if (deltaTime > 0) {
      const newPosition = simulatePhysics(deltaTime);
      
      // Apply transform with hardware acceleration
      if (elementRef.current) {
        const transform = `translate3d(0, ${newPosition}px, 0)`;
        elementRef.current.style.transform = transform;
      }
      
      // Notify parent of position change
      onPositionChange?.(newPosition);
    }
    
    // Continue animation if there's movement
    const state = physicsState.current;
    if (Math.abs(state.velocity) > 0.001 || Math.abs(targetPosition - state.position) > 0.001) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [enabled, simulatePhysics, onPositionChange]);
  
  // Start/stop animation based on changes
  useEffect(() => {
    if (enabled) {
      if (!animationRef.current) {
        lastTime.current = 0;
        animationRef.current = requestAnimationFrame(animate);
      }
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, animate, targetPosition]);
  
  // Reset physics when target changes significantly
  useEffect(() => {
    const displacement = Math.abs(targetPosition - physicsState.current.position);
    if (displacement > 100) {
      physicsState.current.position = targetPosition;
      physicsState.current.velocity = 0;
    }
  }, [targetPosition]);
  
  return (
    <div
      ref={elementRef}
      className={`${className}`}
      style={{
        willChange: enabled ? 'transform' : 'auto',
        backfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d'
      }}
    >
      {children}
    </div>
  );
};