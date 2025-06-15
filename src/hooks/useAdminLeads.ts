
import { useLeadsData } from './useLeadsData';
import { useLeadActions } from './useLeadActions';

export type { AdminLead, LeadFilters } from './useLeadTypes';

export const useAdminLeads = () => {
  const {
    leads,
    setLeads,
    loading,
    filters,
    setFilters,
    refetchLeads
  } = useLeadsData();

  const {
    updateLeadStatus,
    triggerAnalysis
  } = useLeadActions(setLeads);

  return {
    leads,
    loading,
    filters,
    setFilters,
    updateLeadStatus,
    triggerAnalysis,
    refetchLeads
  };
};
