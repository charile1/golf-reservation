# 📁 Project Structure

## 전체 구조 개요

```
golf-reservation-mvp/
├── 📄 Configuration Files
│   ├── package.json              # 프로젝트 의존성
│   ├── tsconfig.json             # TypeScript 설정
│   ├── next.config.js            # Next.js 설정
│   ├── tailwind.config.ts        # Tailwind CSS 설정
│   ├── postcss.config.js         # PostCSS 설정
│   ├── .env.example              # 환경 변수 예시
│   ├── .env.local.example        # 상세 환경 변수 예시
│   └── .gitignore                # Git 무시 파일
│
├── 📚 Documentation
│   ├── README.md                 # 프로젝트 개요
│   ├── SETUP.md                  # 상세 설정 가이드
│   ├── QUICK_START.md            # 5분 빠른 시작
│   └── PROJECT_STRUCTURE.md      # 이 파일
│
├── 🗄️ Database
│   └── supabase-schema.sql       # DB 스키마 및 샘플 데이터
│
├── 🔧 Middleware
│   └── middleware.ts             # Next.js 미들웨어 (Auth)
│
└── 📂 src/
    ├── app/                      # Next.js 14 App Router
    ├── components/               # React 컴포넌트
    ├── lib/                      # 유틸리티 & 설정
    └── types/                    # TypeScript 타입 정의
```

---

## 📂 src/app/ - App Router 구조

```
src/app/
├── layout.tsx                    # 루트 레이아웃
├── page.tsx                      # 홈 (→ /admin/login 리다이렉트)
├── globals.css                   # 전역 스타일
│
├── admin/                        # 관리자 섹션
│   ├── layout.tsx                # 관리자 레이아웃 + Auth 체크
│   │
│   ├── login/
│   │   └── page.tsx              # 로그인 페이지
│   │
│   ├── tee-times/
│   │   └── page.tsx              # 티타임 관리 페이지
│   │
│   ├── bookings/
│   │   └── page.tsx              # 예약 관리 페이지
│   │
│   └── calendar/
│       └── page.tsx              # 캘린더 페이지
│
└── api/                          # API Routes
    └── toss/
        └── webhook/
            └── route.ts          # Toss Payments 웹훅
```

### 페이지별 설명

| 경로 | 파일 | 설명 |
|------|------|------|
| `/` | `app/page.tsx` | 홈 → `/admin/login`으로 리다이렉트 |
| `/admin/login` | `app/admin/login/page.tsx` | 관리자 로그인 (Supabase Auth) |
| `/admin/tee-times` | `app/admin/tee-times/page.tsx` | 티타임 CRUD |
| `/admin/bookings` | `app/admin/bookings/page.tsx` | 예약 관리, 입금 확인 |
| `/admin/calendar` | `app/admin/calendar/page.tsx` | FullCalendar 뷰 |
| `/api/toss/webhook` | `app/api/toss/webhook/route.ts` | Toss 결제 웹훅 |

---

## 📂 src/components/ - 컴포넌트 구조

```
src/components/
├── admin/                        # 관리자 전용 컴포넌트
│   ├── admin-nav.tsx             # 상단 네비게이션
│   │
│   ├── tee-time-form.tsx         # 티타임 등록/수정 폼
│   ├── tee-time-list.tsx         # 티타임 목록 테이블
│   │
│   ├── booking-form.tsx          # 예약 등록/수정 폼
│   ├── booking-list.tsx          # 예약 목록 테이블
│   │
│   └── calendar-view.tsx         # FullCalendar 컴포넌트
│
├── providers/
│   └── query-provider.tsx        # React Query Provider
│
└── ui/                           # Shadcn UI 컴포넌트
    ├── button.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── label.tsx
    ├── select.tsx
    ├── toast.tsx
    ├── toaster.tsx
    └── use-toast.ts
```

### 컴포넌트 역할

#### Admin Components

| 컴포넌트 | 역할 | 사용 위치 |
|----------|------|-----------|
| `admin-nav.tsx` | 상단 네비게이션 바 | 모든 admin 페이지 |
| `tee-time-form.tsx` | 티타임 등록/수정 다이얼로그 | tee-times 페이지 |
| `tee-time-list.tsx` | 티타임 목록 테이블 | tee-times 페이지 |
| `booking-form.tsx` | 예약 등록/수정 다이얼로그 | bookings 페이지 |
| `booking-list.tsx` | 예약 목록 테이블 | bookings 페이지 |
| `calendar-view.tsx` | FullCalendar 렌더링 | calendar 페이지 |

#### UI Components (Shadcn)

재사용 가능한 UI 컴포넌트들 - Radix UI 기반

---

## 📂 src/lib/ - 라이브러리 & 유틸리티

```
src/lib/
├── supabase/
│   ├── client.ts                 # 클라이언트 컴포넌트용
│   ├── server.ts                 # 서버 컴포넌트용
│   └── middleware.ts             # 미들웨어용
│
└── utils.ts                      # 유틸리티 함수
```

