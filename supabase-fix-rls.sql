-- Quick Fix: Update RLS Policies for Demo Mode
-- Run this in your Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can manage their own resumes" ON resumes;

-- Create permissive policies for demo (ALLOWS ALL OPERATIONS)
-- Replace these with proper auth-based policies in production!

CREATE POLICY "Allow all profile access for demo"
  ON user_profiles FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all resume access for demo"
  ON resumes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Note: For production, you should:
-- 1. Set up Supabase Auth
-- 2. Replace policies with: USING (auth.uid()::text = user_id)
