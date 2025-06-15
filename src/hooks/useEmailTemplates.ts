
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  category: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SentEmail {
  id: string;
  lead_id: string;
  template_id?: string;
  to_email: string;
  subject: string;
  content: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'opened';
  sent_at?: string;
  error_message?: string;
  resend_id?: string;
  created_at: string;
}

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei template email",
        variant: "destructive",
      });
    }
  };

  const fetchSentEmails = async () => {
    try {
      const { data, error } = await supabase
        .from('sent_emails')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setSentEmails(data || []);
    } catch (error) {
      console.error('Error fetching sent emails:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento delle email inviate",
        variant: "destructive",
      });
    }
  };

  const createTemplate = async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          ...template,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data, ...prev]);
      toast({
        title: "Successo",
        description: "Template email creato",
      });

      return data;
    } catch (error) {
      console.error('Error creating email template:', error);
      toast({
        title: "Errore",
        description: "Errore nella creazione del template",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<EmailTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => prev.map(template => template.id === id ? data : template));
      toast({
        title: "Successo",
        description: "Template aggiornato",
      });

      return data;
    } catch (error) {
      console.error('Error updating email template:', error);
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento del template",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.id !== id));
      toast({
        title: "Successo",
        description: "Template eliminato",
      });
    } catch (error) {
      console.error('Error deleting email template:', error);
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione del template",
        variant: "destructive",
      });
      throw error;
    }
  };

  const sendEmail = async (leadId: string, templateId: string, variables: Record<string, string> = {}) => {
    try {
      // Get template
      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      // Get lead data
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (leadError) throw leadError;

      // Replace variables in template
      let subject = template.subject;
      let content = template.content;

      // Replace standard variables
      const allVariables = {
        nome: leadData.nome || '',
        email: leadData.email || '',
        servizio: leadData.servizio || '',
        ...variables
      };

      Object.entries(allVariables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        subject = subject.replace(regex, value);
        content = content.replace(regex, value);
      });

      // Save to sent_emails table
      const { data, error } = await supabase
        .from('sent_emails')
        .insert({
          lead_id: leadId,
          template_id: templateId,
          to_email: leadData.email,
          subject,
          content,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setSentEmails(prev => [data, ...prev]);
      toast({
        title: "Successo",
        description: `Email programmata per ${leadData.email}`,
      });

      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Errore",
        description: "Errore nell'invio dell'email",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTemplates(), fetchSentEmails()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    templates,
    sentEmails,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    sendEmail,
    refetchTemplates: fetchTemplates,
    refetchSentEmails: fetchSentEmails
  };
};
