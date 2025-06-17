
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
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [searchParams] = useSearchParams();
  const { user, profile, loading } = useAuth();

  const isSubscription = searchParams.get('subscribe') === 'true';
  const selectedPlan = searchParams.get('plan') || 'professional';

  // Initialize authentication state and verify session validity
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Auth page: Initializing and verifying session...');
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth page: Session error, clearing state:', error);
          await supabase.auth.signOut({ scope: 'global' });
          setAuthInitialized(true);
          return;
        }

        // If no session, we're good to show auth forms
        if (!session) {
          console.log('Auth page: No session found, showing auth forms');
          setAuthInitialized(true);
          return;
        }

        // If session exists, verify it's valid by making an authenticated request
        console.log('Auth page: Session found, verifying validity...');
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);

        if (profileError) {
          console.error('Auth page: Session invalid, clearing:', profileError);
          await supabase.auth.signOut({ scope: 'global' });
          setAuthInitialized(true);
          return;
        }

        // Session is valid and user is authenticated
        console.log('Auth page: Valid session detected');
        setAuthInitialized(true);

      } catch (error) {
        console.error('Auth page: Initialization error:', error);
        // Clear any potentially corrupted state
        await supabase.auth.signOut({ scope: 'global' });
        setAuthInitialized(true);
      }
    };

    initAuth();
  }, []);

  // Handle authenticated user redirect ONLY after initialization
  useEffect(() => {
    if (!authInitialized || loading) {
      return;
    }

    // Only redirect if we have a valid, confirmed user with profile
    if (user && user.email_confirmed_at && profile) {
      console.log('Auth page: Authenticated user detected, redirecting...', {
        userEmail: user.email,
        profileRole: profile.role,
        emailConfirmed: user.email_confirmed_at
      });
      
      // Redirect based on role
      if (profile.role === 'admin') {
        console.log('Auth page: Admin user, redirecting to /admin');
        window.location.href = '/admin';
      } else {
        console.log('Auth page: Regular user, redirecting to home');
        window.location.href = '/';
      }
    } else if (user && !user.email_confirmed_at) {
      console.log('Auth page: User email not confirmed, staying on auth page');
    } else if (user && !profile) {
      console.log('Auth page: User without profile, waiting for profile load...');
    }
  }, [user, profile, loading, authInitialized]);

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

  // Show loading while initializing or checking authentication
  if (!authInitialized || loading) {
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
