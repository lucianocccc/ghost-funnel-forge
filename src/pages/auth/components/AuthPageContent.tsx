
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from '../SignInForm';
import SignUpForm from '../SignUpForm';
import SubscriptionSignUpForm from '../SubscriptionSignUpForm';
import ForgotPasswordForm from '../ForgotPasswordForm';
import ResetPasswordForm from '../ResetPasswordForm';

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
      </CardContent>
    </Card>
  );
};

export default AuthPageContent;