### Supabase 클라이언트

| 파일 | 사용 위치 | 설명 |
|------|-----------|------|
| `client.ts` | Client Components | 'use client' 컴포넌트에서 사용 |
| `server.ts` | Server Components | Server Components, API Routes |
| `middleware.ts` | Middleware | 세션 관리, Auth 체크 |

### 유틸리티 함수

```typescript
// src/lib/utils.ts
cn()              // Tailwind 클래스 병합
formatDate()      // 날짜 포맷 (예: 2025년 10월 10일)
formatDateTime()  // 날짜+시간 포맷
formatCurrency()  // 통화 포맷 (예: ₩150,000)
```

---

## 📂 src/types/ - 타입 정의

```
src/types/
└── database.ts                   # DB 타입 정의
```

### 주요 타입

```typescript
// TeeTime 상태
type TeeTimeStatus = 'AVAILABLE' | 'JOINING' | 'CONFIRMED' | 'CANCELED'

// Booking 상태
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED'

// 테이블 타입
interface TeeTime { ... }
interface Booking { ... }
interface BookingWithTeeTime { ... }  // JOIN 결과
```

---

## 🗄️ Database Schema

### Tables

```
tee_time
├── id (uuid, PK)
├── date (date)
├── time (text)
├── course_name (text)
├── green_fee (integer)
├── slots_total (integer)
├── slots_booked (integer)
├── status (text)
├── created_at (timestamp)
└── updated_at (timestamp)

booking
├── id (uuid, PK)
├── tee_time_id (uuid, FK → tee_time)
├── name (text)
├── phone (text)
├── people_count (integer)
├── status (text)
├── paid_at (timestamp)
├── memo (text)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Triggers

1. **update_tee_time_stats()**
   - 예약 변경 시 티타임 상태 자동 업데이트
   - slots_booked 자동 계산
   - 상태 자동 변경 (AVAILABLE → JOINING → CONFIRMED)

2. **update_updated_at_column()**
   - 레코드 수정 시 updated_at 자동 업데이트

---

## 🔄 Data Flow

### 예약 등록 흐름

```
1. User Action
   ↓
2. booking-form.tsx
   ↓
3. useMutation (React Query)
   ↓
4. Supabase Client (client.ts)
   ↓
5. PostgreSQL
   ├── INSERT into booking
   └── TRIGGER: update_tee_time_stats()
       ↓
       UPDATE tee_time
       ├── slots_booked += people_count
       └── status = calculate_status()
   ↓
6. React Query Invalidation
   ↓
7. UI Update (자동 리렌더링)
```

---

## 🎨 Styling System

### TailwindCSS 설정

```typescript
// tailwind.config.ts
- 커스텀 컬러 (CSS 변수 기반)
- 다크 모드 지원
- Shadcn UI 통합
```

### CSS 변수

```css
/* src/app/globals.css */
:root {
  --background: ...
  --foreground: ...
  --primary: ...
  /* ... */
}
```

---

## 🔐 Authentication Flow

```
1. User visits /admin/*
   ↓
2. middleware.ts
   ├── Check session cookie
   └── Refresh if expired
   ↓
3. admin/layout.tsx
   ├── Get current user (server-side)
   └── Redirect if not authenticated
   ↓
4. Page renders with user context
```

---

## 📦 Key Dependencies

### Core
- `next`: 14.1.0 (App Router)
- `react`: 18.2.0
- `typescript`: 5.x

### Backend
- `@supabase/supabase-js`: 2.39.3
- `@supabase/ssr`: 0.1.0

### State Management
- `@tanstack/react-query`: 5.17.19

### UI
- `tailwindcss`: 3.3.0
- `@radix-ui/*`: UI primitives
- `lucide-react`: Icons

### Calendar
- `@fullcalendar/react`: 6.1.10
- `@fullcalendar/daygrid`: 6.1.10
- `@fullcalendar/interaction`: 6.1.10

---

## 🚀 Build & Deploy

### Development
```bash
npm run dev          # localhost:3000
```

### Production
```bash
npm run build        # .next/ 생성
npm run start        # 프로덕션 서버
```

### Vercel Deploy
```bash
vercel               # 자동 배포
```

---

## 📊 File Statistics

- **Total Files**: ~40개
- **TypeScript/TSX**: ~30개
- **Configuration**: ~7개
- **Documentation**: 4개
- **SQL**: 1개

---

## 🔍 Quick Reference

### 파일을 찾을 때

| 찾는 것 | 위치 |
|---------|------|
| 페이지 추가 | `src/app/admin/` |
| 컴포넌트 추가 | `src/components/admin/` |
| UI 컴포넌트 | `src/components/ui/` |
| 타입 정의 | `src/types/database.ts` |
| 유틸 함수 | `src/lib/utils.ts` |
| Supabase 클라이언트 | `src/lib/supabase/` |
| 스타일 변경 | `src/app/globals.css` |
| DB 스키마 | `supabase-schema.sql` |

---

**Happy Coding! ⛳**
