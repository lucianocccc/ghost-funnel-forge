
export const planDetails = {
  starter: { name: 'Starter', price: 29, description: 'Perfetto per iniziare' },
  professional: { name: 'Professional', price: 79, description: 'La scelta più popolare' },
  enterprise: { name: 'Enterprise', price: 199, description: 'Per team e aziende' }
};

export const getCurrentPlan = (selectedPlan: string) => {
  return planDetails[selectedPlan as keyof typeof planDetails] || planDetails.professional;
};
