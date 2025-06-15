
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Requesting password reset for:', email);
      
      const { error } = await supabase.functions.invoke('reset-password', {
        body: {
          email,
          redirectTo: `${window.location.origin}/auth?reset=true`,
        },
      });

      if (error) {
        console.error('Reset password error:', error);
        throw error;
      }

      console.log('Password reset email sent successfully');
      setResetSent(true);
      toast({
        title: "Email di Reset Inviata",
        description: "Controlla la tua email per il link di reset della password.",
      });

    } catch (error: any) {
      console.error('Error during password reset:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile inviare l'email di reset. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="space-y-4 text-center">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-black">Email Inviata!</h3>
          <p className="text-gray-600">
            Ti abbiamo inviato un'email con le istruzioni per resettare la password.
            Controlla anche la cartella spam.
          </p>
        </div>
        <Button 
          onClick={onBackToLogin}
          variant="outline"
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna al Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="space-y-2 text-center mb-4">
        <h3 className="text-lg font-semibold text-black">Password Dimenticata?</h3>
        <p className="text-gray-600 text-sm">
          Inserisci la tua email e ti invieremo un link per resettare la password.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="reset-email" className="text-black">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="reset-email"
            type="email"
            placeholder="inserisci la tua email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            Invio in corso...
          </>
        ) : (
          'Invia Email di Reset'
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

export default ForgotPasswordForm;
