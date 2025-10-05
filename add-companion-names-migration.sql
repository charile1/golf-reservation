-- Migration: Add missing columns
-- Run this in your Supabase SQL Editor

-- Add companion_names column to booking table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'booking'
        AND column_name = 'companion_names'
    ) THEN
        ALTER TABLE booking ADD COLUMN companion_names TEXT[];
    END IF;
END $$;

-- Add onsite_payment column to tee_time table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'tee_time'
        AND column_name = 'onsite_payment'
    ) THEN
        ALTER TABLE tee_time ADD COLUMN onsite_payment INTEGER DEFAULT 0;
    END IF;
END $$;
