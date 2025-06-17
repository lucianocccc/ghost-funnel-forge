
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';

export const useAdminSubscription = () => {
  const { 
    subscription, 
    loading, 
    canAccessFeature,
    freeForAllMode 
  } = useSubscriptionManagement();

  const canAccessChatbot = canAccessFeature('chatbot');
  const loadingSubscription = loading;

  // In modalità test, aggiungi informazioni di debug
  console.log('AdminSubscription Debug:', {
    freeForAllMode,
    subscription,
    canAccessChatbot,
    loading
  });

  return {
    subscription,
    loadingSubscription,
    canAccessChatbot,
    freeForAllMode
  };
};
