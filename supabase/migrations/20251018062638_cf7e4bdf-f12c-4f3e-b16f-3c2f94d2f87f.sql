-- Create chat_analyses table to store analysis sessions
CREATE TABLE public.chat_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_names TEXT[] NOT NULL,
  total_messages INTEGER NOT NULL,
  total_users INTEGER NOT NULL,
  date_range_start TIMESTAMP WITH TIME ZONE NOT NULL,
  date_range_end TIMESTAMP WITH TIME ZONE NOT NULL,
  sentiment_positive DECIMAL(5,2),
  sentiment_neutral DECIMAL(5,2),
  sentiment_negative DECIMAL(5,2),
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create insights table for AI-generated business insights
CREATE TABLE public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.chat_analyses(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  actionable_recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create customer_profiles table for aggregated customer data
CREATE TABLE public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_identifier TEXT NOT NULL,
  total_interactions INTEGER DEFAULT 0,
  last_interaction_date TIMESTAMP WITH TIME ZONE,
  avg_sentiment_score DECIMAL(5,2),
  total_messages_sent INTEGER DEFAULT 0,
  engagement_level TEXT CHECK (engagement_level IN ('low', 'medium', 'high')),
  key_topics TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, customer_identifier)
);

-- Enable RLS
ALTER TABLE public.chat_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_analyses
CREATE POLICY "Users can view their own analyses"
  ON public.chat_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses"
  ON public.chat_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
  ON public.chat_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for insights
CREATE POLICY "Users can view insights for their analyses"
  ON public.insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_analyses
      WHERE chat_analyses.id = insights.analysis_id
      AND chat_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create insights for their analyses"
  ON public.insights FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_analyses
      WHERE chat_analyses.id = insights.analysis_id
      AND chat_analyses.user_id = auth.uid()
    )
  );

-- RLS Policies for customer_profiles
CREATE POLICY "Users can view their own customer profiles"
  ON public.customer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own customer profiles"
  ON public.customer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer profiles"
  ON public.customer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for customer_profiles
CREATE TRIGGER update_customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_chat_analyses_user_id ON public.chat_analyses(user_id);
CREATE INDEX idx_chat_analyses_created_at ON public.chat_analyses(created_at DESC);
CREATE INDEX idx_insights_analysis_id ON public.insights(analysis_id);
CREATE INDEX idx_customer_profiles_user_id ON public.customer_profiles(user_id);
CREATE INDEX idx_customer_profiles_customer_identifier ON public.customer_profiles(customer_identifier);