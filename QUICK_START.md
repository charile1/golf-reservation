# ⚡ Quick Start - 5분 안에 시작하기

## 1️⃣ 의존성 설치 (1분)

```bash
cd golf-reservation-mvp
npm install
```

## 2️⃣ Supabase 설정 (2분)

### A. Supabase 프로젝트 생성
1. https://supabase.com 접속 → 회원가입/로그인
2. "New Project" 클릭
3. 정보 입력:
   - Name: `golf-reservation`
   - Database Password: 비밀번호 설정 (저장 필수!)
   - Region: `Northeast Asia (Seoul)`
4. "Create new project" 클릭 (1-2분 소요)

### B. 데이터베이스 스키마 생성
1. 왼쪽 메뉴에서 "SQL Editor" 클릭
2. "New query" 클릭
3. 프로젝트의 `supabase-schema.sql` 파일 열기
4. 전체 내용 복사 → SQL Editor에 붙여넣기
5. "Run" 버튼 클릭 (또는 Cmd/Ctrl + Enter)
6. 성공 메시지 확인

### C. API 키 복사
1. 왼쪽 메뉴에서 "Settings" (⚙️) 클릭
2. "API" 메뉴 클릭
3. 다음 값들을 복사:
   - Project URL
   - `anon` `public` 키

## 3️⃣ 환경 변수 설정 (1분)

```bash
# .env.local 파일 생성
cp .env.example .env.local
```

`.env.local` 파일을 열어서 아래 값 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=여기에_Project_URL_붙여넣기
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_key_붙여넣기
```

예시:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4️⃣ 관리자 계정 생성 (1분)

1. Supabase 대시보드에서 "Authentication" 클릭
2. "Users" 탭 클릭
3. "Add user" → "Create new user" 클릭
4. 정보 입력:
   - Email: 관리자 이메일 (예: admin@gmail.com)
   - Password: 비밀번호 (예: admin123!)
   - ✅ "Auto Confirm User" 체크
5. "Create user" 클릭

## 5️⃣ 실행! 🚀

```bash
npm run dev
```

브라우저에서 http://localhost:3000 열기

로그인 정보:
- Email: 위에서 생성한 이메일
- Password: 위에서 설정한 비밀번호

---

## ✅ 성공했다면 보이는 것들

### 로그인 성공 후:
1. 상단 네비게이션:
   - 티타임 관리
   - 예약 관리
   - 캘린더

2. 첫 화면 (티타임 관리):
   - "티타임 등록" 버튼
   - 샘플 데이터 3개 (schema.sql에 포함)

---

## 🎯 첫 티타임 등록해보기

1. "티타임 등록" 버튼 클릭
2. 정보 입력:
   ```
   날짜: 내일 날짜
   시간: 08:00
   골프장명: 테스트 골프장
   그린피: 150000
   총 인원: 4
   상태: 등록
   ```
3. "저장" 클릭
4. 목록에 새 티타임 표시 확인!

---

## 🎯 첫 예약 등록해보기

1. "예약 관리" 메뉴 클릭
2. "예약 등록" 버튼 클릭
3. 정보 입력:
   ```
   티타임 선택: 방금 등록한 티타임
   예약자명: 홍길동
   연락처: 010-1234-5678
   인원: 2
   상태: 입금대기
   메모: 테스트 예약
   ```
4. "저장" 클릭
5. 목록에 새 예약 표시 확인!

---

## 🎯 입금 확인해보기

1. 예약 목록에서 방금 만든 예약 찾기
2. 초록색 체크(✓) 아이콘 클릭
3. 확인 다이얼로그에서 "확인" 클릭
4. 상태가 "확정"으로 변경 확인!
5. "티타임 관리"로 돌아가서 티타임 상태 확인
   → "조인모집" (2/4명)으로 변경됨!

---

## 🎯 캘린더 확인하기

1. "캘린더" 메뉴 클릭
2. 등록한 티타임이 주황색으로 표시됨 (조인모집 상태)
3. 이벤트 클릭 → 상세 정보 팝업 확인!

---

## 🚨 문제 발생 시

### "Invalid API key" 에러
→ `.env.local` 파일의 Supabase URL과 API 키 확인

### 로그인이 안 돼요
→ Supabase Authentication에서 사용자 생성 확인
→ "Auto Confirm User" 체크 확인

### 데이터가 안 보여요
→ SQL Editor에서 schema 실행 확인
→ 브라우저 콘솔(F12)에서 에러 확인

### 포트 3000이 이미 사용중
```bash
npm run dev -- -p 3001
```

---

## 📚 다음 단계

1. ✅ 기본 사용법 익히기
2. 📖 [README.md](./README.md) 읽기 - 전체 기능 설명
3. 📖 [SETUP.md](./SETUP.md) 읽기 - 고급 설정
4. 🚀 실제 데이터로 테스트하기
5. 🌐 Vercel에 배포하기

---

## 💡 팁

### 빠른 테스트 데이터 생성

SQL Editor에서 실행:

```sql
-- 더 많은 샘플 티타임 생성
INSERT INTO tee_time (date, time, course_name, green_fee, slots_total)
VALUES
  (CURRENT_DATE + 1, '07:00', '테스트CC', 120000, 4),
  (CURRENT_DATE + 1, '09:00', '샘플CC', 150000, 4),
  (CURRENT_DATE + 2, '08:00', '연습CC', 180000, 4);
```

---

**축하합니다! 이제 골프 예약 관리 시스템을 사용할 준비가 되었습니다! ⛳**
