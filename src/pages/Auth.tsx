
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from './auth/SignInForm';
import SignUpForm from './auth/SignUpForm';
import ForgotPasswordForm from './auth/ForgotPasswordForm';
import ResetPasswordForm from './auth/ResetPasswordForm';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if this is a password reset redirect
    const isReset = searchParams.get('reset') === 'true';
    if (isReset) {
      setShowResetPassword(true);
      setShowForgotPassword(false);
    }
  }, [searchParams]);

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
    return 'Autenticazione';
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-golden mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Lead <span className="text-golden">Manager</span>
          </h1>
          <p className="text-gray-300">Accedi alla tua dashboard</p>
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
                  <TabsTrigger value="signup">Registrati</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <SignInForm onForgotPassword={handleForgotPassword} />
                </TabsContent>
                <TabsContent value="signup">
                  <SignUpForm />
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
