import React from 'react';

interface SimpleParallaxProps {
  colorScheme: {
    primary: string;
    secondary: string;
    glass: string;
  };
  sceneType: 'hero' | 'benefits' | 'proof' | 'demo' | 'conversion';
}

export const SimpleParallax: React.FC<SimpleParallaxProps> = ({
  colorScheme,
  sceneType
}) => {
  const getParticleElements = () => {
    const elements = [];
    
    // Floating particles based on scene type
    for (let i = 0; i < 8; i++) {
      elements.push(
        <div
          key={i}
          className={`absolute w-2 h-2 ${colorScheme.glass} rounded-full opacity-30 animate-pulse`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      );
    }
    
    return elements;
  };

  const getSceneSpecificElements = () => {
    switch (sceneType) {
      case 'hero':
        return (
          <>
            <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${colorScheme.glass} rounded-full blur-3xl animate-pulse`} />
            <div className={`absolute bottom-1/4 right-1/4 w-64 h-64 ${colorScheme.glass} rounded-full blur-2xl animate-pulse`} style={{ animationDelay: '1s' }} />
          </>
        );
      case 'benefits':
        return (
          <div className={`absolute top-1/3 right-1/3 w-32 h-32 ${colorScheme.glass} rounded-full blur-xl animate-bounce`} style={{ animationDuration: '3s' }} />
        );
      case 'proof':
        return (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`w-96 h-96 border ${colorScheme.glass.replace('bg-', 'border-')} rounded-full animate-spin opacity-20`} style={{ animationDuration: '20s' }} />
            <div className={`absolute inset-8 border ${colorScheme.glass.replace('bg-', 'border-')} rounded-full animate-spin opacity-10`} style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
          </div>
        );
      case 'demo':
        return (
          <div className="absolute inset-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`absolute w-px h-16 ${colorScheme.glass} opacity-20`}
                style={{
                  left: `${(i + 1) * 16}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animation: `pulse ${2 + Math.random()}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        );
      case 'conversion':
        return (
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 ${colorScheme.glass.replace('bg-', 'border-')} rounded-full animate-ping opacity-20`} style={{ animationDuration: '3s' }} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating particles */}
      {getParticleElements()}
      
      {/* Scene-specific decorative elements */}
      {getSceneSpecificElements()}
    </div>
  );
};