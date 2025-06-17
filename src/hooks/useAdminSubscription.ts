
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAdminSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setLoadingSubscription(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
        }
        
        setSubscription(data);
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    checkSubscription();
  }, [user]);

  const canAccessChatbot = subscription?.subscribed && subscription?.subscription_tier !== 'free';

  return {
    subscription,
    loadingSubscription,
    canAccessChatbot
  };
};
