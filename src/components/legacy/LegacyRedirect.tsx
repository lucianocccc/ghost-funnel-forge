
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Zap } from 'lucide-react';

interface LegacyRedirectProps {
  message?: string;
  redirectTo?: string;
}

const LegacyRedirect: React.FC<LegacyRedirectProps> = ({ 
  message = "Questa funzionalità è stata spostata nella dashboard unificata",
  redirectTo = "/dashboard"
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(redirectTo);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, redirectTo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-xl font-semibold mb-4">Reindirizzamento...</h2>
          
          <p className="text-muted-foreground mb-6">
            {message}
          </p>
          
          <div className="flex items-center justify-center text-sm text-primary">
            <span>Reindirizzamento automatico in corso</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </div>
          
          <div className="mt-4">
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegacyRedirect;
