
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
import { Menu, Plus, BarChart3, Users, Zap, CreditCard, User, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDropdownMenu: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateFunnel = () => {
    navigate('/funnels');
    toast({
      title: "Navigazione",
      description: "Vai alla sezione Funnels per creare un nuovo funnel",
    });
  };

  const handleSubscriptionPlans = () => {
    toast({
      title: "Funzione in Sviluppo",
      description: "La gestione dei piani di abbonamento sarà disponibile presto",
    });
  };

  const handlePersonalInfo = () => {
    toast({
      title: "Funzione in Sviluppo", 
      description: "La gestione delle informazioni personali sarà disponibile presto",
    });
  };

  const handleAccountSettings = () => {
    toast({
      title: "Funzione in Sviluppo",
      description: "Le impostazioni account saranno disponibili presto",
    });
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
        <DropdownMenuLabel className="text-gray-900 font-semibold">Gestione Funnel</DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={handleCreateFunnel}
          className="flex items-center cursor-pointer hover:bg-gray-100 text-gray-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crea Nuovo Funnel
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200" />
        
        <DropdownMenuLabel className="text-gray-900 font-semibold">Navigazione</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/admin" className="flex items-center cursor-pointer hover:bg-gray-100 text-gray-700">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
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
        <DropdownMenuItem 
          onClick={handleSubscriptionPlans}
          className="flex items-center cursor-pointer hover:bg-gray-100 text-gray-700"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Piani di Abbonamento
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handlePersonalInfo}
          className="flex items-center cursor-pointer hover:bg-gray-100 text-gray-700"
        >
          <User className="w-4 h-4 mr-2" />
          Informazioni Personali
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleAccountSettings}
          className="flex items-center cursor-pointer hover:bg-gray-100 text-gray-700"
        >
          <Settings className="w-4 h-4 mr-2" />
          Impostazioni Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminDropdownMenu;
