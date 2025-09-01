import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface CinematicProgressIndicatorProps {
  progress: number;
  ultraSmoothScrollY: number;
  currentScene: number;
  totalScenes: number;
}

export const CinematicProgressIndicator: React.FC<CinematicProgressIndicatorProps> = ({
  progress,
  ultraSmoothScrollY,
  currentScene,
  totalScenes
}) => {
  // Calculate smooth progress percentage
  const progressPercentage = useMemo(() => {
    return Math.min(progress * 100, 100);
  }, [progress]);

  return (
    <>
      {/* Top progress bar - ultra smooth */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted/20 z-50 backdrop-blur-sm">
        <motion.div 
          className="h-full bg-gradient-to-r from-golden to-primary shadow-lg shadow-golden/30"
          style={{
            width: `${progressPercentage}%`,
            transformOrigin: 'left center'
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 40
          }}
        />
      </div>

      {/* Side progress indicator with scene dots */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 hidden lg:flex flex-col space-y-4">
        {Array.from({ length: totalScenes }).map((_, index) => {
          const isActive = index === currentScene;
          const isCompleted = index < currentScene;
          const isNext = index === currentScene + 1;
          
          return (
            <motion.div
              key={index}
              className="relative flex items-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Scene dot */}
              <motion.div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-golden scale-150 shadow-lg shadow-golden/50' 
                    : isCompleted
                    ? 'bg-primary scale-110'
                    : isNext
                    ? 'bg-border scale-100 border-2 border-golden/30'
                    : 'bg-muted scale-90'
                }`}
                whileHover={{ scale: 1.3 }}
                style={{
                  boxShadow: isActive 
                    ? '0 0 20px rgba(var(--golden), 0.6)' 
                    : 'none'
                }}
              />
              
              {/* Scene label */}
              <motion.div
                className={`ml-4 text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'text-golden opacity-100' 
                    : isCompleted
                    ? 'text-primary opacity-80'
                    : 'text-muted-foreground opacity-60'
                }`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ 
                  opacity: isActive ? 1 : 0.6, 
                  x: isActive ? 0 : 10 
                }}
              >
                Scene {index + 1}
              </motion.div>
              
              {/* Connecting line */}
              {index < totalScenes - 1 && (
                <div 
                  className={`absolute top-4 left-1.5 w-0.5 h-8 transition-all duration-500 ${
                    index < currentScene 
                      ? 'bg-primary' 
                      : 'bg-muted'
                  }`}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom scene counter */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 lg:hidden">
        <div className="bg-card/90 backdrop-blur-md border border-border/20 rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center space-x-2 text-sm font-medium text-foreground">
            <span className="text-golden">{currentScene + 1}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{totalScenes}</span>
          </div>
        </div>
      </div>

      {/* Completion celebration */}
      {progress >= 0.95 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="text-6xl animate-pulse">🎉</div>
        </motion.div>
      )}
    </>
  );
};