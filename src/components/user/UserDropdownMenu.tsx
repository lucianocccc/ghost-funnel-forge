
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Menu, Home, Users, Zap, User, Settings, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserDropdownMenuProps {
  onSignOut: () => Promise<void>;
}

const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({ onSignOut }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await onSignOut();
      toast({
        title: "Logout Effettuato",
        description: "Sei stato disconnesso con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante il logout",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-golden text-golden hover:bg-golden hover:text-black">
          <Menu className="w-4 h-4 mr-2" />
          Menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-50" align="end">
        <DropdownMenuLabel className="text-gray-900 font-semibold">Navigazione</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/" className="flex items-center cursor-pointer hover:bg-gray-100 text-gray-700">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/leads" className="flex items-center cursor-pointer hover:bg-gray-100 text-gray-700">
            <Users className="w-4 h-4 mr-2" />
            Leads
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/funnels" className="flex items-center cursor-pointer hover:bg-gray-100 text-gray-700">
            <Zap className="w-4 h-4 mr-2" />
            Funnels
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200" />
        
        <DropdownMenuLabel className="text-gray-900 font-semibold">Account</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="flex items-center cursor-pointer hover:bg-gray-100 text-gray-700">
            <User className="w-4 h-4 mr-2" />
            Area Utente
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center cursor-pointer hover:bg-gray-100 text-red-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdownMenu;
