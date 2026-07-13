# 안전한 동네 (Safe Neighborhood) — Frontend

동네의 위험 정보(보행 안전 · 도로 위험 · 시설물 · 치안)를 지도/피드 기반으로
신고하고 공유하는 커뮤니티 안전 서비스의 프론트엔드입니다.

## 기술 스택

- **Next.js 14 (App Router) + React 18 + TypeScript**
- **Zustand** — 전역 상태 (인증 / UI / 신고 작성 draft)
- **Tailwind CSS** — 디자인 토큰 기반 스타일
- **@ducanh2912/next-pwa** — 설치형 모바일 웹(PWA, service worker)
- **Kakao Maps SDK** — 지도뷰 (키 없으면 데모 지도로 폴백)

모바일 웹 우선(mobile-first). 데스크톱에서도 480px 폭 앱 셸로 중앙 정렬됩니다.
대부분 클라이언트 렌더링(`'use client'`)이며, 인증은 localStorage 기반이라
`RequireAuth` 클라이언트 가드로 보호합니다. (PWA는 dev에서 비활성, prod 빌드에서 활성)

## 시작하기

```bash
npm install
cp .env.example .env   # 필요 시 Kakao 키 / API URL 입력
npm run dev            # http://localhost:3000
```

- `npm run build` — 프로덕션 빌드 (타입체크 포함)
- `npm start` — 빌드 결과 실행
- `npm run typecheck` — 타입만 검사

## 환경 변수 (`.env`)

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | Kakao Maps JavaScript 키. 없으면 지도뷰가 데모 플레이스홀더로 동작 |
| `NEXT_PUBLIC_API_BASE_URL` | 백엔드 API base URL. 비어 있으면 목업(in-memory) 데이터 사용 |

## 화면

| 경로 | 화면 |
|------|------|
| `/login`, `/signup` | 로그인 / 회원가입 (게스트 진입 지원) |
| `/` | 메인 — 지도뷰 ↔ 피드뷰 토글, 카테고리 필터, 검색, 정렬 |
| `/report/:id` | 신고 상세 — 사진, 공감, 조회수, 댓글, 게시물 신고 |
| `/report/new` | 위험 신고 1/2 — 사진 촬영/앨범 선택 (AI 분석) |
| `/report/new/details` | 위험 신고 2/2 — 유형·위치·위험도·제목·설명 |
| `/mypage` | 마이페이지 — 프로필, 내 신고(그리드), 설정 |

## 폴더 구조

```
app/            Next App Router (라우트 + layout + manifest)
  layout.tsx    루트 레이아웃 (폰트, PWA 메타, AppBootstrap)
  page.tsx      / (메인)
  login, signup, mypage, report/[id], report/new, report/new/details
src/
  api/          서비스 계층 (auth, reports, ai) — 서버 연동 시 이 폴더만 교체
    http.ts     네트워크 추상화 (USE_MOCK 플래그, fetch 래퍼)
    mockDb.ts   인메모리 목업 DB (localStorage 영속화)
  store/        Zustand 스토어 (auth / ui / draft)
  screens/      화면 컴포넌트 (app/*/page.tsx 가 얇게 감쌈)
  components/   layout · common · main · map · auth + AppBootstrap · RequireAuth
  constants/    카테고리 / 위험도 메타
  lib/          format, image, kakaoMap 유틸
  types/        도메인 타입 (서버 응답과 1:1 매핑 목표)
  mocks/        시드 데이터
```

라우트는 `app/*/page.tsx`(얇은 래퍼)가 `src/screens/*`의 화면 컴포넌트를
`RequireAuth`로 감싸는 구조입니다. 화면 로직·상태·API 계층은 프레임워크와 분리돼 있어
Vite ↔ Next 전환에도 거의 재사용됩니다.

## 서버 연동 방법

현재는 목업으로 동작합니다. 백엔드가 준비되면:

1. `.env`에 `VITE_API_BASE_URL` 설정 → `api/http.ts`의 `USE_MOCK`가 자동으로 false
2. `api/auth.ts`, `api/reports.ts`, `api/ai.ts`의 함수 본문을 `request()` 호출로 교체
   (함수 시그니처는 그대로 유지하도록 설계됨 → 페이지/스토어 수정 불필요)

## 디자인

Figma "2026hackerthon / Untitled" 시안 기반.
색상/타이포/간격은 `tailwind.config.js`의 디자인 토큰으로 관리합니다.
