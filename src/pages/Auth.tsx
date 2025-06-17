
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from './auth/SignInForm';
import SignUpForm from './auth/SignUpForm';
import SubscriptionSignUpForm from './auth/SubscriptionSignUpForm';
import ForgotPasswordForm from './auth/ForgotPasswordForm';
import ResetPasswordForm from './auth/ResetPasswordForm';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const { user, profile, loading } = useAuth();

  const isSubscription = searchParams.get('subscribe') === 'true';
  const selectedPlan = searchParams.get('plan') || 'professional';

  // Redirect authenticated users with improved logic
  useEffect(() => {
    if (!loading && user && user.email_confirmed_at) {
      console.log('User is authenticated and confirmed, checking redirect...');
      
      // Check if user is admin and redirect accordingly
      if (profile?.role === 'admin') {
        console.log('Admin user detected, redirecting to /admin');
        window.location.href = '/admin';
      } else if (profile) {
        console.log('Regular user detected, redirecting to home');
        window.location.href = '/';
      }
      // If profile is still loading, wait for it
    }
  }, [user, profile, loading]);

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

  // Show loading while checking authentication and profile
  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-golden mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">
              Ghost <span className="text-golden">Funnel</span>
            </h1>
            <p className="text-gray-300">Verifica autenticazione...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-golden mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Ghost <span className="text-golden">Funnel</span>
          </h1>
          <p className="text-gray-300">{getSubtitle()}</p>
        </div>

        <Card className="bg-white border-golden border">
          <CardHeader>
            <CardTitle className="text-center text-black">
              {getTitle()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showResetPassword ? (
              <ResetPasswordForm onBackToLogin={handleBackToLogin} />
            ) : showForgotPassword ? (
              <ForgotPasswordForm onBackToLogin={handleBackToLogin} />
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Accedi</TabsTrigger>
                  <TabsTrigger value="signup">
                    {isSubscription ? 'Sottoscrivi' : 'Registrati'}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <SignInForm onForgotPassword={handleForgotPassword} />
                </TabsContent>
                <TabsContent value="signup">
                  {isSubscription ? (
                    <SubscriptionSignUpForm selectedPlan={selectedPlan} />
                  ) : (
                    <SignUpForm />
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
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
