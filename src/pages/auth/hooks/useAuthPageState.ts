
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useAuthPageState = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [searchParams] = useSearchParams();

  const isSubscription = searchParams.get('subscribe') === 'true';
  const selectedPlan = searchParams.get('plan') || 'professional';

  // Handle URL parameters
  useEffect(() => {
    // Check if this is a password reset redirect
    const isReset = searchParams.get('reset') === 'true';
    if (isReset) {
      setShowResetPassword(true);
      setShowForgotPassword(false);
    }

    // If coming from subscription, default to signup
    if (isSubscription && !isReset) {
      setActiveTab('signup');
    }
  }, [searchParams, isSubscription]);

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setShowResetPassword(false);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShowResetPassword(false);
    setActiveTab('signin');
  };

  const getTitle = () => {
    if (showResetPassword) return 'Imposta Nuova Password';
    if (showForgotPassword) return 'Reset Password';
    if (isSubscription) return 'Sottoscrivi il tuo Piano';
    return 'Autenticazione';
  };

  const getSubtitle = () => {
    if (isSubscription) {
      const planNames = {
        free: 'Piano Gratuito - €0/mese',
        starter: 'Piano Starter - €29/mese',
        professional: 'Piano Professional - €79/mese',
        enterprise: 'Piano Enterprise - €199/mese'
      };
      return planNames[selectedPlan as keyof typeof planNames] || 'Piano Professional - €79/mese';
    }
    return 'Accedi alla tua dashboard';
  };

  return {
    activeTab,
    setActiveTab,
    showForgotPassword,
    showResetPassword,
    isSubscription,
    selectedPlan,
    handleForgotPassword,
    handleBackToLogin,
    getTitle,
    getSubtitle
  };
};
