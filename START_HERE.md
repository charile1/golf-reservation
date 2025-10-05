# 🏌️ Golf Reservation Manager - START HERE

> 골프 예약 대행 관리 시스템 - 완전한 MVP 프로젝트

---

## 🎯 이 프로젝트는 무엇인가요?

부모님의 골프 티타임 예약 대행 비즈니스를 위한 **관리자 전용 웹 애플리케이션**입니다.

### 핵심 기능
✅ 티타임 등록 및 관리
✅ 고객 예약 접수
✅ 입금 확인 및 상태 관리
✅ 캘린더로 예약 현황 한눈에 보기
✅ 자동 상태 업데이트 (예약 인원에 따라)
✅ Toss Payments 연동 (선택사항)

---

## 📚 문서 가이드

### 🚀 처음 시작하시나요?
**[QUICK_START.md](./QUICK_START.md)** ← 여기서 시작!
- 5분 안에 실행 가능
- 단계별 설정 가이드
- 첫 티타임/예약 등록 튜토리얼

### 📖 전체 기능 알아보기
**[README.md](./README.md)**
- 프로젝트 개요
- 기술 스택 상세
- 데이터베이스 스키마
- 배포 방법

### 🔧 고급 설정이 필요하신가요?
**[SETUP.md](./SETUP.md)**
- RLS 정책 커스터마이징
- Toss Payments 연동
- 이메일 알림 설정
- 문제 해결 가이드

