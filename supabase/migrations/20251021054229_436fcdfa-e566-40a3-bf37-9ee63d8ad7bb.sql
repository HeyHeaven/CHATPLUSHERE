-- Create storage bucket for WhatsApp chat files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-files', 'chat-files', false, 52428800, ARRAY['text/plain']);

-- Storage policies (RLS is already enabled on storage.objects)
-- Allow users to upload their own chat files
CREATE POLICY "Users can upload their own chat files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'chat-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own chat files
CREATE POLICY "Users can view their own chat files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'chat-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own chat files
CREATE POLICY "Users can delete their own chat files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'chat-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create table to track uploaded chat files metadata
CREATE TABLE IF NOT EXISTS public.uploaded_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  analysis_status TEXT DEFAULT 'pending',
  analysis_id UUID REFERENCES public.chat_analyses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.uploaded_chats ENABLE ROW LEVEL SECURITY;

-- RLS policies for uploaded_chats
CREATE POLICY "Users can view their own uploaded chats"
ON public.uploaded_chats
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploaded chats"
ON public.uploaded_chats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploaded chats"
ON public.uploaded_chats
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploaded chats"
ON public.uploaded_chats
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_uploaded_chats_updated_at
BEFORE UPDATE ON public.uploaded_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();