-- Migration: Create transactions for existing confirmed bookings
-- Run this in your Supabase SQL Editor to populate transaction table with existing bookings

INSERT INTO transaction (
    booking_id,
    tee_time_id,
    course_name,
    total_price,
    prepayment,
    onsite_payment,
    cost,
    commission,
    revenue_type,
    people_count,
    commission_per_person,
    status,
    booking_date,
    play_date,
    settled_at,
    memo,
    created_at,
    updated_at
)
SELECT
    b.id AS booking_id,
    b.tee_time_id,
    t.course_name,
    t.green_fee AS total_price,  -- 티타임의 선입금 총액
    b.payment_amount AS prepayment,  -- 실제 받은 선입금 (가장 중요)
    t.onsite_payment AS onsite_payment,  -- 현장결제 총액 (이미 총액)
    0 AS cost,  -- 원가는 중요하지 않음
    0 AS commission,  -- 마진도 중요하지 않음
    COALESCE(t.revenue_type, 'standard') AS revenue_type,
    b.people_count,
    0 AS commission_per_person,  -- 인당 수익도 중요하지 않음
    CASE
        WHEN b.status = 'CONFIRMED' THEN 'confirmed'
        WHEN b.status = 'CANCELED' THEN 'canceled'
        ELSE 'pending'
    END AS status,
    b.created_at::DATE AS booking_date,
    t.date AS play_date,
    CASE
        WHEN b.status = 'CONFIRMED' AND b.paid_at IS NOT NULL THEN b.paid_at
        ELSE NULL
    END AS settled_at,
    b.memo,
    b.created_at,
    b.updated_at
FROM booking b
INNER JOIN tee_time t ON b.tee_time_id = t.id
WHERE b.status IN ('CONFIRMED', 'CANCELED')
AND NOT EXISTS (
    -- 이미 transaction이 존재하는 booking은 제외
    SELECT 1 FROM transaction WHERE booking_id = b.id
);
