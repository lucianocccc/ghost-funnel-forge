
import React, { useState } from 'react';
import SignInFormFields from './components/SignInFormFields';
import SignInSubmitButton from './components/SignInSubmitButton';
import { useSignIn } from './hooks/useSignIn';

interface SignInFormProps {
  onForgotPassword: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, signIn } = useSignIn();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  const isFormValid = email.trim() && password.trim();

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <SignInFormFields
        email={email}
        password={password}
        loading={loading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onForgotPassword={onForgotPassword}
      />
      
      <SignInSubmitButton 
        loading={loading}
        disabled={loading || !isFormValid}
      />
    </form>
  );
};

export default SignInForm;
