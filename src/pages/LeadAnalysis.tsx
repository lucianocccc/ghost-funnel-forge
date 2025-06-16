
import React from 'react';
import LeadAnalysisView from '../components/LeadAnalysisView';
import AdminRoute from '@/components/AdminRoute';
import AdminHeader from '@/components/admin/AdminHeader';
import MobileHeader from '@/components/MobileHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const LeadAnalysis = () => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Errore",
        description: "Errore durante il logout",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-black">
        {/* Desktop Header */}
        <div className="hidden md:block p-6 border-b border-gray-800">
          <AdminHeader 
            profileName={profile?.first_name}
            onSignOut={handleSignOut}
          />
        </div>
        
        {/* Mobile Header */}
        <MobileHeader 
          title="Lead Analysis"
          onSignOut={handleSignOut}
          showNotifications={true}
        />
        
        <div className="p-2 md:p-4">
          <div className="max-w-6xl mx-auto">
            <LeadAnalysisView />
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <MobileNavigation />
      </div>
    </AdminRoute>
  );
};

export default LeadAnalysis;
