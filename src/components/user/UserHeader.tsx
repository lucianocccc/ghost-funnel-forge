
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, LogOut } from 'lucide-react';

interface UserHeaderProps {
  user: any;
  subscription: any;
  onSignOut: () => void;
  onUpgrade: () => void;
  showUpgrade: boolean;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  user,
  subscription,
  onSignOut,
  onUpgrade,
  showUpgrade
}) => {
  const getPlanName = () => {
    if (!subscription) return 'Gratuito';
    return subscription.subscription_tier ? 
      subscription.subscription_tier.charAt(0).toUpperCase() + subscription.subscription_tier.slice(1) :
      'Gratuito';
  };

  return (
    <header className="border-b bg-card">
      <div className="flex items-center justify-between p-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Benvenuto, {user?.email}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Crown className="w-3 h-3" />
              {getPlanName()}
            </Badge>
            {showUpgrade && (
              <Button
                size="sm"
                onClick={onUpgrade}
                className="bg-golden hover:bg-yellow-600 text-black"
              >
                Upgrade
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              onClick={onSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Esci
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
