
import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import UserDropdownMenu from '@/components/user/UserDropdownMenu';

interface MobileHeaderProps {
  title: string;
  onSignOut: () => Promise<void>;
  showNotifications?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  title, 
  onSignOut, 
  showNotifications = false 
}) => {
  return (
    <header className="bg-gray-900 border-b border-gray-700 p-4 md:hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white truncate">{title}</h1>
        
        <div className="flex items-center gap-2">
          {showNotifications && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-white p-2"
            >
              <Bell className="w-5 h-5" />
            </Button>
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-golden hover:bg-transparent hover:text-golden p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-900 border-gray-700">
              <SheetHeader>
                <SheetTitle className="text-white">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <UserDropdownMenu onSignOut={onSignOut} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
