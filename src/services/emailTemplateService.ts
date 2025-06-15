
import { supabase } from '@/integrations/supabase/client';
import { EmailTemplate } from '@/types/email';

export const emailTemplateService = {
  async fetchTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the data to match our interface
    return (data || []).map(item => ({
      ...item,
      variables: Array.isArray(item.variables) ? item.variables : ['nome', 'email', 'servizio']
    })) as EmailTemplate[];
  },

  async createTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        ...template,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      variables: Array.isArray(data.variables) ? data.variables : ['nome', 'email', 'servizio']
    } as EmailTemplate;
  },

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      variables: Array.isArray(data.variables) ? data.variables : ['nome', 'email', 'servizio']
    } as EmailTemplate;
  },

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
