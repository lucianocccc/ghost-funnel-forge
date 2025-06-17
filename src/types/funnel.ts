
import { Database } from '@/integrations/supabase/types';

export type Funnel = Database['public']['Tables']['funnels']['Row'];
export type FunnelTemplate = Database['public']['Tables']['funnel_templates']['Row'];
export type FunnelStep = Database['public']['Tables']['funnel_steps']['Row'];
export type TemplateStep = Database['public']['Tables']['template_steps']['Row'];

export interface FunnelWithSteps extends Funnel {
  funnel_steps: FunnelStep[];
  funnel_templates?: FunnelTemplate | null;
}
