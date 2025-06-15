
import React from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Menu, Plus, BarChart3, Users, Zap, CreditCard, User, Settings } from 'lucide-react';

const AdminDropdownMenu: React.FC = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-golden text-golden hover:bg-golden hover:text-black">
          <Menu className="w-4 h-4 mr-2" />
          Menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white" align="end">
        <DropdownMenuLabel>Gestione Funnel</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/funnels" className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Crea Nuovo Funnel
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Navigazione</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/leads" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Leads
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/funnels" className="flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Funnels
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Piani di Abbonamento
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            Informazioni Personali
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Impostazioni Account
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminDropdownMenu;
