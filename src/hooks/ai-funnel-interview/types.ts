
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface FunnelStepData {
  title: string;
  description: string;
  step_type: string;
  is_required: boolean;
  step_order: number;
  form_fields: Array<{
    id: string;
    type: string;
    label: string;
    placeholder: string;
    required: boolean;
  }>;
  settings: {
    showProgressBar: boolean;
    allowBack: boolean;
    submitButtonText: string;
    backgroundColor: string;
    textColor: string;
  };
}

export interface ParsedFunnelData {
  name: string;
  description: string;
  target_audience: string;
  industry: string;
  strategy: string;
  steps: FunnelStepData[];
}
