
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, UserPlus } from 'lucide-react';
import { getCurrentPlan } from './utils/planConfig';
import { useSubscriptionSignUp } from './hooks/useSubscriptionSignUp';
import { useSubscriptionFormState } from './hooks/useSubscriptionFormState';
import PlanSummary from './components/PlanSummary';
import PersonalDataSection from './components/PersonalDataSection';
import CompanyDataSection from './components/CompanyDataSection';
import ConsentSection from './components/ConsentSection';

interface SubscriptionSignUpFormProps {
  selectedPlan: string;
}

const SubscriptionSignUpForm: React.FC<SubscriptionSignUpFormProps> = ({ selectedPlan }) => {
  const { loading, signupInfo, handleSignUp } = useSubscriptionSignUp();
  const formState = useSubscriptionFormState();
  
  const currentPlan = getCurrentPlan(selectedPlan);
  const isFree = currentPlan.price === 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      ...formState.getFormData(),
      selectedPlan
    };

    await handleSignUp(formData, formState.agreeTerms, formState.agreePrivacy);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <PlanSummary
        selectedPlan={selectedPlan}
        billingType={formState.billingType}
        onBillingTypeChange={formState.setBillingType}
      />

      <PersonalDataSection
        firstName={formState.firstName}
        lastName={formState.lastName}
        email={formState.email}
        password={formState.password}
        phone={formState.phone}
        onFirstNameChange={formState.setFirstName}
        onLastNameChange={formState.setLastName}
        onEmailChange={formState.setEmail}
        onPasswordChange={formState.setPassword}
        onPhoneChange={formState.setPhone}
      />

      {!isFree && (
        <CompanyDataSection
          companyName={formState.companyName}
          vatNumber={formState.vatNumber}
          address={formState.address}
          city={formState.city}
          postalCode={formState.postalCode}
          country={formState.country}
          province={formState.province}
          onCompanyNameChange={formState.setCompanyName}
          onVatNumberChange={formState.setVatNumber}
          onAddressChange={formState.setAddress}
          onCityChange={formState.setCity}
          onPostalCodeChange={formState.setPostalCode}
          onCountryChange={formState.setCountry}
          onProvinceChange={formState.setProvince}
        />
      )}

      <ConsentSection
        agreeTerms={formState.agreeTerms}
        agreePrivacy={formState.agreePrivacy}
        newsletter={formState.newsletter}
        onAgreeTermsChange={formState.handleAgreeTermsChange}
        onAgreePrivacyChange={formState.handleAgreePrivacyChange}
        onNewsletterChange={formState.handleNewsletterChange}
      />

      <Button 
        type="submit" 
        className={`w-full text-lg py-3 ${
          isFree 
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-golden hover:bg-yellow-600 text-black'
        }`}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creazione account in corso...
          </>
        ) : isFree ? (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Crea Account Gratuito
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Completa Sottoscrizione - €{currentPlan.price}/{formState.billingType === 'monthly' ? 'mese' : 'anno'}
          </>
        )}
      </Button>

      {signupInfo && (
        <div className="bg-yellow-100 border border-yellow-300 p-3 rounded text-yellow-800 mt-2 text-sm">
          {signupInfo}
        </div>
      )}
    </form>
  );
};

export default SubscriptionSignUpForm;
