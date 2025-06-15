
export interface AdminLead {
  id: string;
  nome: string;
  email: string;
  servizio: string;
  bio: string;
  status: 'nuovo' | 'contattato' | 'in_trattativa' | 'chiuso_vinto' | 'chiuso_perso';
  gpt_analysis: any;
  analyzed_at: string | null;
  created_at: string;
}

export interface LeadFilters {
  status?: 'nuovo' | 'contattato' | 'in_trattativa' | 'chiuso_vinto' | 'chiuso_perso' | 'all';
  searchQuery?: string;
  hasAnalysis?: boolean;
}
