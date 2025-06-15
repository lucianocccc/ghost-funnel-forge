
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';

interface ResetPasswordFormProps {
  onSubmit: (password: string, confirmPassword: string) => Promise<void>;
  onBackToLogin: () => void;
  loading: boolean;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ 
  onSubmit, 
  onBackToLogin, 
  loading 
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(password, confirmPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 text-center mb-4">
        <h3 className="text-lg font-semibold text-black">Imposta Nuova Password</h3>
        <p className="text-gray-600 text-sm">
          Inserisci la tua nuova password qui sotto.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-black">Nuova Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="new-password"
            type="password"
            placeholder="inserisci la nuova password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-black">Conferma Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="confirm-password"
            type="password"
            placeholder="conferma la nuova password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="pl-10"
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-golden hover:bg-yellow-600 text-black"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Aggiornamento...
          </>
        ) : (
          'Aggiorna Password'
        )}
      </Button>
      
      <Button 
        type="button"
        onClick={onBackToLogin}
        variant="outline"
        className="w-full"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Torna al Login
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
