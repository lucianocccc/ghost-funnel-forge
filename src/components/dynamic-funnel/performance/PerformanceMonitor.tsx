
import React, { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  scrollEvents: number;
  rafCalls: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  onMetricsUpdate
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    renderTime: 0,
    memoryUsage: 0,
    scrollEvents: 0,
    rafCalls: 0
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const scrollEventCount = useRef(0);
  const rafCallCount = useRef(0);
  const rafId = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    const trackScrollEvents = () => {
      scrollEventCount.current++;
    };

    const trackRafCalls = () => {
      rafCallCount.current++;
    };

    const originalRaf = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      trackRafCalls();
      return originalRaf(callback);
    };

    const measurePerformance = () => {
      const now = performance.now();
      const delta = now - lastTime.current;
      
      if (delta >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / delta);
        const renderTime = delta / frameCount.current;
        const memoryUsage = (performance as any).memory 
          ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
          : 0;

        const newMetrics: PerformanceMetrics = {
          fps,
          renderTime,
          memoryUsage,
          scrollEvents: scrollEventCount.current,
          rafCalls: rafCallCount.current
        };

        setMetrics(newMetrics);
        onMetricsUpdate?.(newMetrics);

        // Reset counters
        frameCount.current = 0;
        scrollEventCount.current = 0;
        rafCallCount.current = 0;
        lastTime.current = now;
      }

      frameCount.current++;
      rafId.current = requestAnimationFrame(measurePerformance);
    };

    window.addEventListener('scroll', trackScrollEvents, { passive: true });
    measurePerformance();

    return () => {
      window.removeEventListener('scroll', trackScrollEvents);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      window.requestAnimationFrame = originalRaf;
    };
  }, [enabled, onMetricsUpdate]);

  if (!enabled) return null;

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-3 rounded text-xs font-mono z-50 space-y-1">
      <div className="text-green-400 font-bold">Performance Monitor</div>
      <div>FPS: <span className={metrics.fps < 30 ? 'text-red-400' : 'text-green-400'}>{metrics.fps}</span></div>
      <div>Render: {Math.round(metrics.renderTime * 100) / 100}ms</div>
      <div>Memory: {metrics.memoryUsage}MB</div>
      <div>Scroll Events: {metrics.scrollEvents}</div>
      <div>RAF Calls: {metrics.rafCalls}</div>
    </div>
  );
};
