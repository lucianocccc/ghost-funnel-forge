
// Re-export from focused services for backward compatibility
export { fetchFunnelsWithDetails as fetchFunnels, fetchFunnelById } from './funnelQueryService';
export { updateFunnelStatus as updateFunnelStatusInDb, updateFunnelDetails, deleteFunnel } from './funnelMutationService';
