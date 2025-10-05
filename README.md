# Golf Reservation Manager MVP

골프 예약 대행을 위한 B2B 관리자용 웹 애플리케이션입니다.

## 📋 주요 기능

- 🏌️ **티타임 관리**: 골프장 티타임 등록, 수정, 삭제
- 📝 **예약 관리**: 고객 예약 등록 및 상태 관리
- 💰 **입금 확인**: 예약 상태 변경 및 입금 확인
- 📅 **캘린더 뷰**: 예약 현황을 한눈에 확인
- 🔔 **자동 상태 업데이트**: 예약 인원에 따른 티타임 상태 자동 변경

## 🛠 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: TailwindCSS, Shadcn UI
- **State Management**: React Query v5
- **Calendar**: FullCalendar
- **Payment**: Toss Payments (optional)
- **Deployment**: Vercel

## 📦 설치 및 실행

### 1. 프로젝트 클론

```bash
cd golf-reservation-mvp
```

### 2. 의존성 설치

```bash
npm install
# or
yarn install
```

### 3. 환경 변수 설정

`.env.example`을 `.env.local`로 복사하고 값을 설정하세요:

```bash
cp .env.example .env.local
```

`.env.local` 파일 내용:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Toss Payments (Optional)
TOSS_SECRET_KEY=your-toss-secret-key
TOSS_WEBHOOK_SECRET=your-webhook-secret
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase-schema.sql` 파일의 내용 실행
3. Supabase 프로젝트 설정에서 URL과 anon key 복사하여 `.env.local`에 추가

### 5. 관리자 계정 생성

Supabase Dashboard > Authentication에서 관리자 계정을 생성하세요.

### 6. 개발 서버 실행

```bash
npm run dev
# or
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
golf-reservation-mvp/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/          # 로그인 페이지
│   │   │   ├── tee-times/      # 티타임 관리
│   │   │   ├── bookings/       # 예약 관리
│   │   │   ├── calendar/       # 캘린더 뷰
│   │   │   └── layout.tsx      # 관리자 레이아웃
│   │   ├── api/
│   │   │   └── toss/
│   │   │       └── webhook/    # Toss 웹훅 엔드포인트
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── admin/              # 관리자 컴포넌트
│   │   │   ├── admin-nav.tsx
│   │   │   ├── tee-time-form.tsx
│   │   │   ├── tee-time-list.tsx
│   │   │   ├── booking-form.tsx
│   │   │   ├── booking-list.tsx
│   │   │   └── calendar-view.tsx
│   │   ├── providers/
│   │   │   └── query-provider.tsx
│   │   └── ui/                 # Shadcn UI 컴포넌트
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # 클라이언트 Supabase
│   │   │   ├── server.ts       # 서버 Supabase
│   │   │   └── middleware.ts   # 미들웨어
│   │   └── utils.ts
│   └── types/
│       └── database.ts          # TypeScript 타입 정의
├── supabase-schema.sql          # 데이터베이스 스키마
├── middleware.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🗄 데이터베이스 스키마

### tee_time (티타임 테이블)

| Column       | Type      | Description       |
| ------------ | --------- | ----------------- |
| id           | uuid      | Primary Key       |
| date         | date      | 날짜              |
| time         | text      | 시간              |
| course_name  | text      | 골프장명          |
| green_fee    | integer   | 그린피            |
| slots_total  | integer   | 총 인원           |
| slots_booked | integer   | 예약 인원         |
| status       | text      | 상태              |
| created_at   | timestamp | 생성일            |
| updated_at   | timestamp | 수정일            |

### booking (예약 테이블)

| Column       | Type      | Description       |
| ------------ | --------- | ----------------- |
| id           | uuid      | Primary Key       |
| tee_time_id  | uuid      | Foreign Key       |
| name         | text      | 예약자명          |
| phone        | text      | 연락처            |
| people_count | integer   | 인원              |
| status       | text      | 상태              |
| paid_at      | timestamp | 입금일            |
| memo         | text      | 메모              |
| created_at   | timestamp | 생성일            |
| updated_at   | timestamp | 수정일            |

## 🔄 상태 흐름

### TeeTime 상태

- `AVAILABLE`: 티 등록 (예약 없음)
- `JOINING`: 조인 모집 중 (1-3명 예약)
- `CONFIRMED`: 예약 확정 (4명 확정)
- `CANCELED`: 취소됨

### Booking 상태

- `PENDING`: 입금 대기
- `CONFIRMED`: 입금 확인 완료
- `CANCELED`: 예약 취소

## 🎨 캘린더 색상 규칙

- `AVAILABLE` (등록): 회색
- `JOINING` (조인모집): 주황색
- `CONFIRMED` (확정): 초록색
- `CANCELED` (취소): 빨간색

## 🚀 배포

### Vercel 배포

1. GitHub 리포지토리에 푸시
2. Vercel에서 새 프로젝트 생성
3. 환경 변수 설정
4. 배포

```bash
# 또는 Vercel CLI 사용
npm install -g vercel
vercel
```

## 🔐 보안

- Row Level Security (RLS) 활성화됨
- 인증된 사용자만 접근 가능
- 환경 변수로 민감 정보 관리

## 📝 사용 예시

### 1. 티타임 등록
1. "티타임 관리" 페이지에서 "티타임 등록" 클릭
2. 날짜, 시간, 골프장명, 그린피 입력
3. 저장

### 2. 예약 접수
1. "예약 관리" 페이지에서 "예약 등록" 클릭
2. 티타임 선택, 예약자 정보 입력
3. 상태: PENDING (입금 대기)

### 3. 입금 확인
1. 예약 목록에서 체크 아이콘 클릭
2. 상태가 CONFIRMED로 변경
3. 티타임의 slots_booked 자동 증가

### 4. 캘린더 확인
1. "캘린더" 페이지에서 전체 예약 현황 확인
2. 이벤트 클릭 시 상세 정보 표시

## 🔧 커스터마이징

- `src/components/ui/`: UI 컴포넌트 스타일 수정
- `src/app/globals.css`: 전역 스타일 변경
- `tailwind.config.ts`: Tailwind 설정 변경

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

## 📄 라이선스

MIT License
