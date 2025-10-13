-- 1. 입금 확정된 예약의 선입금 총합
SELECT
  '입금 확정 예약 총합' as 구분,
  SUM(payment_amount) as 총액,
  COUNT(*) as 건수
FROM booking
WHERE status = 'CONFIRMED';

-- 2. 거래내역의 선입금 총합 (취소 제외)
SELECT
  '거래내역 총합' as 구분,
  SUM(prepayment) as 총액,
  COUNT(*) as 건수
FROM transaction
WHERE status != 'canceled';

-- 3. 입금 확정 예약별 상세 내역
SELECT
  b.id,
  b.name as 예약자,
  tt.date as 플레이날짜,
  tt.time as 시간,
  b.payment_amount as 예약선입금,
  t.prepayment as 거래내역선입금,
  CASE
    WHEN t.id IS NULL THEN '거래내역없음'
    WHEN t.status = 'canceled' THEN '취소됨'
    ELSE '정상'
  END as 거래내역상태
FROM booking b
LEFT JOIN tee_time tt ON b.tee_time_id = tt.id
LEFT JOIN transaction t ON t.booking_id = b.id
WHERE b.status = 'CONFIRMED'
ORDER BY tt.date DESC, tt.time;

-- 4. 거래내역은 있는데 예약이 입금대기인 케이스 (오류)
SELECT
  t.id as 거래내역ID,
  b.name as 예약자,
  b.status as 예약상태,
  t.status as 거래내역상태,
  t.prepayment as 선입금
FROM transaction t
JOIN booking b ON t.booking_id = b.id
WHERE b.status = 'PENDING' AND t.status != 'canceled';
