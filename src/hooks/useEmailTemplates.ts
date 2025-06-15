
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EmailTemplate, SentEmail } from '@/types/email';
import { emailTemplateService } from '@/services/emailTemplateService';
import { sentEmailService } from '@/services/sentEmailService';
import { emailSendingService } from '@/services/emailSendingService';

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      const data = await emailTemplateService.fetchTemplates();
      setTemplates(data);
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
      const data = await sentEmailService.fetchSentEmails();
      setSentEmails(data);
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
      const newTemplate = await emailTemplateService.createTemplate(template);
      setTemplates(prev => [newTemplate, ...prev]);
      toast({
        title: "Successo",
        description: "Template email creato",
      });
      return newTemplate;
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
      const updatedTemplate = await emailTemplateService.updateTemplate(id, updates);
      setTemplates(prev => prev.map(template => template.id === id ? updatedTemplate : template));
      toast({
        title: "Successo",
        description: "Template aggiornato",
      });
      return updatedTemplate;
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
      await emailTemplateService.deleteTemplate(id);
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

      const sentEmail = await emailSendingService.sendEmail(leadId, template, variables);
      setSentEmails(prev => [sentEmail, ...prev]);
      
      // Get lead data for toast message
      const { data: leadData } = await supabase.from('leads').select('email').eq('id', leadId).single();
      
      toast({
        title: "Successo",
        description: `Email programmata per ${leadData?.email}`,
      });

      return sentEmail;
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

// Re-export types for backward compatibility
export type { EmailTemplate, SentEmail } from '@/types/email';
