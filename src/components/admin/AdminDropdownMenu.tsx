
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
import { Menu, Plus, BarChart3, Users, Zap, CreditCard, User, Settings, LogOut, Target, TestTube, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminDropdownMenuProps {
  onSignOut: () => Promise<void>;
  onOpenScoringSettings?: () => void;
  onOpenTestPanel?: () => void;
}

const AdminDropdownMenu: React.FC<AdminDropdownMenuProps> = ({ 
  onSignOut, 
  onOpenScoringSettings,
  onOpenTestPanel 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateFunnel = () => {
    navigate('/funnels');
    toast({
      title: "Navigazione",
      description: "Vai alla sezione Funnels per creare un nuovo funnel",
    });
  };

  const handleScoringSettings = () => {
    if (onOpenScoringSettings) {
      onOpenScoringSettings();
    } else {
      toast({
        title: "Impostazioni Scoring",
        description: "Apertura pannello impostazioni scoring AI",
      });
    }
  };

  const handleTestPanel = () => {
    if (onOpenTestPanel) {
      onOpenTestPanel();
    } else {
      toast({
        title: "Test AI/Email",
        description: "Apertura pannello test AI ed email",
      });
    }
  };

  const handleChatBot = () => {
    navigate('/admin/chatbot');
    toast({
      title: "ChatBot AI",
      description: "Apertura assistente AI personalizzato",
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
        <Button variant="ghost" className="text-golden hover:bg-transparent hover:text-golden border-0">
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
        
        <DropdownMenuLabel className="text-gray-900 font-semibold">Strumenti AI</DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={handleChatBot}
          className="flex items-center cursor-pointer hover:bg-gray-100 text-gray-700"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          ChatBot AI
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleScoringSettings}
          className="flex items-center cursor-pointer hover:bg-gray-100 text-gray-700"
        >
          <Target className="w-4 h-4 mr-2" />
          Impostazioni Scoring
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleTestPanel}
          className="flex items-center cursor-pointer hover:bg-gray-100 text-gray-700"
        >
          <TestTube className="w-4 h-4 mr-2" />
          Test AI/Email
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

export default AdminDropdownMenu;
