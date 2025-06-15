
import React from 'react';
import AdminRoute from '@/components/AdminRoute';
import { useAdminLeads } from '@/hooks/useAdminLeads';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AdminLoadingState from '@/components/admin/AdminLoadingState';
import AdminDashboard from '@/components/admin/AdminDashboard';

const Admin = () => {
  const { profile, signOut } = useAuth();
  const { 
    leads, 
    loading, 
    filters, 
    setFilters, 
    updateLeadStatus, 
    triggerAnalysis 
  } = useAdminLeads();
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

  if (loading) {
    return (
      <AdminRoute>
        <AdminLoadingState />
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminDashboard
        profileName={profile?.first_name}
        onSignOut={handleSignOut}
        leads={leads}
        filters={filters}
        setFilters={setFilters}
        updateLeadStatus={updateLeadStatus}
        triggerAnalysis={triggerAnalysis}
      />
    </AdminRoute>
  );
};

export default Admin;
