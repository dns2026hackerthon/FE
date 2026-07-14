# API 명세

이 문서는 FE(`src/api/*.ts`)가 실서버 모드(`NEXT_PUBLIC_API_BASE_URL` 설정 시)에서
호출하는 REST API의 계약입니다. 백엔드는 이 명세대로 구현하면 FE 코드 수정 없이
연동됩니다. (목업 구현: `src/api/mockDb.ts` — 참고용으로 동일 로직이 들어 있습니다.)

## 공통

- Base URL: `NEXT_PUBLIC_API_BASE_URL` (예: `https://api.example.com`)
- 인증: 로그인/회원가입/게스트 응답의 `token`을 이후 모든 요청에
  `Authorization: Bearer <token>` 헤더로 첨부합니다. (`authed`로 표시된 엔드포인트는 필수)
- 요청 바디: JSON (`Content-Type: application/json`), 이미지 업로드는
  `multipart/form-data`
- 성공 응답: 아래 명시된 JSON 바디, 또는 `204 No Content`
- 실패 응답: HTTP 상태 코드 + `{ "message": string }`. FE는 이 `message`를
  그대로 사용자에게 노출합니다.
- 날짜: ISO 8601 문자열 (`createdAt` 등)

## 공통 타입

```ts
type CategoryId = 'walk' | 'road' | 'facility' | 'safety';
// 보행 안전 | 도로 위험 | 시설물 | 치안

type RiskLevel = number; // 1~10 정수 (낮음 1~3 / 보통 4~7 / 높음 8~10)

interface GeoPoint {
  lat: number;
  lng: number;
}

interface User {
  id: string;
  username: string;
  nickname: string;
  profileImage?: string | null; // URL
  isGuest?: boolean;
}

interface Report {
  id: string;
  category: CategoryId;
  hazardType: string; // 침수/빙판길/도로 파손/싱크홀/누전/쓰러진 나무/낙하물/화재/기타(직접입력)
  risk: RiskLevel;
  title: string;
  description: string;
  address: string;
  location: GeoPoint;
  imageUrl?: string | null; // 업로드된 이미지 URL
  authorId: string;
  authorNickname: string;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  likedByMe: boolean; // 요청자 기준 좋아요 여부
  commentCount: number;
}

interface Comment {
  id: string;
  reportId: string;
  authorNickname: string;
  content: string;
  createdAt: string;
}

interface AiSuggestion {
  hazardType: string;
  risk: RiskLevel;
  title: string;
  description: string;
}
```

---

## 인증

### `POST /auth/login`
로그인.

**Body**
```json
{ "username": "string", "password": "string" }
```
**200**
```json
{ "user": User, "token": "string" }
```
**401** 아이디/비밀번호 불일치

### `POST /auth/signup`
회원가입 + 자동 로그인.

**Body**
```json
{ "username": "string", "password": "string" }
```
**200**
```json
{ "user": User, "token": "string" }
```
- 신규 유저 `nickname` 기본값: `"안심이웃님"`
**409** 아이디 중복

### `POST /auth/guest`
게스트로 입장. Body 없음.

**200**
```json
{ "user": User, "token": "string" }
```
- `user.isGuest = true`

### `POST /auth/logout` `authed`
**204**

### `PATCH /auth/password` `authed`
비밀번호 변경.

**Body**
```json
{ "password": "string" }
```
**204**

### `DELETE /auth/me` `authed`
회원 탈퇴.

**204**

### `PATCH /auth/me` `authed`
프로필 수정 (닉네임/프로필 이미지).

**Body** (둘 다 선택)
```json
{ "nickname": "string", "profileImage": "string | null" }
```
**200**
```json
{ "user": User }
```

---

## 신고 게시물

### `GET /reports`
목록 조회. 쿼리 파라미터는 모두 선택.

