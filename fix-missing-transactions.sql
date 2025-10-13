-- 거래내역이 없는 입금 확정 예약 찾기
SELECT
  b.id as booking_id,
  b.name as 예약자,
  tt.date as 플레이날짜,
  tt.course_name as 골프장,
  b.payment_amount as 선입금,
  b.people_count as 인원
FROM booking b
JOIN tee_time tt ON b.tee_time_id = tt.id
LEFT JOIN transaction t ON t.booking_id = b.id
WHERE b.status = 'CONFIRMED'
  AND t.id IS NULL
ORDER BY tt.date;

-- 위 결과가 있다면, 아래 쿼리로 거래내역 생성
-- (실행 전에 위 쿼리 결과를 확인하세요)

/*
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
  memo
)
SELECT
  b.id,
  b.tee_time_id,
  tt.course_name,
  tt.green_fee,
  b.payment_amount,
  tt.onsite_payment,
  0,
  0,
  tt.revenue_type,
  b.people_count,
  0,
  'confirmed',
  CURRENT_DATE,
  tt.date,
  '자동 생성됨'
FROM booking b
JOIN tee_time tt ON b.tee_time_id = tt.id
LEFT JOIN transaction t ON t.booking_id = b.id
WHERE b.status = 'CONFIRMED'
  AND t.id IS NULL;
*/
