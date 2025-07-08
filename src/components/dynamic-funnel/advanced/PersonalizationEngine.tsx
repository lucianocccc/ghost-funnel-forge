import React, { useEffect } from 'react';

interface PersonalizationEngineProps {
  userBehavior: any;
  personalizationConfig?: any;
  onPersonalize: (message: string) => void;
}

export const PersonalizationEngine: React.FC<PersonalizationEngineProps> = ({
  userBehavior, personalizationConfig, onPersonalize
}) => {
  const [triggeredMessages, setTriggeredMessages] = React.useState<Set<string>>(new Set());

  useEffect(() => {
    if (!personalizationConfig?.enabled) return;

    // Trigger personalization based on behavior (only once per session)
    if (userBehavior.scrollDepth > 70 && userBehavior.timeOnPage > 45000 && !triggeredMessages.has('deep_engagement')) {
      onPersonalize("Sembra che tu sia davvero interessato! Hai uno sconto speciale per te.");
      setTriggeredMessages(prev => new Set([...prev, 'deep_engagement']));
    }
    
    if (userBehavior.interactions > 5 && !triggeredMessages.has('active_exploration')) {
      onPersonalize("Vedo che stai esplorando attivamente. Vuoi che ti aiuti a trovare l'opzione migliore?");
      setTriggeredMessages(prev => new Set([...prev, 'active_exploration']));
    }
  }, [userBehavior, personalizationConfig, onPersonalize, triggeredMessages]);

  return null; // This is a logic-only component
};