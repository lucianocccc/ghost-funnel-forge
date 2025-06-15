
import { supabase } from '@/integrations/supabase/client';
import { SentEmail } from '@/types/email';

export const sentEmailService = {
  async fetchSentEmails(): Promise<SentEmail[]> {
    const { data, error } = await supabase
      .from('sent_emails')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    
    // Transform the data to match our interface
    return (data || []).map(item => ({
      ...item,
      status: item.status as SentEmail['status']
    })) as SentEmail[];
  },

  async createSentEmail(sentEmail: Omit<SentEmail, 'id' | 'created_at'>): Promise<SentEmail> {
    const { data, error } = await supabase
      .from('sent_emails')
      .insert(sentEmail)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      status: data.status as SentEmail['status']
    } as SentEmail;
  }
};
