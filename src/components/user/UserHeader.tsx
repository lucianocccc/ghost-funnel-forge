
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserHeaderProps {
  user: any;
  subscription?: any;
  onSignOut: () => void;
  onUpgrade?: () => void;
  showUpgrade?: boolean;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  user,
  subscription,
  onSignOut,
  onUpgrade,
  showUpgrade = false
}) => {
  const navigate = useNavigate();

  const getPlanBadge = () => {
    if (!subscription) return null;
    
    const planColors = {
      free: 'bg-gray-500',
      pro: 'bg-blue-500',
      enterprise: 'bg-purple-500'
    };
    
    const color = planColors[subscription.plan_type as keyof typeof planColors] || 'bg-gray-500';
    
    return (
      <Badge className={`${color} text-white`}>
        {subscription.plan_type?.toUpperCase() || 'FREE'}
      </Badge>
    );
  };

  return (
    <header className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {showUpgrade && (
            <Button
              onClick={onUpgrade}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          )}

          <div className="flex items-center gap-2">
            {getPlanBadge()}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">
                    {user?.email || 'Utente'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <Zap className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate('/revolution')}>
                  <Crown className="w-4 h-4 mr-2" />
                  Revolution Hub
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Impostazioni
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={onSignOut} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Esci
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
