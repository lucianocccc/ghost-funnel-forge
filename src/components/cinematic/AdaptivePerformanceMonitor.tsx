
// Adaptive Performance Monitor - Monitors and adjusts performance

import React, { useEffect, useState, useRef } from 'react';

interface AdaptivePerformanceMonitorProps {
  onPerformanceChange: (mode: 'high' | 'medium' | 'low') => void;
  currentMode: 'high' | 'medium' | 'low';
}

export const AdaptivePerformanceMonitor: React.FC<AdaptivePerformanceMonitorProps> = ({
  onPerformanceChange,
  currentMode
}) => {
  const [fps, setFps] = useState(60);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  const performanceHistory = useRef<number[]>([]);

  useEffect(() => {
    let animationId: number;
    
    const measurePerformance = () => {
      frameCount.current++;
      const now = Date.now();
      
      if (now - lastTime.current >= 1000) {
        const currentFps = frameCount.current;
        setFps(currentFps);
        
        // Add to performance history
        performanceHistory.current.push(currentFps);
        if (performanceHistory.current.length > 10) {
          performanceHistory.current.shift();
        }
        
        frameCount.current = 0;
        lastTime.current = now;
        
        // Check memory usage if available
        if ((performance as any).memory) {
          const memory = (performance as any).memory;
          const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
          setMemoryUsage(usagePercent);
        }
        
        // Adaptive performance adjustment
        adjustPerformanceMode(currentFps, memoryUsage);
      }
      
      animationId = requestAnimationFrame(measurePerformance);
    };
    
    measurePerformance();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const adjustPerformanceMode = (currentFps: number, memoryUsage: number) => {
    const avgFps = performanceHistory.current.reduce((a, b) => a + b, 0) / performanceHistory.current.length;
    
    // Performance thresholds
    const highPerformanceThreshold = 55;
    const mediumPerformanceThreshold = 30;
    const memoryThreshold = 80;
    
    let newMode: 'high' | 'medium' | 'low' = currentMode;
    
    if (avgFps >= highPerformanceThreshold && memoryUsage < memoryThreshold) {
      newMode = 'high';
    } else if (avgFps >= mediumPerformanceThreshold && memoryUsage < memoryThreshold + 10) {
      newMode = 'medium';
    } else {
      newMode = 'low';
    }
    
    // Only change if different and stable
    if (newMode !== currentMode && performanceHistory.current.length >= 5) {
      console.log(`🎯 Performance mode adjusted: ${currentMode} → ${newMode} (FPS: ${avgFps.toFixed(1)}, Memory: ${memoryUsage.toFixed(1)}%)`);
      onPerformanceChange(newMode);
    }
  };

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono">
      <div className="space-y-1">
        <div>FPS: {fps}</div>
        <div>Mode: {currentMode}</div>
        {memoryUsage > 0 && <div>Memory: {memoryUsage.toFixed(1)}%</div>}
        <div className="w-20 h-1 bg-gray-600 rounded">
          <div 
            className="h-full bg-green-500 rounded transition-all duration-200"
            style={{ width: `${Math.min(fps / 60 * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
