-- Create smart_funnel_sessions table for tracking intelligent funnel generation
CREATE TABLE public.smart_funnel_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  initial_prompt TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  session_status VARCHAR(20) NOT NULL DEFAULT 'questioning' CHECK (session_status IN ('questioning', 'ready', 'completed', 'abandoned')),
  final_result JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.smart_funnel_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own smart funnel sessions" 
ON public.smart_funnel_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own smart funnel sessions" 
ON public.smart_funnel_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own smart funnel sessions" 
ON public.smart_funnel_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_smart_funnel_sessions_updated_at
BEFORE UPDATE ON public.smart_funnel_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_smart_funnel_sessions_user_id ON public.smart_funnel_sessions(user_id);
CREATE INDEX idx_smart_funnel_sessions_status ON public.smart_funnel_sessions(session_status);
CREATE INDEX idx_smart_funnel_sessions_created_at ON public.smart_funnel_sessions(created_at);