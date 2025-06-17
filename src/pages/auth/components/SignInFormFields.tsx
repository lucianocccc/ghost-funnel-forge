
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock } from 'lucide-react';

interface SignInFormFieldsProps {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onForgotPassword: () => void;
}

const SignInFormFields: React.FC<SignInFormFieldsProps> = ({
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onForgotPassword
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-black">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="inserisci la tua email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            className="pl-10"
            disabled={loading}
            autoComplete="email"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-black">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            placeholder="inserisci la tua password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            className="pl-10"
            disabled={loading}
            autoComplete="current-password"
          />
        </div>
      </div>
      
      <div className="text-right">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-golden hover:text-yellow-600 hover:underline"
          disabled={loading}
        >
          Password dimenticata?
        </button>
      </div>
    </>
  );
};

export default SignInFormFields;
