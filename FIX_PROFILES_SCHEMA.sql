-- Run this script in your Supabase SQL Editor to fix the missing columns error

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
