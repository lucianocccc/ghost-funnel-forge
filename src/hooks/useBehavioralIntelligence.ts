// Ghost Funnel Revolution - Behavioral Intelligence Hook

import { useState, useEffect, useCallback } from 'react';
import { BehavioralIntelligenceService } from '@/services/revolutionServices';
import { BehaviorPattern, BehaviorAction } from '@/types/revolutionTypes';

interface UseBehavioralIntelligenceOptions {
  trackingEnabled?: boolean;
  sessionId?: string;
  funnelId?: string;
}

export const useBehavioralIntelligence = (options: UseBehavioralIntelligenceOptions = {}) => {
  const [engagementScore, setEngagementScore] = useState(0);
  const [conversionIntent, setConversionIntent] = useState(0);
  const [behaviorPattern, setBehaviorPattern] = useState<string>('exploring_user');
  const [isTracking, setIsTracking] = useState(options.trackingEnabled ?? true);

  // Track user action
  const trackAction = useCallback(async (action: BehaviorAction) => {
    if (!isTracking) return;

    try {
      await BehavioralIntelligenceService.trackUserBehavior({
        actionType: action.type,
        pagePath: window.location.pathname,
        actionData: action.data
      });

      // Update local engagement metrics
      setEngagementScore(prev => prev + action.engagementValue);
      
      // Calculate intent based on action type
      let intentIncrease = 0;
      switch (action.type) {
        case 'form_interaction':
          intentIncrease = 0.15;
          break;
        case 'download':
          intentIncrease = 0.25;
          break;
        case 'download':
          intentIncrease = 0.35;
          break;
        case 'video_watch':
          intentIncrease = 0.2;
          break;
        default:
          intentIncrease = 0.05;
      }
      
      setConversionIntent(prev => Math.min(prev + intentIncrease, 1.0));
      
    } catch (error) {
      console.error('Failed to track behavior:', error);
    }
  }, [isTracking]);

  // Auto-track common behaviors
  useEffect(() => {
    if (!isTracking) return;

    // Track page view
    trackAction({
      type: 'page_view',
      data: { 
        url: window.location.href,
        funnelId: options.funnelId 
      },
      timestamp: new Date(),
      engagementValue: 1
    });

    // Track scroll behavior
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercentage > 25) {
          trackAction({
            type: 'scroll',
            data: { scrollPercentage },
            timestamp: new Date(),
            engagementValue: 2
          });
        }
      }, 1000);
    };

    // Track click behavior
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      trackAction({
        type: 'click',
        data: { 
          element: target.tagName,
          className: target.className,
          id: target.id
        },
        timestamp: new Date(),
        engagementValue: 3
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      clearTimeout(scrollTimeout);
    };
  }, [isTracking, trackAction, options.funnelId]);

  // Determine behavior pattern based on metrics
  useEffect(() => {
    if (conversionIntent > 0.8) {
      setBehaviorPattern('high_intent_user');
    } else if (engagementScore > 20) {
      setBehaviorPattern('engaged_user');
    } else if (window.location.pathname.includes('pricing')) {
      setBehaviorPattern('price_sensitive_user');
    } else {
      setBehaviorPattern('exploring_user');
    }
  }, [engagementScore, conversionIntent]);

  // Specialized tracking methods
  const trackFormInteraction = useCallback((formData: Record<string, any>) => {
    trackAction({
      type: 'form_interaction',
      data: formData,
      timestamp: new Date(),
      engagementValue: 5
    });
  }, [trackAction]);

  const trackDocumentUpload = useCallback((documentInfo: { name: string; size: number; type: string }) => {
    trackAction({
      type: 'download',
      data: documentInfo,
      timestamp: new Date(),
      engagementValue: 10
    });
  }, [trackAction]);

  const trackVideoWatch = useCallback((videoData: { duration: number; watchTime: number }) => {
    trackAction({
      type: 'video_watch',
      data: videoData,
      timestamp: new Date(),
      engagementValue: 6
    });
  }, [trackAction]);

  const getRecommendedNextAction = useCallback(() => {
    if (conversionIntent > 0.8) {
      return {
        action: 'show_high_value_offer',
        message: 'Utente ad alta intenzione - mostra offerta premium',
        priority: 'high' as const
      };
    } else if (conversionIntent > 0.6) {
      return {
        action: 'show_social_proof',
        message: 'Mostra testimonianze e case study',
        priority: 'medium' as const
      };
    } else if (engagementScore > 15) {
      return {
        action: 'provide_more_info',
        message: 'Fornisci contenuti educativi dettagliati',
        priority: 'medium' as const
      };
    } else {
      return {
        action: 'guide_exploration',
        message: 'Guida l\'esplorazione con contenuti semplici',
        priority: 'low' as const
      };
    }
  }, [conversionIntent, engagementScore]);

  const shouldShowBooking = useCallback(() => {
    // Only show booking for high-intent users
    return conversionIntent > 0.7 || behaviorPattern === 'high_intent_user';
  }, [conversionIntent, behaviorPattern]);

  const shouldRedirectToMarketing = useCallback(() => {
    // Redirect to email marketing for lower-intent users
    return conversionIntent < 0.5 && engagementScore < 10;
  }, [conversionIntent, engagementScore]);

  return {
    // Metrics
    engagementScore,
    conversionIntent,
    behaviorPattern,
    
    // Tracking methods
    trackAction,
    trackFormInteraction,
    trackDocumentUpload,
    trackVideoWatch,
    
    // Decision methods
    getRecommendedNextAction,
    shouldShowBooking,
    shouldRedirectToMarketing,
    
    // Control
    isTracking,
    setIsTracking
  };
};