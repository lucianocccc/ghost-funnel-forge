
import { supabase } from '@/integrations/supabase/client';
import { EmailTemplate, SentEmail } from '@/types/email';

export const emailSendingService = {
  async sendEmail(
    leadId: string, 
    template: EmailTemplate, 
    variables: Record<string, string> = {}
  ): Promise<SentEmail> {
    // Get lead data for the email
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('email, nome')
      .eq('id', leadId)
      .single();

    if (leadError || !leadData) throw new Error('Lead not found');

    // Replace variables in template content and subject
    let processedSubject = template.subject;
    let processedContent = template.content;

    // Default variables
    const allVariables = {
      nome: leadData.nome || '',
      email: leadData.email || '',
      ...variables
    };

    // Replace variables in subject and content
    Object.entries(allVariables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value);
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
    });

    // Create sent email record
    const sentEmailData = {
      lead_id: leadId,
      template_id: template.id,
      to_email: leadData.email,
      subject: processedSubject,
      content: processedContent,
      status: 'pending' as const
    };

    const { data, error } = await supabase
      .from('sent_emails')
      .insert(sentEmailData)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      status: data.status as SentEmail['status']
    } as SentEmail;
  },

  async sendTestEmail(
    testEmail: string,
    template: EmailTemplate,
    variables: Record<string, string> = {}
  ): Promise<SentEmail> {
    // Replace variables in template content and subject
    let processedSubject = template.subject;
    let processedContent = template.content;

    // Replace variables in subject and content
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value);
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
    });

    // Create sent email record for test
    const sentEmailData = {
      lead_id: '00000000-0000-0000-0000-000000000000', // Fake UUID for test emails
      template_id: template.id,
      to_email: testEmail,
      subject: `[TEST] ${processedSubject}`,
      content: processedContent,
      status: 'sent' as const // Mark as sent for test purposes
    };

    const { data, error } = await supabase
      .from('sent_emails')
      .insert(sentEmailData)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      status: data.status as SentEmail['status']
    } as SentEmail;
  }
};
