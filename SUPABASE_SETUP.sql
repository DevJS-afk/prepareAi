-- Run this script in your Supabase SQL Editor

-- 1. Create Tables
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  pronouns text,
  job_title text,
  bio text,
  avatar_url text,
  role text DEFAULT 'user',
  is_admin boolean DEFAULT false,
  subscription_tier text DEFAULT 'free',
  tokens integer DEFAULT 5,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.cvs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  title text,
  content text,
  data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.motivation_letters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  title text,
  job_title text,
  company text,
  content text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.portfolios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  title text,
  content text,
  data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.interviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  config jsonb,
  transcription jsonb,
  feedback jsonb,
  report jsonb,
  status text,
  resources jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.invites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  interviewer_id uuid REFERENCES auth.users ON DELETE CASCADE,
  candidate_id uuid REFERENCES auth.users ON DELETE CASCADE,
  email text,
  token text,
  config jsonb,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.job_offers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id uuid REFERENCES auth.users ON DELETE CASCADE,
  title text,
  company text,
  location text,
  description text,
  salary text,
  "experienceLevel" text,
  "jobType" text,
  url text,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Turn off RLS temporarily so everything works (or you can write strict policies later)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cvs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.motivation_letters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers DISABLE ROW LEVEL SECURITY;

-- 3. Storage Buckets (Run this to create the image storage if needed)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-images', 'portfolio-images', true) ON CONFLICT DO NOTHING;

-- 4. Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars' OR bucket_id = 'portfolio-images');
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' OR bucket_id = 'portfolio-images');
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' OR bucket_id = 'portfolio-images');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' OR bucket_id = 'portfolio-images');
