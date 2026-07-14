
# prepareAI

**Powered by DevJs**

## About The Project

prepareAI is an advanced, interactive platform designed to help candidates ace their job interviews and empower recruiters to evaluate talent efficiently. Powered by Google's cutting-edge Gemini API, React, and Supabase, this application provides a realistic, real-time interview experience using your camera and microphone.

Whether you're a junior developer preparing for your first technical screen, a product manager ready for behavioral rounds, or a recruiter looking for a streamlined pre-screening tool, prepareAI adapts to your specific needs. It leverages real-time speech recognition, generative AI responses, and advanced analytics to create an immersive practice environment.

## 🚀 Key Features

### 🎙️ AI-Powered Interview Experience
- **Realistic Voice Interaction**: Converse naturally with an AI interviewer that listens, speaks, and responds in real-time.
- **Dynamic Personas**: Choose from different interviewer styles (Friendly Recruiter, Stern Technical Lead, Curious Hiring Manager).
- **Domain-Specific Scenarios**: Practice for roles in Software Engineering, Product Management, UX Design, Data Science, and more.
- **Adaptive Difficulty**: Select from Junior, Mid-Level, or Senior difficulty tiers to match your career stage.
- **Real-Time Feedback**: Receive instant, actionable feedback on your answers during the interview.

### 📊 Performance Analytics & Reporting
- **Executive Summaries**: Get AI-generated comprehensive reports detailing your performance.
- **Skill Metrics**: Visualize your strengths and areas for improvement with detailed skill meters (Clarity, Pacing, Technical Accuracy).
- **Actionable Advice**: Receive tailored recommendations and curated learning resources to overcome your weaknesses.
- **Job Opportunities**: Explore relevant job openings automatically matched to your role and skill level upon finishing.
- **Multilingual Support**: Translate your interview reports into 15+ languages instantly.

### 🛠️ Career Document Builders
- **CV Builder**: Craft professional, ATS-friendly resumes using AI optimization.
- **Motivation Letter Generator**: Automatically generate personalized cover letters based on your target company and role.
- **Portfolio Builder**: Compile your past projects and skills into a sleek, shareable portfolio.

### 👥 Role-Based Access Control
- **Admin**: Full control over user management, subscription tiers, and system monitoring via an intuitive dashboard.
- **Interviewer / Recruiter**: Access a dedicated unified dashboard to generate unique invite links, deploy customized interview configs to candidates, and review candidate performance reports.
- **Candidate**: Restricted access tailored for users who join via recruiter invite links to complete pre-configured assessments.
- **User**: Standard users who can access free-tier features or upgrade for unlimited sessions.

### 💳 Stripe Payment Integration
- **Flexible Tiers**: Choose between Free, Pro (Unlimited AI sessions, advanced analytics), and Recruiter (Team dashboard, candidate invites).
- **Secure Processing**: Integrated with Stripe Checkout for secure, seamless subscription management.

## 🏗️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, TypeScript
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage, Edge Functions), Node.js/Express (Stripe webhooks and API routes)
- **AI Integration**: Google Gemini API (`@google/genai`), Web Speech API (for STT/TTS)
- **Payments**: Stripe (`stripe`, `@stripe/stripe-js`)

## Database Setup (Required)

To use the profile, history, document saving, admin features, and roles, you must set up the database tables in your Supabase project.

1.  Open your project in the **Supabase Dashboard**.
2.  Go to the **SQL Editor**.
3.  Copy and Run the SQL script below:

### 1. Initial Setup (Run if starting fresh)

