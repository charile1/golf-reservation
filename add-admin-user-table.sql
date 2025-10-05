-- Migration: Add admin_user table
-- Run this in your Supabase SQL Editor

-- Create admin_user table
CREATE TABLE IF NOT EXISTS admin_user (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy
ALTER TABLE admin_user ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access to admin_user" ON admin_user
  FOR ALL USING (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE TRIGGER update_admin_user_updated_at BEFORE UPDATE ON admin_user
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
