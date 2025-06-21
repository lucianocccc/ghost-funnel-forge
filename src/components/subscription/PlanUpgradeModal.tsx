
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Zap, Users, BarChart3 } from 'lucide-react';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';

interface PlanUpgradeModalProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({ 
  children, 
  isOpen, 
  onClose 
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const { getCurrentPlan, upgradeToPremium, loading } = useSubscriptionManagement();
  
  const currentPlan = getCurrentPlan();
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onClose ? (value: boolean) => !value && onClose() : setInternalOpen;

  const plans = [
    {
      name: 'Gratuito',
      price: '€0',
      description: 'Perfetto per iniziare',
      features: [
        'Fino a 3 funnel',
        '100 lead al mese',
        'Analytics di base',
        'Supporto email'
      ],
      current: currentPlan?.name === 'Gratuito' || !currentPlan,
      recommended: false
    },
    {
      name: 'Premium',
      price: '€29',
      description: 'Per professionisti e aziende',
      features: [
        'Funnel illimitati',
        'Lead illimitati',
        'Analytics avanzate',
        'AI Assistant',
        'Supporto prioritario',
        'Integrazioni avanzate'
      ],
      current: currentPlan?.name === 'Premium',
      recommended: true
    }
  ];

  const handleUpgrade = async () => {
    try {
      await upgradeToPremium();
      setOpen(false);
    } catch (error) {
      console.error('Errore durante l\'upgrade:', error);
    }
  };

  const modalContent = (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-golden" />
          Scegli il tuo piano
        </DialogTitle>
      </DialogHeader>
      
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative ${plan.recommended ? 'border-golden ring-2 ring-golden ring-opacity-20' : ''}`}
          >
            {plan.recommended && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-golden text-black">
                Consigliato
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                {plan.price}
                {plan.price !== '€0' && <span className="text-sm font-normal">/mese</span>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-4">
                {plan.current ? (
                  <Button className="w-full" disabled>
                    Piano Attuale
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-golden hover:bg-yellow-600 text-black"
                    onClick={handleUpgrade}
                    disabled={loading}
                  >
                    {loading ? 'Elaborazione...' : 'Aggiorna al Premium'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-golden" />
          Cosa include il piano Premium?
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span>Lead management avanzato</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-500" />
            <span>Analytics dettagliate</span>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-golden" />
            <span>Supporto prioritario</span>
          </div>
        </div>
      </div>
    </DialogContent>
  );

  if (children) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        {modalContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {modalContent}
    </Dialog>
  );
};

export default PlanUpgradeModal;
