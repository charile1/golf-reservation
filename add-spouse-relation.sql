-- 고객 테이블에 배우자 관계 컬럼 추가
ALTER TABLE customer
ADD COLUMN IF NOT EXISTS spouse_id UUID REFERENCES customer(id) ON DELETE SET NULL;

-- 배우자 관계 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_customer_spouse_id ON customer(spouse_id);

-- 기존 부부 그룹 고객들 확인
SELECT id, name, phone, group_type
FROM customer
WHERE group_type = 'COUPLE'
ORDER BY created_at;
