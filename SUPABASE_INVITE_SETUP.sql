-- 1. Database Schema & RLS for Candidate Invitations

-- Create the invites table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.invites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  interviewer_id uuid REFERENCES auth.users ON DELETE CASCADE,
  candidate_id uuid REFERENCES auth.users ON DELETE CASCADE,
  email text,
  token text UNIQUE NOT NULL,
  config jsonb NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Policy: Interviewers can insert and manage their own invites
CREATE POLICY "Interviewers can manage their invites" ON public.invites
  FOR ALL USING (auth.uid() = interviewer_id);

-- Policy: Candidates can view invites assigned to their email
CREATE POLICY "Candidates can view their invites" ON public.invites
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Policy: Candidates can update their invite status (e.g., to accepted/completed)
CREATE POLICY "Candidates can update their invites" ON public.invites
  FOR UPDATE USING (auth.jwt() ->> 'email' = email);
