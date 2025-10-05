# Golf Reservation Manager - Setup Guide

## 🚀 빠른 시작 가이드

### Step 1: 프로젝트 설치

```bash
cd golf-reservation-mvp
npm install
```

### Step 2: Supabase 프로젝트 설정

1. **Supabase 계정 생성 및 프로젝트 생성**
   - https://supabase.com 접속
   - "New Project" 클릭
   - 프로젝트 이름, 비밀번호 설정
   - 리전 선택 (한국은 "Northeast Asia (Seoul)" 권장)

2. **데이터베이스 스키마 생성**
   - Supabase 대시보드에서 "SQL Editor" 메뉴 클릭
   - "New query" 클릭
   - 프로젝트 루트의 `supabase-schema.sql` 파일 내용 복사
   - 붙여넣기 후 "Run" 클릭

3. **API 키 확인**
   - 대시보드에서 "Settings" > "API" 클릭
   - `Project URL` 복사
   - `anon public` 키 복사
   - (선택사항) `service_role` 키 복사 (Toss 웹훅용)

### Step 3: 환경 변수 설정

1. `.env.example` 파일을 `.env.local`로 복사:

```bash
cp .env.example .env.local
```

2. `.env.local` 파일 수정:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Toss Payments (선택사항)
TOSS_SECRET_KEY=your-toss-secret-key
TOSS_WEBHOOK_SECRET=your-webhook-secret
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: 관리자 계정 생성

1. Supabase 대시보드 > "Authentication" > "Users" 클릭
2. "Add user" > "Create new user" 클릭
3. 이메일과 비밀번호 입력
4. "Auto Confirm User" 체크
5. "Create user" 클릭

### Step 5: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속 후 로그인

---

## 📋 기능별 사용 가이드

### 1. 티타임 관리

**티타임 등록하기:**
1. "티타임 관리" 메뉴 클릭
2. "티타임 등록" 버튼 클릭
3. 정보 입력:
   - 날짜: 라운드 날짜
   - 시간: 티오프 시간
   - 골프장명: 예) 오라컨트리클럽
   - 그린피: 금액 (원)
   - 총 인원: 1-4명 선택
   - 상태: 기본값 "등록" 사용
4. "저장" 클릭

**티타임 수정/삭제:**
- 수정: 연필 아이콘 클릭
- 삭제: 휴지통 아이콘 클릭

### 2. 예약 관리

**예약 접수하기:**
1. "예약 관리" 메뉴 클릭
2. "예약 등록" 버튼 클릭
3. 정보 입력:
   - 티타임 선택: 드롭다운에서 선택
   - 예약자명: 고객 이름
   - 연락처: 전화번호
   - 인원: 예약 인원 수
   - 상태: 기본값 "입금대기" 사용
   - 메모: 특이사항 기록
4. "저장" 클릭

**입금 확인하기:**
1. 예약 목록에서 해당 예약 찾기
2. 체크(✓) 아이콘 클릭
3. 확인 메시지에서 "확인" 클릭
4. 상태가 "확정"으로 변경됨

**자동 상태 업데이트:**
- 예약 확정 시 티타임의 `slots_booked` 자동 증가
- 예약 인원에 따라 티타임 상태 자동 변경:
  - 0명: AVAILABLE (등록)
  - 1-3명: JOINING (조인모집)
  - 4명: CONFIRMED (확정)

### 3. 캘린더

**캘린더 보기:**
1. "캘린더" 메뉴 클릭
2. 월/주 단위 전환 가능
3. 이벤트 클릭 시 상세 정보 팝업

**색상별 상태:**
- 회색: 등록 (예약 없음)
- 주황: 조인모집 (1-3명)
- 초록: 확정 (4명)
- 빨강: 취소

---

## 🔧 고급 설정

### Row Level Security (RLS) 정책 수정

기본적으로 인증된 모든 사용자가 접근 가능합니다.
특정 사용자만 접근하도록 제한하려면:

