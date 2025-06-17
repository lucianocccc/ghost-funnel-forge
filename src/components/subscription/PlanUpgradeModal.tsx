
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Crown, Loader2 } from 'lucide-react';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';

interface PlanUpgradeModalProps {
  children: React.ReactNode;
  currentFeature?: string;
}

const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({ children, currentFeature }) => {
  const { 
    subscriptionPlans, 
    upgradeToplan, 
    upgradeLoading, 
    getCurrentPlan 
  } = useSubscriptionManagement();
  
  const currentPlan = getCurrentPlan();

  const getRecommendedPlan = () => {
    if (currentFeature === 'deep_thinking' || currentFeature === 'file_upload') {
      return subscriptionPlans.find(plan => plan.tier === 'enterprise');
    }
    if (currentFeature === 'chatbot' || currentFeature === 'advanced_analytics') {
      return subscriptionPlans.find(plan => plan.tier === 'professional');
    }
    return subscriptionPlans.find(plan => plan.tier === 'professional');
  };

  const recommendedPlan = getRecommendedPlan();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Aggiorna il tuo Piano</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {subscriptionPlans.map((plan) => {
            const isCurrentPlan = currentPlan?.tier === plan.tier;
            const isRecommended = recommendedPlan?.tier === plan.tier;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${
                  isCurrentPlan 
                    ? 'border-green-500 bg-green-50' 
                    : isRecommended 
                      ? 'border-golden bg-yellow-50' 
                      : 'border-gray-200'
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Piano Attuale
                    </div>
                  </div>
                )}
                {isRecommended && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-golden text-black px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Crown className="w-3 h-3 mr-1" />
                      Consigliato
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-golden">€{plan.price}</span>
                    <span className="text-gray-600">/mese</span>
                  </div>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => upgradeToplan(plan.id)}
                    disabled={isCurrentPlan || upgradeLoading}
                    className={`w-full ${
                      isCurrentPlan 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : plan.price === 0 
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-golden hover:bg-yellow-600 text-black'
                    }`}
                  >
                    {upgradeLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Caricamento...
                      </>
                    ) : isCurrentPlan ? (
                      'Piano Attuale'
                    ) : plan.price === 0 ? (
                      'Passa al Gratuito'
                    ) : (
                      `Aggiorna a ${plan.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Cosa succede quando aggiorno?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• L'aggiornamento è immediato</li>
            <li>• Accesso istantaneo alle nuove funzionalità</li>
            <li>• Fatturazione mensile automatica</li>
            <li>• Puoi cancellare in qualsiasi momento</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanUpgradeModal;
