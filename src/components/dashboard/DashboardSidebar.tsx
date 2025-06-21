
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, Crown, LogOut, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PlanUpgradeModal from '@/components/subscription/PlanUpgradeModal';

interface DashboardSidebarProps {
  className?: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ className }) => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [planModalOpen, setPlanModalOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Errore",
        description: "Errore durante il logout",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="p-2 hover:bg-gray-100 transition-colors group"
          >
            <div className="flex flex-col gap-1">
              <div className="w-6 h-0.5 bg-gray-600 group-hover:bg-golden transition-colors"></div>
              <div className="w-6 h-0.5 bg-gray-600 group-hover:bg-golden transition-colors"></div>
              <div className="w-6 h-0.5 bg-gray-600 group-hover:bg-golden transition-colors"></div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg z-50">
          <DropdownMenuLabel className="text-gray-900 font-semibold">
            Ciao, {profile?.first_name || 'Utente'}!
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-200" />
          
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 text-gray-700">
            <User className="w-4 h-4 mr-2" />
            Impostazioni Account
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 text-gray-700">
            <Bot className="w-4 h-4 mr-2" />
            Impostazioni AI
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="cursor-pointer hover:bg-gray-100 text-gray-700"
            onClick={() => setPlanModalOpen(true)}
          >
            <Crown className="w-4 h-4 mr-2" />
            Piano e Abbonamento
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-gray-200" />
          
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="cursor-pointer hover:bg-gray-100 text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal Piano */}
      <PlanUpgradeModal 
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
      />
    </div>
  );
};

export default DashboardSidebar;
