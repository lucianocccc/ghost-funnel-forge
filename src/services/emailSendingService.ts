
import { supabase } from '@/integrations/supabase/client';
import { EmailTemplate, SentEmail } from '@/types/email';
import { sentEmailService } from './sentEmailService';

export const emailSendingService = {
  async sendEmail(
    leadId: string, 
    template: EmailTemplate, 
    variables: Record<string, string> = {}
  ): Promise<SentEmail> {
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

    // Create sent email record
    const sentEmailData = {
      lead_id: leadId,
      template_id: template.id,
      to_email: leadData.email,
      subject,
      content,
      status: 'pending' as const
    };

    return await sentEmailService.createSentEmail(sentEmailData);
  }
};
