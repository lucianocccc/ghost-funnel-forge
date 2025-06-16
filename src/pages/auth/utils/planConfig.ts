
export const planDetails = {
  free: { name: 'Gratuito', price: 0, description: 'Piano completamente gratuito' },
  starter: { name: 'Starter', price: 29, description: 'Perfetto per iniziare' },
  professional: { name: 'Professional', price: 79, description: 'La scelta più popolare' },
  enterprise: { name: 'Enterprise', price: 199, description: 'Per team e aziende' }
};

export const trialPeriods = {
  free: 'Sempre gratuito',
  starter: '7 giorni gratuiti',
  professional: '15 giorni gratuiti',
  enterprise: '1 mese gratuito'
};

export const getCurrentPlan = (selectedPlan: string) => {
  return planDetails[selectedPlan as keyof typeof planDetails] || planDetails.free;
};

export const getTrialPeriod = (selectedPlan: string) => {
  return trialPeriods[selectedPlan as keyof typeof trialPeriods] || trialPeriods.free;
};