### 📁 프로젝트 구조 이해하기
**[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**
- 폴더/파일 구조
- 컴포넌트 역할
- 데이터 흐름
- 주요 함수 위치

---

## ⚡ 빠른 시작 (30초 요약)

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 Supabase URL과 API 키 입력

# 3. 실행!
npm run dev
```

**상세 가이드**: [QUICK_START.md](./QUICK_START.md)

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| **Frontend** | Next.js 14 (App Router), TypeScript, TailwindCSS |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime) |
| **UI** | Shadcn UI, Radix UI |
| **State** | React Query v5 |
| **Calendar** | FullCalendar |
| **Deploy** | Vercel |

---

## 📋 체크리스트

### ✅ 설치 완료했나요?
- [ ] Node.js 18+ 설치
- [ ] 프로젝트 클론/다운로드
- [ ] `npm install` 실행

### ✅ Supabase 설정했나요?
- [ ] Supabase 계정 생성
- [ ] 새 프로젝트 생성
- [ ] `supabase-schema.sql` 실행
- [ ] API 키 복사

### ✅ 환경 변수 설정했나요?
- [ ] `.env.local` 파일 생성
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 설정
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정

### ✅ 관리자 계정 생성했나요?
- [ ] Supabase Authentication에서 사용자 생성
- [ ] "Auto Confirm User" 체크

### ✅ 실행했나요?
- [ ] `npm run dev` 실행
- [ ] http://localhost:3000 접속
- [ ] 로그인 성공

---

## 🎓 학습 경로

### 1단계: 기본 사용법 익히기 (30분)
1. 프로젝트 실행
2. 티타임 등록해보기
3. 예약 접수해보기
4. 입금 확인해보기
5. 캘린더에서 확인하기

### 2단계: 코드 이해하기 (1시간)
1. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) 읽기
2. `src/app/admin/tee-times/page.tsx` 분석
3. `src/components/admin/tee-time-form.tsx` 분석
4. Supabase 클라이언트 코드 이해

### 3단계: 커스터마이징 (2시간)
1. 필드 추가하기 (예: 캐디피)
2. 상태 추가하기
3. UI 색상 변경하기
4. 새 페이지 추가하기

### 4단계: 배포하기 (30분)
1. GitHub에 푸시
2. Vercel 연결
3. 환경 변수 설정
4. 배포!

---

## 💡 주요 파일 빠른 참조

### 자주 수정할 파일들

| 파일 | 용도 | 수정 시기 |
|------|------|-----------|
| `src/types/database.ts` | 타입 정의 | DB 스키마 변경 시 |
| `src/components/admin/tee-time-form.tsx` | 티타임 폼 | 입력 필드 추가 시 |
| `src/components/admin/booking-form.tsx` | 예약 폼 | 입력 필드 추가 시 |
| `src/app/globals.css` | 전역 스타일 | 색상/폰트 변경 시 |
| `tailwind.config.ts` | Tailwind 설정 | 디자인 시스템 변경 시 |

### 자주 보는 파일들

| 파일 | 내용 |
|------|------|
| `supabase-schema.sql` | DB 스키마, 트리거, 샘플 데이터 |
| `src/lib/supabase/client.ts` | Supabase 클라이언트 |
| `src/lib/utils.ts` | 유틸리티 함수 |

---

## 🎨 화면 구성

### 1. 로그인 (`/admin/login`)
- 이메일/비밀번호 입력
- Supabase Auth 사용

### 2. 티타임 관리 (`/admin/tee-times`)
- 티타임 목록 테이블
- 등록/수정/삭제 기능
- 상태별 색상 표시

### 3. 예약 관리 (`/admin/bookings`)
- 예약 목록 테이블
- 입금 확인 버튼 (체크 아이콘)
- 예약자 정보, 티타임 정보 표시

### 4. 캘린더 (`/admin/calendar`)
- FullCalendar 월/주 뷰
- 상태별 색상 코딩
- 이벤트 클릭 시 상세 정보

---

## 🔄 워크플로우 예시

### 시나리오: 2인 예약 접수 → 확정

```
1. 티타임 등록
   날짜: 2025-10-15
   시간: 08:00
   골프장: 오라CC
   그린피: 150,000원
   인원: 4명
   상태: AVAILABLE (회색)

2. 고객 A 예약 (2명)
   상태: PENDING
   → 티타임 상태: JOINING (주황)
   → slots_booked: 2/4

3. 입금 확인
   고객 A 상태: CONFIRMED
   → 티타임 유지: JOINING (주황)
   → slots_booked: 2/4

4. 고객 B 예약 (2명)
   상태: PENDING
   → 티타임 유지: JOINING (주황)
   → slots_booked: 2/4 (아직 미확정)

5. 고객 B 입금 확인
   고객 B 상태: CONFIRMED
   → 티타임 자동 변경: CONFIRMED (초록)
   → slots_booked: 4/4 (모두 확정!)
```

---

## 🚨 자주 묻는 질문 (FAQ)

### Q: 백엔드 서버가 따로 필요한가요?
**A:** 아니요! Supabase가 백엔드 역할을 합니다.

### Q: 모바일에서도 작동하나요?
**A:** 네! 반응형 디자인이 적용되어 있습니다.

### Q: 데이터는 어디에 저장되나요?
**A:** Supabase PostgreSQL에 저장됩니다.

### Q: 실시간 업데이트가 되나요?
**A:** React Query가 자동으로 데이터를 새로고침합니다. Realtime을 원하면 Supabase Realtime 추가 가능.

### Q: 여러 관리자가 사용할 수 있나요?
**A:** 네! Supabase Authentication에서 여러 계정 생성 가능.

### Q: 비용이 드나요?
**A:** Supabase 무료 플랜으로 시작 가능. Vercel도 무료 플랜 제공.

---

## 📞 도움이 필요하신가요?

### 🐛 버그를 발견했어요
GitHub Issues에 등록해주세요.

### 💬 사용법이 궁금해요
1. [QUICK_START.md](./QUICK_START.md) 확인
2. [SETUP.md](./SETUP.md)의 "문제 해결" 섹션 확인
3. Issues에서 검색

### 🎨 커스터마이징하고 싶어요
1. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)에서 파일 위치 확인
2. 해당 파일 수정
3. 저장 후 자동 리로드 확인

---

## 🎉 다음 단계

### 초보자
1. ✅ [QUICK_START.md](./QUICK_START.md) 따라하기
2. ✅ 샘플 데이터로 연습하기
3. ✅ 실제 티타임 등록해보기

### 개발자
1. ✅ [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) 숙지
2. ✅ 코드 구조 분석
3. ✅ 커스터마이징 시작

### 운영자
1. ✅ Vercel에 배포
2. ✅ 프로덕션 데이터 입력
3. ✅ 정기 백업 설정

---

## 📦 프로젝트 구성

```
📁 golf-reservation-mvp/
│
├── 📘 START_HERE.md          ← 지금 보고 있는 파일
├── 🚀 QUICK_START.md         ← 5분 시작 가이드
├── 📖 README.md              ← 프로젝트 개요
├── 🔧 SETUP.md               ← 고급 설정
├── 📁 PROJECT_STRUCTURE.md   ← 구조 설명
│
├── 🗄️ supabase-schema.sql    ← DB 스키마
├── ⚙️ .env.example            ← 환경 변수 예시
│
└── 📂 src/
    ├── app/                  ← 페이지들
    ├── components/           ← 컴포넌트들
    ├── lib/                  ← 유틸리티
    └── types/                ← 타입 정의
```

---

## ✨ 시작하기

### 처음이신가요?
👉 **[QUICK_START.md](./QUICK_START.md)로 이동**

### 개발자이신가요?
👉 **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)로 이동**

### 문제가 있으신가요?
👉 **[SETUP.md](./SETUP.md)의 문제 해결 섹션으로 이동**

---

**환영합니다! 좋은 개발 되세요! ⛳️**