```sql
-- 1. Create a table for public profiles with Roles
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  email text, -- Syncs with auth.users for easier admin management
  birthday date, -- Date of birth
  pronouns text,
  avatar_url text,
  is_admin boolean default false, -- Legacy column, synced with role='admin'
  role text default 'user',
  subscription_tier text default 'free',
  subscription_status text default 'active',

  constraint full_name_length check (char_length(full_name) >= 3),
  constraint allowed_roles check (role in ('user', 'admin', 'interviewer', 'candidate')),
  constraint allowed_tiers check (subscription_tier in ('free', 'pro', 'recruiter'))
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- HELPER FUNCTION FOR ADMIN CHECK (Prevents Infinite Recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role = 'admin')
  );
$$;

-- 2. Create Invites Table
CREATE TABLE if not exists invites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  interviewer_id uuid REFERENCES auth.users NOT NULL,
  email text NOT NULL,
  token uuid DEFAULT gen_random_uuid() NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  config jsonb, -- Stores the interview parameters chosen by recruiter
  candidate_id uuid REFERENCES auth.users, -- Links to the user who accepted
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

alter table invites enable row level security;
create policy "Interviewers can manage invites" on invites for all using (auth.uid() = interviewer_id);
-- Allow candidates to view invites by token (for registration check)
create policy "Public can view invites by token" on invites for select using (true);
-- Allow candidates to view/update invites if they own the email (after login)
create policy "Candidates can view own invites by email" on invites for select using ( email = auth.jwt() ->> 'email' );
create policy "Candidates can update invites to accept" on invites for update using ( email = auth.jwt() ->> 'email' );

-- 3. Create a table for interviews
create table if not exists interviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  config jsonb not null,
  transcription jsonb not null,
  feedback jsonb not null,
  report jsonb,
  resources jsonb
);

alter table interviews enable row level security;
create policy "Users can view their own interviews." on interviews for select using ( auth.uid() = user_id );
create policy "Users can insert their own interviews." on interviews for insert with check ( auth.uid() = user_id );

-- NEW POLICY: Allow Recruiters to view results of candidates they invited
create policy "Interviewers can view candidate interviews" on interviews
  for select
  using (
    exists (
      select 1 from invites
      where invites.candidate_id = interviews.user_id
      and invites.interviewer_id = auth.uid()
    )
  );

-- 4. Create Tables for CVs, Letters, Portfolios (Standard)
create table if not exists cvs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text not null,
  data jsonb
);
alter table cvs enable row level security;
create policy "Users can view their own CVs." on cvs for select using ( auth.uid() = user_id );
create policy "Users can insert/update/delete their own CVs." on cvs for all using ( auth.uid() = user_id );

create table if not exists motivation_letters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  job_title text,
  company text,
  content text not null
);
alter table motivation_letters enable row level security;
create policy "Users can view their own letters." on motivation_letters for select using ( auth.uid() = user_id );
create policy "Users can insert/update/delete their own letters." on motivation_letters for all using ( auth.uid() = user_id );

create table if not exists portfolios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text not null,
  data jsonb
);
alter table portfolios enable row level security;
create policy "Users can view their own portfolios." on portfolios for select using ( auth.uid() = user_id );
create policy "Users can insert/update/delete their own portfolios." on portfolios for all using ( auth.uid() = user_id );

-- STORAGE SETUP
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
create policy "Avatar images are publicly accessible." on storage.objects for select using ( bucket_id = 'avatars' );
create policy "Authenticated users can upload avatars." on storage.objects for insert with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );
create policy "Users can update their own avatars." on storage.objects for update using ( bucket_id = 'avatars' and auth.uid() = owner ) with check ( bucket_id = 'avatars' and auth.uid() = owner );

-- PORTFOLIO IMAGES BUCKET
insert into storage.buckets (id, name, public) values ('portfolio-images', 'portfolio-images', true) on conflict (id) do nothing;
create policy "Portfolio images are publicly accessible." on storage.objects for select using ( bucket_id = 'portfolio-images' );
create policy "Authenticated users can upload portfolio images." on storage.objects for insert with check ( bucket_id = 'portfolio-images' and auth.role() = 'authenticated' );
create policy "Users can update their own portfolio images." on storage.objects for update using ( bucket_id = 'portfolio-images' and auth.uid() = owner ) with check ( bucket_id = 'portfolio-images' and auth.uid() = owner );

-- ADMIN POLICIES
create policy "Admins can view all profiles" on profiles for select using ( is_admin() = true );
create policy "Admins can view all interviews" on interviews for select using ( is_admin() = true );
create policy "Admins can view all cvs" on cvs for select using ( is_admin() = true );
create policy "Admins can view all portfolios" on portfolios for select using ( is_admin() = true );
create policy "Admins can view all letters" on motivation_letters for select using ( is_admin() = true );
```

