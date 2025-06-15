
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