| 파라미터 | 설명 |
|---|---|
| `category` | `CategoryId` 하나로 필터 |
| `hazardType` | 세부 위험유형 부분 일치 필터 (예: `싱크홀`, `침수`) |
| `sort` | `latest`(기본) \| `views` \| `likes` |
| `query` | 제목/주소/설명에 대한 텍스트 검색 |

**200**
```json
[Report, ...]
```

### `GET /reports/mine` `authed`
로그인한 사용자가 작성한 신고 목록 (최신순).

**200**
```json
[Report, ...]
```

### `GET /reports/:id`
상세 조회. **서버에서 `viewCount`를 1 증가시킨 뒤** 반환합니다.

**200**
```json
Report
```
**404** 신고 없음

### `POST /reports` `authed` — `multipart/form-data`
신고 등록.

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `image` | file | 아니오 | 현장 사진 (FE에서 최대 1280px, JPEG로 리사이즈해서 전송) |
| `hazardType` | string | 예 | 위험 유형 |
| `category` | string | 예 | `CategoryId` |
| `risk` | string(정수) | 예 | 1~10 |
| `title` | string | 예 | |
| `description` | string | 아니오 | |
| `address` | string | 예 | |
| `lat` | string(float) | 예 | |
| `lng` | string(float) | 예 | |

**200**
```json
Report
```
- `authorId`/`authorNickname`은 인증 토큰에서 서버가 채웁니다.
- `viewCount`/`likeCount`/`commentCount` = 0, `likedByMe` = false로 시작.
**400** `hazardType` 또는 위치 누락

### `PATCH /reports/:id` `authed`
본인 글 수정.

**Body** (부분 업데이트, 아래 필드만 허용)
```json
{
  "title": "string",
  "description": "string",
  "category": "CategoryId",
  "hazardType": "string",
  "risk": 1
}
```
**200**
```json
Report
```
**404** 신고 없음

### `DELETE /reports/:id` `authed`
본인 글 삭제.

**204**

### `POST /reports/:id/like` `authed`
좋아요 토글 (이미 눌렀으면 취소).

**200**
```json
Report
```
- `likedByMe`가 뒤집히고 `likeCount`가 ±1
**404** 신고 없음

### `POST /reports/:id/flag` `authed`
게시물 신고(부적절 콘텐츠).

**Body**
```json
{ "reason": "string" }
```
(`reason`은 선택)
**204**

### `GET /reports/:id/comments`
댓글 목록 (작성순).

**200**
```json
[Comment, ...]
```

### `POST /reports/:id/comments` `authed`
댓글 작성.

**Body**
```json
{ "content": "string" }
```
**200**
```json
Comment
```
- `authorNickname`은 인증 토큰에서 서버가 채움
- 서버는 해당 `Report.commentCount`를 함께 증가시켜야 합니다.

---

## AI 분석

### `POST /ai/analyze` — `multipart/form-data`
사진 기반 위험 유형/위험도/제목/설명 추론.

| 필드 | 타입 | 필수 |
|---|---|---|
| `image` | file | 예 |

**200**
```json
AiSuggestion
```
- 위치/주소는 FE가 기기 GPS + Kakao 역지오코딩으로 별도 처리하므로
  이 엔드포인트는 위치 정보를 반환하지 않습니다.

---

## 참고

- 프론트엔드 구현 위치: `src/api/http.ts`(공통 fetch 래퍼), `src/api/auth.ts`,
  `src/api/reports.ts`, `src/api/ai.ts`
- `NEXT_PUBLIC_API_BASE_URL`이 비어 있으면 위 엔드포인트를 호출하지 않고
  `localStorage` 기반 목업으로 동작합니다 (개발/데모용).
- 이미지: FE가 업로드 전 클라이언트에서 리사이즈/압축하므로, 서버는 별도
  리사이즈 없이 받은 파일을 저장하고 접근 가능한 URL만 `imageUrl`/
  `profileImage`로 내려주면 됩니다.
