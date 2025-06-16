
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrentPlan } from '../utils/planConfig';

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
  const currentPlan = getCurrentPlan(selectedPlan);
  
  // Calculate annual price with 15% discount
  const getAnnualPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.85);
  };
  
  const displayPrice = billingType === 'yearly' 
    ? getAnnualPrice(currentPlan.price) 
    : currentPlan.price;
    
  const originalAnnualPrice = currentPlan.price * 12;
  const annualSavings = originalAnnualPrice - getAnnualPrice(currentPlan.price);

  return (
    <div className="bg-golden/10 border border-golden rounded-lg p-4 mb-6">
      <h3 className="font-bold text-lg text-black mb-2">Piano Selezionato: {currentPlan.name}</h3>
      <p className="text-gray-700 mb-2">{currentPlan.description}</p>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-black">€{displayPrice}</span>
          {billingType === 'yearly' && (
            <div className="text-sm text-gray-600">
              <span className="line-through">€{originalAnnualPrice}</span>
              <span className="text-green-600 font-semibold ml-2">
                Risparmi €{annualSavings}
              </span>
            </div>
          )}
        </div>
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