```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Allow authenticated users full access to tee_time" ON tee_time;
DROP POLICY IF EXISTS "Allow authenticated users full access to booking" ON booking;

-- 특정 이메일만 허용하는 정책 생성
CREATE POLICY "Allow admin users full access to tee_time" ON tee_time
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'admin@example.com');

CREATE POLICY "Allow admin users full access to booking" ON booking
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'admin@example.com');
```

### Toss Payments 연동 (선택사항)

1. **Toss Payments 가입**
   - https://www.tosspayments.com 접속
   - 개발자 센터에서 API 키 발급

2. **환경 변수 설정**
   ```env
   TOSS_SECRET_KEY=test_sk_... (테스트용)
   TOSS_WEBHOOK_SECRET=your-webhook-secret
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **웹훅 URL 등록**
   - Toss 개발자 센터 > 웹훅 설정
   - URL: `https://your-domain.com/api/toss/webhook`
   - 이벤트: `PAYMENT_CONFIRMED`, `PAYMENT_CANCELED` 선택

4. **결제 요청 시 orderId 설정**
   - `orderId`를 예약 ID(`booking.id`)로 설정
   - 웹훅에서 자동으로 예약 상태 업데이트

### 이메일 알림 설정 (선택사항)

Supabase Edge Functions를 사용하여 이메일 알림 구현:

```typescript
// supabase/functions/send-booking-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { bookingId } = await req.json()

  // 이메일 전송 로직
  // Resend, SendGrid 등 사용

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

---

## 🐛 문제 해결

### 로그인이 안 돼요
- Supabase에서 사용자가 생성되었는지 확인
- "Auto Confirm User"가 체크되었는지 확인
- 이메일/비밀번호가 정확한지 확인

### 데이터가 안 보여요
- 브라우저 콘솔에서 에러 확인
- Supabase URL과 API 키가 올바른지 확인
- RLS 정책이 올바르게 설정되었는지 확인

### 티타임 상태가 자동으로 안 바뀌어요
- `supabase-schema.sql`의 트리거가 제대로 생성되었는지 확인
- SQL Editor에서 다음 쿼리 실행:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'update_tee_time_on_booking_change';
  ```

### 빌드 에러
```bash
# 캐시 삭제 후 재설치
rm -rf node_modules .next
npm install
npm run build
```

---

## 📊 데이터베이스 백업

### 정기 백업 설정

Supabase Pro 플랜 이상에서 자동 백업 제공.
무료 플랜에서는 수동 백업:

```bash
# pg_dump 사용 (PostgreSQL 클라이언트 필요)
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

### 데이터 복원

```bash
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

---

## 🚢 프로덕션 배포

### Vercel 배포

1. GitHub에 푸시
2. Vercel 대시보드에서 Import
3. 환경 변수 추가
4. Deploy

### 환경 변수 체크리스트
- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `TOSS_SECRET_KEY` (선택)
- [ ] `TOSS_WEBHOOK_SECRET` (선택)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (Toss 웹훅용)

---

## 📈 성능 최적화

### 1. 데이터베이스 인덱스
스키마에 이미 주요 인덱스가 포함되어 있습니다.

### 2. React Query 캐싱
- 기본 staleTime: 60초
- 수동 refetch 필요 시: `queryClient.invalidateQueries()`

### 3. 이미지 최적화
Next.js Image 컴포넌트 사용 권장

---

## 🔒 보안 체크리스트

- [x] Row Level Security (RLS) 활성화
- [x] 환경 변수로 민감 정보 관리
- [x] HTTPS 사용 (Vercel 자동)
- [x] Supabase Auth로 사용자 인증
- [ ] IP 화이트리스트 설정 (필요 시)
- [ ] Rate limiting 설정 (필요 시)

---

## 📞 지원

문제가 발생하면:
1. 이 문서의 "문제 해결" 섹션 확인
2. GitHub Issues에서 검색
3. 새 이슈 등록

Happy coding! 🎉
