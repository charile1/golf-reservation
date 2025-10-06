-- Fix: transaction의 onsite_payment를 총액으로 수정
-- 현재는 1인당 금액으로 저장되어 있는데, 총액(인원수 * 1인당)으로 변경

UPDATE transaction t
SET onsite_payment = (
    SELECT tee_time.onsite_payment * t.people_count
    FROM tee_time
    WHERE tee_time.id = t.tee_time_id
)
WHERE t.tee_time_id IS NOT NULL;
