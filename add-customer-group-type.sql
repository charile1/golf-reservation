-- Migration: Add group_type column to customer table
-- Run this in your Supabase SQL Editor

-- Add group_type column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'customer'
        AND column_name = 'group_type'
    ) THEN
        ALTER TABLE customer ADD COLUMN group_type TEXT DEFAULT 'NONE';
    END IF;
END $$;

-- Add check constraint for valid values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.constraint_column_usage
        WHERE table_name = 'customer'
        AND constraint_name = 'customer_group_type_check'
    ) THEN
        ALTER TABLE customer ADD CONSTRAINT customer_group_type_check
        CHECK (group_type IN ('NONE', 'COUPLE', 'SINGLE'));
    END IF;
END $$;

-- Add comment for clarity
COMMENT ON COLUMN customer.group_type IS '고객 그룹 타입 (NONE: 미지정, COUPLE: 부부, SINGLE: 1인 조인)';
