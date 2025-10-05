-- Migration: Add booking_type to booking table
-- Run this in your Supabase SQL Editor

-- Add booking_type column (양도/조인 구분)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'booking'
        AND column_name = 'booking_type'
    ) THEN
        ALTER TABLE booking ADD COLUMN booking_type TEXT NOT NULL DEFAULT 'JOIN'
        CHECK (booking_type IN ('TRANSFER', 'JOIN'));
    END IF;
END $$;

-- Add comment for clarity
COMMENT ON COLUMN booking.booking_type IS '예약 타입: TRANSFER(양도), JOIN(조인)';
