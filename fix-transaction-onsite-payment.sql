-- Fix: transaction 금액을 티타임 금액과 동일하게 수정
-- 티타임의 선입금/현장결제는 이미 총액이므로 그대로 가져옴

UPDATE transaction t
SET
    total_price = (SELECT tee_time.green_fee FROM tee_time WHERE tee_time.id = t.tee_time_id),
    onsite_payment = (SELECT tee_time.onsite_payment FROM tee_time WHERE tee_time.id = t.tee_time_id),
    updated_at = NOW()
WHERE t.tee_time_id IS NOT NULL;