### 3. Sync User Table (Recommended)

To ensure that every user in `auth.users` appears in the Admin Dashboard, create a trigger that automatically creates a profile row on signup. This is critical for data consistency.

Run this script:

```sql
-- 1. Create a function that handles new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  birth_date date;
begin
  -- Safely parse the birthday from metadata if it exists
  begin
    birth_date := (new.raw_user_meta_data ->> 'birthday')::date;
  exception when others then
    birth_date := null;
  end;

  insert into public.profiles (id, email, full_name, birthday, role)
  values (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data ->> 'full_name', 'New User'),
    birth_date,
    'user'
  );
  return new;
end;
$$;

-- 2. Create the trigger on the auth.users table
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Backfill missing profiles (for existing users)
insert into public.profiles (id, email, full_name)
select id, email, COALESCE(raw_user_meta_data ->> 'full_name', 'Existing User')
from auth.users
where id not in (select id from public.profiles);
```

### 2. Fix Database Schema (Run if you see "missing column" errors)

Run this script to add missing columns and enable easier admin management.

```sql
-- Fix Missing Columns in Profiles Table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birthday date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free';

-- Ensure Constraints exist
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS allowed_tiers;
ALTER TABLE profiles ADD CONSTRAINT allowed_tiers CHECK (subscription_tier IN ('free', 'pro', 'recruiter'));
```

## How to Create an Administrator

Since users cannot sign up as Admins directly, you must promote a user (yourself) via SQL.

1.  **Log in** to the app at least once to ensure your profile exists.
2.  Run this SQL in the Supabase SQL Editor:

```sql
-- REPLACE 'your_email@example.com' WITH YOUR ACTUAL EMAIL
UPDATE profiles
SET role = 'admin', is_admin = true
WHERE email = 'your_email@example.com';
```

Once you are an admin, you can go to the **Admin Dashboard** and promote other users using the dropdown menu.

## Vercel Deployment & API Keys (Frontend)

When deploying the frontend to Vercel, you must configure the environment variable for the application to work correctly. Because Vite statically replaces `process.env.API_KEY` at build time, the key MUST be available when Vercel builds the app.

1.  **Go to your Vercel Project Dashboard.**
2.  Navigate to **Settings** > **Environment Variables**.
3.  Add a new variable:
    -   **Key**: `API_KEY`
    -   **Value**: Your Google Gemini API Key (get it from [Google AI Studio](https://aistudio.google.com/app/apikey)).
    -   **Important**: Make sure to check all environments (Production, Preview, Development) so the key is available during the build step.
4.  Click **Save**.
5.  **Redeploy** your application (Go to Deployments -> Redeploy) for the changes to take effect. If you don't redeploy, the build will not pick up the new key.

> **Important:** The application uses `vite.config.ts` to expose this key to the client-side code during the build process. If you change the key, you **MUST** rebuild/redeploy the app.

## Supabase Edge Functions (Backend)

If you are using the Supabase Edge Functions (e.g., for report generation), you need to set the API key in Supabase.

1.  **Go to your Supabase Dashboard.**
2.  Navigate to **Edge Functions**.
3.  Click on **Secrets** (or Manage Secrets).
4.  Add a new secret:
    -   **Name**: `GEMINI_API_KEY`
    -   **Value**: Your Google Gemini API Key.

## Local Development

To run the application locally with the API key:

1.  Create a file named `.env` in the root directory of the project.
2.  Add the following line to the file:
    ```env
    API_KEY=your_actual_api_key_here
    ```
3.  Restart the development server (`npm run dev`).

> **Note:** Do not commit `.env` to version control. It is already in `.gitignore`.

---

Built with passion by DevJs to help you land your dream job.
