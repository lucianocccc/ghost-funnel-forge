
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';

export const useAdminSubscription = () => {
  const { 
    subscription, 
    loading, 
    canAccessFeature 
  } = useSubscriptionManagement();

  const canAccessChatbot = canAccessFeature('chatbot');
  const loadingSubscription = loading;

  return {
    subscription,
    loadingSubscription,
    canAccessChatbot
  };
};
