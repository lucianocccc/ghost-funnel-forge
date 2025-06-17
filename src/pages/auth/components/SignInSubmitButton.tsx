
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SignInSubmitButtonProps {
  loading: boolean;
  disabled: boolean;
}

const SignInSubmitButton: React.FC<SignInSubmitButtonProps> = ({ loading, disabled }) => {
  return (
    <Button 
      type="submit" 
      className="w-full bg-golden hover:bg-yellow-600 text-black"
      disabled={disabled}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Accesso in corso...
        </>
      ) : (
        'Accedi'
      )}
    </Button>
  );
};

export default SignInSubmitButton;
