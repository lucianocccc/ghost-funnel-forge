
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthPageState } from './auth/hooks/useAuthPageState';
import { useAuthRedirect } from './auth/hooks/useAuthRedirect';
import AuthPageLoading from './auth/components/AuthPageLoading';
import AuthPageHeader from './auth/components/AuthPageHeader';
import AuthPageContent from './auth/components/AuthPageContent';

const Auth = () => {
  const { user, profile, loading } = useAuth();
  const authPageState = useAuthPageState();

  // Handle authenticated user redirect
  useAuthRedirect({ loading, user, profile });

  // Show loading while checking authentication
  if (loading) {
    return <AuthPageLoading />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <AuthPageHeader subtitle={authPageState.getSubtitle()} />
        
        <AuthPageContent
          activeTab={authPageState.activeTab}
          setActiveTab={authPageState.setActiveTab}
          showForgotPassword={authPageState.showForgotPassword}
          showResetPassword={authPageState.showResetPassword}
          isSubscription={authPageState.isSubscription}
          selectedPlan={authPageState.selectedPlan}
          getTitle={authPageState.getTitle}
          handleForgotPassword={authPageState.handleForgotPassword}
          handleBackToLogin={authPageState.handleBackToLogin}
        />
        
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Problemi con l'accesso? Contatta il supporto.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
