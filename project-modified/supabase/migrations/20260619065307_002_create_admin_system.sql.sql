/*
# Create Admin System

1. New Tables
- `profiles`: Links authenticated users to application-level roles
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users, unique)
  - `email` (text, NOT NULL)
  - `is_admin` (boolean, default false)
  - `created_at` (timestamptz)

2. Security Changes
- Enable RLS on `profiles`
- Authenticated users can read their own profile
- Admins can read all profiles (for user management)
- Users can update their own profile
- Update `packages` and `tracking_events` policies to allow admin full access

3. Admin Access
- Policies check `is_admin = true` in profiles table for admin operations
- Admins have full CRUD on packages and tracking_events
- Regular users have no direct database access (all operations go through admin)

4. Notes
- Email confirmation is disabled by default in Supabase auth
- First admin can be created by setting is_admin = true directly in database
- Admin dashboard will use authenticated session to manage packages
*/

-- Create profiles table for user roles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Update policies for packages table to allow admin access
DROP POLICY IF EXISTS "anon_select_packages" ON packages;
CREATE POLICY "anon_select_packages" ON packages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert packages" ON packages;
CREATE POLICY "Admins can insert packages" ON packages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "Admins can update packages" ON packages;
CREATE POLICY "Admins can update packages" ON packages FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "Admins can delete packages" ON packages;
CREATE POLICY "Admins can delete packages" ON packages FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

-- Update policies for tracking_events table to allow admin access
DROP POLICY IF EXISTS "anon_select_tracking_events" ON tracking_events;
CREATE POLICY "anon_select_tracking_events" ON tracking_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert tracking_events" ON tracking_events;
CREATE POLICY "Admins can insert tracking_events" ON tracking_events FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "Admins can update tracking_events" ON tracking_events;
CREATE POLICY "Admins can update tracking_events" ON tracking_events FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "Admins can delete tracking_events" ON tracking_events;
CREATE POLICY "Admins can delete tracking_events" ON tracking_events FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
