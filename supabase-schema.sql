-- ═══════════════════════════════════════════════════════════════════════════
-- JoshFolio — Supabase Database Schema & Storage Setup
-- ───────────────────────────────────────────────────────────────────────────
-- Run this script in your Supabase Project:
-- Supabase Dashboard → SQL Editor → New Query → Paste & Run (Ctrl+Enter)
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Enable UUID Extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY DEFAULT ('proj_' || substring(md5(random()::text) from 1 for 12)),
  title TEXT,
  slug TEXT,
  tagline TEXT,
  category TEXT,
  "categoryLabel" TEXT,
  description TEXT,
  "longDescription" TEXT,
  client TEXT,
  "completionDate" TEXT,
  "projectUrl" TEXT,
  "liveUrl" TEXT,
  "repoUrl" TEXT,
  "coverImage" TEXT,
  "galleryImages" JSONB DEFAULT '[]'::jsonb,
  technologies JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  emoji TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  "order" NUMERIC DEFAULT 0,
  "createdAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  "updatedAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);

-- 3. Services Table
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY DEFAULT ('srv_' || substring(md5(random()::text) from 1 for 12)),
  name TEXT,
  icon TEXT,
  description TEXT,
  price TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  "order" NUMERIC DEFAULT 0,
  "createdAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);

-- 4. Pricing Plans Table
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY DEFAULT ('plan_' || substring(md5(random()::text) from 1 for 12)),
  name TEXT,
  price TEXT,
  "ctaText" TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  popular BOOLEAN DEFAULT false,
  "order" NUMERIC DEFAULT 0,
  "createdAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);

-- 5. Testimonials Table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY DEFAULT ('test_' || substring(md5(random()::text) from 1 for 12)),
  "clientName" TEXT,
  position TEXT,
  company TEXT,
  review TEXT,
  rating NUMERIC DEFAULT 5,
  "profileImage" TEXT,
  "createdAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  "updatedAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);

-- 6. Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog (
  id TEXT PRIMARY KEY DEFAULT ('blog_' || substring(md5(random()::text) from 1 for 12)),
  title TEXT,
  slug TEXT,
  author TEXT DEFAULT 'Idowu Joshua Victor',
  tags JSONB DEFAULT '[]'::jsonb,
  content TEXT,
  "publishDate" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  "featuredImage" TEXT,
  status TEXT DEFAULT 'published',
  "createdAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  "updatedAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);

-- 7. Contact Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY DEFAULT ('msg_' || substring(md5(random()::text) from 1 for 12)),
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  "sentAt" TEXT,
  source TEXT,
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);

-- 8. Global Settings Table (key-value store for about, socials, email, certs)
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  value JSONB,
  bio TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  experience JSONB DEFAULT '[]'::jsonb,
  "resumeUrl" TEXT,
  "profileImage" TEXT,
  github TEXT,
  linkedin TEXT,
  twitter TEXT,
  behance TEXT,
  instagram TEXT,
  email TEXT,
  phone TEXT,
  enabled BOOLEAN DEFAULT false,
  "publicJSKey" TEXT,
  "serviceID" TEXT,
  "templateID" TEXT,
  "autoReplyEnabled" BOOLEAN DEFAULT false,
  "autoReplyTemplateID" TEXT,
  "updatedAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);

-- 9. Hidden GitHub Repositories Table
CREATE TABLE IF NOT EXISTS public.hidden_repos (
  id TEXT PRIMARY KEY,
  "hiddenAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);

-- 10. GitHub Overrides Table
CREATE TABLE IF NOT EXISTS public.github_overrides (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  "coverImage" TEXT,
  "demoUrl" TEXT,
  "liveUrl" TEXT,
  "previewUrl" TEXT,
  featured BOOLEAN DEFAULT false,
  hidden BOOLEAN DEFAULT false,
  "customOrder" NUMERIC DEFAULT 0,
  "updatedAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);

-- 11. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY DEFAULT ('act_' || substring(md5(random()::text) from 1 for 12)),
  action TEXT,
  entity TEXT,
  detail TEXT,
  "userEmail" TEXT,
  timestamp TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);

-- 12. Certifications Table (Dedicated table alongside settings doc)
CREATE TABLE IF NOT EXISTS public.certifications (
  id TEXT PRIMARY KEY DEFAULT ('cert_' || substring(md5(random()::text) from 1 for 12)),
  title TEXT,
  issuer TEXT,
  "issueDate" TEXT,
  "credentialUrl" TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  "imageUrl" TEXT,
  "order" NUMERIC DEFAULT 0,
  "createdAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  "updatedAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);

-- ───────────────────────────────────────────────────────────────────────────
-- Safe Schema Migrations (for pre-existing databases)
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE public.blog ADD COLUMN IF NOT EXISTS "updatedAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS "updatedAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS "updatedAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS "updatedAt" TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "value" JSONB;

-- ───────────────────────────────────────────────────────────────────────────
-- Row Level Security (RLS) Policies
-- ───────────────────────────────────────────────────────────────────────────
-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hidden_repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- Allow Public / Anon full read/write access (Portfolio admin uses anon key + JS auth)
DO $$
DECLARE
  t text;
  tables text[] := ARRAY['projects', 'services', 'plans', 'testimonials', 'blog', 'messages', 'settings', 'hidden_repos', 'github_overrides', 'activity_logs', 'certifications'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public access for %I" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Public access for %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- ───────────────────────────────────────────────────────────────────────────
-- Storage Bucket Setup
-- ───────────────────────────────────────────────────────────────────────────
-- Create the portfolio-media public bucket if storage schema is available
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy to allow public reads and uploads to portfolio-media bucket
DROP POLICY IF EXISTS "Public Access for portfolio-media" ON storage.objects;
CREATE POLICY "Public Access for portfolio-media"
ON storage.objects FOR ALL
USING (bucket_id = 'portfolio-media')
WITH CHECK (bucket_id = 'portfolio-media');
