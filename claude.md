# 안전한 동네 (Safe Neighborhood) — FE

동네의 위험 정보(보행 안전, 도로 위험, 시설물, 치안)를 지도/피드 기반으로 신고하고 공유하는 커뮤니티 안전 신고 서비스의 프론트엔드입니다.

> 디자인 출처: Figma "2026hackerthon" 팀 / "Untitled" 파일
> (https://www.figma.com/design/c0znkyxZlydOwCjPFUwPa4/Untitled)

## 기술 스택 / 구조

- Next.js 14 (App Router) + React 18 + TypeScript, Tailwind CSS, Zustand, @ducanh2912/next-pwa
- 라우트: `app/*/page.tsx`(얇은 래퍼) → `src/screens/*` 화면 컴포넌트를 `RequireAuth`로 감쌈.
  인증은 localStorage 기반이라 클라이언트 가드(`RequireAuth`) + `AppBootstrap`(부팅 시 복원) 사용.
- 지도: Kakao Maps SDK (`NEXT_PUBLIC_KAKAO_MAP_KEY` 없으면 데모 플레이스홀더)
- 데이터: `src/api/*` 서비스 계층 + `src/api/mockDb.ts` 인메모리 목업 (localStorage 영속).
  서버 연동 시 `NEXT_PUBLIC_API_BASE_URL` 설정 후 `api/*` 함수 본문만 `http.ts`의 `request()`로 교체
  (시그니처 유지 → 화면/스토어 무수정)
- 폴더: `app/`(라우트) · `src/screens/`(화면) · `components/` · `store/` · `constants/` · `lib/` · `types/` · `mocks/`
- 실행: `npm install && npm run dev` (3000). 상세는 `README.md` 참고.

> 아래는 원본 화면 구조/기능 명세이며, 구현이 이를 따릅니다.

## 화면 구성

### 1. 네비게이션 바 (Nav)

- 토글: 지도뷰 ↔ 피드뷰
- 마이페이지 이동
- 검색
- 위험 신고 (버튼)

### 2. 로그인 / 회원가입

- **로그인**
  - 상단 로고 & 프로젝트명
  - 아이디 / 비밀번호
  - 회원가입 / 게스트 진입
- **회원가입**
  - 상단 로고 & 프로젝트명
  - 아이디 / 비밀번호 / 비밀번호 확인
  - 로그인 / 게스트 진입

### 3. 메인 화면 (지도뷰 ↔ 피드뷰 토글)

- **지도뷰**
  - 현재 위치 표시
  - 위험 마커 표시
  - 카테고리 필터
  - 검색창
- **피드뷰**
  - 정렬: 최신순 / 조회수순 / 공감순
  - 카테고리 필터
  - 검색
  - 이미지 표기
  - 리스트 형태 변경 버튼

### 4. 위험 신고 화면

- 신고 버튼 클릭 → 사진 촬영 / 앨범에서 사진 선택
  - 사진 기반으로 위험 유형(카테고리) / 위치 / 위험도 / 예시 설명을 AI가 기본 제공
- 위험 유형 / 위치 선택 (AI 제안값 수정 가능)
- 위치 확인
- 설명 입력
- 등록 버튼

### 5. 상세 정보 화면

- 사진
- 위험 유형
- 위치
- 설명
- 신고 일시
- 공감 버튼
- 조회수
- 댓글
- 게시물 신고하기

### 6. 마이페이지

- 프로필 이미지 수정
- 아이디 / 비밀번호 변경
- 회원탈퇴
- 로그아웃
- 내 신고 목록
  - 수정 / 삭제
  - 피드뷰는 리스트가 아닌 인스타그램 그리드 형태

## 위험 유형 카테고리 (전 화면 공통)

- 보행 안전
- 도로 위험
- 시설물
- 치안
