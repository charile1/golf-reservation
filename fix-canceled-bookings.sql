-- 취소된 예약인데 거래내역이 활성화된 케이스 찾기
SELECT
  t.id as 거래내역ID,
  b.name as 예약자,
  b.status as 예약상태,
  t.status as 거래내역상태,
  t.prepayment as 선입금
FROM transaction t
JOIN booking b ON t.booking_id = b.id
WHERE b.status = 'CANCELED'
  AND t.status != 'canceled';

-- 위 결과가 있다면, 아래 쿼리로 거래내역 취소 처리
UPDATE transaction t
SET status = 'canceled'
FROM booking b
WHERE t.booking_id = b.id
  AND b.status = 'CANCELED'
  AND t.status != 'canceled';
