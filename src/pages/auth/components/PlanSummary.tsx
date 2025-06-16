
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PlanSummaryProps {
  selectedPlan: string;
  billingType: string;
  onBillingTypeChange: (value: string) => void;
}

const PlanSummary: React.FC<PlanSummaryProps> = ({
  selectedPlan,
  billingType,
  onBillingTypeChange
}) => {
  const planDetails = {
    starter: { name: 'Starter', price: 29, description: 'Perfetto per iniziare' },
    professional: { name: 'Professional', price: 79, description: 'La scelta più popolare' },
    enterprise: { name: 'Enterprise', price: 199, description: 'Per team e aziende' }
  };

  const currentPlan = planDetails[selectedPlan as keyof typeof planDetails] || planDetails.professional;

  return (
    <div className="bg-golden/10 border border-golden rounded-lg p-4 mb-6">
      <h3 className="font-bold text-lg text-black mb-2">Piano Selezionato: {currentPlan.name}</h3>
      <p className="text-gray-700 mb-2">{currentPlan.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-black">€{currentPlan.price}</span>
        <Select value={billingType} onValueChange={onBillingTypeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Mensile</SelectItem>
            <SelectItem value="yearly">Annuale (-15%)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PlanSummary;
