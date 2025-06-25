
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SignInForm from '../SignInForm';
import SignUpForm from '../SignUpForm';
import SubscriptionSignUpForm from '../SubscriptionSignUpForm';
import ForgotPasswordForm from '../ForgotPasswordForm';
import ResetPasswordForm from '../ResetPasswordForm';
import { cleanupAuthState } from '../authUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthPageContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showForgotPassword: boolean;
  showResetPassword: boolean;
  isSubscription: boolean;
  selectedPlan: string;
  getTitle: () => string;
  handleForgotPassword: () => void;
  handleBackToLogin: () => void;
}

const AuthPageContent: React.FC<AuthPageContentProps> = ({
  activeTab,
  setActiveTab,
  showForgotPassword,
  showResetPassword,
  isSubscription,
  selectedPlan,
  getTitle,
  handleForgotPassword,
  handleBackToLogin
}) => {
  const { toast } = useToast();

  const handleResetAuthState = async () => {
    try {
      console.log('Forcing complete auth state reset...');
      
      // Complete cleanup
      cleanupAuthState();
      
      // Force sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Sign out error (expected):', err);
      }
      
      // Clear all possible auth keys
      Object.keys(localStorage).forEach((key) => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      toast({
        title: "Stato Reset",
        description: "Lo stato di autenticazione è stato completamente pulito. Riprova ad accedere.",
      });
      
      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error resetting auth state:', error);
      toast({
        title: "Errore",
        description: "Errore durante il reset. Ricarica la pagina manualmente.",
        variant: "destructive",
      });
    }
  };

  return (
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
        
        {/* Emergency reset button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              Problemi con l'accesso?
            </p>
            <Button
              onClick={handleResetAuthState}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Reset Stato Autenticazione
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthPageContent;
