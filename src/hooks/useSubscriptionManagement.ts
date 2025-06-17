
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  tier: 'free' | 'starter' | 'professional' | 'enterprise';
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    description: 'Piano completamente gratuito',
    tier: 'free',
    features: [
      'Fino a 10 leads/mese',
      'Analisi AI di base',
      '1 funnel attivo',
      'Dashboard essenziale'
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    description: 'Perfetto per iniziare',
    tier: 'starter',
    features: [
      'Fino a 100 leads/mese',
      'Analisi AI di base',
      '3 funnel attivi',
      'Email support',
      'Dashboard essenziale'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    description: 'La scelta più popolare',
    tier: 'professional',
    features: [
      'Fino a 1000 leads/mese',
      'ChatBot AI personalizzato',
      'Analisi AI avanzata',
      'Funnel illimitati',
      'Email automation',
      'Reportistica dettagliata',
      'Supporto prioritario'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    description: 'Per team e aziende',
    tier: 'enterprise',
    features: [
      'Leads illimitati',
      'ChatBot AI personalizzato',
      'Deep Thinking AI',
      'Caricamento documenti',
      'AI personalizzata',
      'Multi-team support',
      'API dedicata',
      'Account manager dedicato'
    ]
  }
];

export const useSubscriptionManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
      }
      
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const upgradeToplan = async (planId: string) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per aggiornare il piano.",
        variant: "destructive",
      });
      return;
    }

    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) return;

    setUpgradeLoading(true);

    try {
      // Se è il piano gratuito, aggiorna direttamente
      if (plan.price === 0) {
        const { error } = await supabase
          .from('subscribers')
          .upsert({
            user_id: user.id,
            email: user.email,
            subscribed: true,
            subscription_tier: plan.tier,
            subscription_end: null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (error) throw error;

        toast({
          title: "Piano aggiornato",
          description: `Sei passato al piano ${plan.name}`,
        });

        await loadSubscription();
        return;
      }

      // Per i piani a pagamento, creare checkout Stripe
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { 
          planId: planId,
          planName: plan.name,
          price: plan.price 
        },
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      if (data.url) {
        // Apri Stripe checkout in una nuova tab
        window.open(data.url, '_blank');
      }

    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del piano.",
        variant: "destructive",
      });
    } finally {
      setUpgradeLoading(false);
    }
  };

  const canAccessFeature = (feature: string): boolean => {
    if (!subscription || !subscription.subscribed) {
      return false;
    }

    const currentTier = subscription.subscription_tier;
    
    switch (feature) {
      case 'chatbot':
        return ['professional', 'enterprise'].includes(currentTier);
      case 'deep_thinking':
        return currentTier === 'enterprise';
      case 'file_upload':
        return currentTier === 'enterprise';
      case 'advanced_analytics':
        return ['professional', 'enterprise'].includes(currentTier);
      case 'unlimited_funnels':
        return ['professional', 'enterprise'].includes(currentTier);
      case 'email_automation':
        return ['professional', 'enterprise'].includes(currentTier);
      default:
        return true;
    }
  };

  const getCurrentPlan = (): SubscriptionPlan | null => {
    if (!subscription) return subscriptionPlans[0]; // Piano gratuito di default
    
    return subscriptionPlans.find(plan => 
      plan.tier === subscription.subscription_tier
    ) || subscriptionPlans[0];
  };

  return {
    subscription,
    loading,
    upgradeLoading,
    subscriptionPlans,
    loadSubscription,
    upgradeToplan,
    canAccessFeature,
    getCurrentPlan
  };
};
