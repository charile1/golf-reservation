-- Migration: Create transaction table for revenue management
-- Run this in your Supabase SQL Editor

-- 1. Add revenue_type and cost_price to tee_time table
ALTER TABLE tee_time ADD COLUMN IF NOT EXISTS revenue_type TEXT DEFAULT 'standard';
ALTER TABLE tee_time ADD COLUMN IF NOT EXISTS cost_price INTEGER DEFAULT 0;

-- Add constraint for revenue_type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.constraint_column_usage
        WHERE table_name = 'tee_time'
        AND constraint_name = 'tee_time_revenue_type_check'
    ) THEN
        ALTER TABLE tee_time ADD CONSTRAINT tee_time_revenue_type_check
        CHECK (revenue_type IN ('standard', 'package', 'buyout'));
    END IF;
END $$;

-- Add comments
COMMENT ON COLUMN tee_time.revenue_type IS '수익 모델 타입 (standard: 일반, package: 패키지, buyout: 선매입)';
COMMENT ON COLUMN tee_time.cost_price IS '티타임 원가 (원)';

-- 2. Create transaction table
CREATE TABLE IF NOT EXISTS transaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES booking(id) ON DELETE CASCADE,
    tee_time_id UUID REFERENCES tee_time(id) ON DELETE SET NULL,
    course_name TEXT NOT NULL,

    -- 금액 정보
    total_price INTEGER NOT NULL DEFAULT 0,
    prepayment INTEGER NOT NULL DEFAULT 0,
    onsite_payment INTEGER NOT NULL DEFAULT 0,
    cost INTEGER NOT NULL DEFAULT 0,
    commission INTEGER NOT NULL DEFAULT 0,

    -- 메타 정보
    revenue_type TEXT NOT NULL DEFAULT 'standard',
    people_count INTEGER NOT NULL DEFAULT 1,
    commission_per_person INTEGER NOT NULL DEFAULT 0,

    -- 상태 및 날짜
    status TEXT NOT NULL DEFAULT 'pending',
    booking_date DATE NOT NULL,
    play_date DATE NOT NULL,
    settled_at TIMESTAMPTZ,
    memo TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT transaction_revenue_type_check CHECK (revenue_type IN ('standard', 'package', 'buyout')),
    CONSTRAINT transaction_status_check CHECK (status IN ('pending', 'confirmed', 'canceled', 'settled'))
);

-- Add comments
COMMENT ON TABLE transaction IS '거래 및 수익 관리 테이블';
COMMENT ON COLUMN transaction.booking_id IS '예약 ID';
COMMENT ON COLUMN transaction.tee_time_id IS '티타임 ID';
COMMENT ON COLUMN transaction.total_price IS '고객 총 결제 금액';
COMMENT ON COLUMN transaction.prepayment IS '선입금 (우리가 받은 금액)';
COMMENT ON COLUMN transaction.onsite_payment IS '현장결제 (골프장이 받는 금액)';
COMMENT ON COLUMN transaction.cost IS '원가 (우리가 지불하는 금액)';
COMMENT ON COLUMN transaction.commission IS '수익 (마진)';
COMMENT ON COLUMN transaction.revenue_type IS '수익 모델 타입';
COMMENT ON COLUMN transaction.people_count IS '인원수';
COMMENT ON COLUMN transaction.commission_per_person IS '인당 수익';
COMMENT ON COLUMN transaction.status IS '정산 상태 (pending: 대기, confirmed: 확정, canceled: 취소, settled: 정산완료)';
COMMENT ON COLUMN transaction.booking_date IS '예약한 날짜';
COMMENT ON COLUMN transaction.play_date IS '실제 플레이 날짜';
COMMENT ON COLUMN transaction.settled_at IS '정산 완료 일자';
COMMENT ON COLUMN transaction.memo IS '메모 (수동 조정 사유 등)';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transaction_booking_id ON transaction(booking_id);
CREATE INDEX IF NOT EXISTS idx_transaction_tee_time_id ON transaction(tee_time_id);
CREATE INDEX IF NOT EXISTS idx_transaction_status ON transaction(status);
CREATE INDEX IF NOT EXISTS idx_transaction_booking_date ON transaction(booking_date);
CREATE INDEX IF NOT EXISTS idx_transaction_play_date ON transaction(play_date);
CREATE INDEX IF NOT EXISTS idx_transaction_revenue_type ON transaction(revenue_type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_transaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_updated_at
    BEFORE UPDATE ON transaction
    FOR EACH ROW
    EXECUTE FUNCTION update_transaction_updated_at();
