/**
 * 네트워크 계층 추상화.
 *
 * `NEXT_PUBLIC_API_BASE_URL`이 비어있으면 목업(in-memory + localStorage)으로 동작한다.
 * 서버가 준비되면 `.env`에 `NEXT_PUBLIC_API_BASE_URL`을 설정하는 것만으로
 * 아래 `request()`를 통해 실제 서버와 통신하도록 전환된다.
 * api/*.ts 의 각 함수는 `USE_MOCK` 여부로 목업/실서버 구현을 분기한다
 * (화면·스토어에서 호출하는 함수 시그니처는 그대로 유지).
 *
 * ## 기대하는 서버 계약 (REST)
 *
 * 인증 — 모든 성공 응답은 `{ user: User }` 또는 `{ user: User; token: string }`
 *   POST   /auth/login    { username, password } → { user, token }
 *   POST   /auth/signup   { username, password } → { user, token }
 *   POST   /auth/guest    {}                      → { user, token }
 *   POST   /auth/logout   (authed)                → 204
 *   PATCH  /auth/password (authed) { password }    → 204
 *   DELETE /auth/me       (authed)                 → 204
 *   PATCH  /auth/me       (authed) { nickname?, profileImage? } → { user }
 *
 * 신고 — Report/Comment 형태는 src/types/index.ts 참고
 *   GET    /reports?category=&sort=&query=         → Report[]
 *   GET    /reports/mine                  (authed) → Report[]
 *   GET    /reports/:id                             → Report (조회수 서버에서 증가)
 *   POST   /reports                       (authed, multipart/form-data) → Report
 *          필드: image(file, optional), hazardType, category, risk, title,
 *                description, address, lat, lng
 *   PATCH  /reports/:id                   (authed) → Report
 *   DELETE /reports/:id                   (authed) → 204
 *   POST   /reports/:id/like              (authed) → Report
 *   POST   /reports/:id/flag              (authed) { reason? } → 204
 *   GET    /reports/:id/comments                    → Comment[]
 *   POST   /reports/:id/comments          (authed) { content } → Comment
 *
 * AI 분석
 *   POST   /ai/analyze (multipart/form-data: image) → AiSuggestion
 *
 * 인증 헤더: 로그인/회원가입/게스트 응답의 token을 이후 모든 요청에
 *   `Authorization: Bearer <token>` 로 첨부한다 (아래 request()가 자동 처리).
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
export const USE_MOCK = !API_BASE_URL;

/** 목업 지연 (네트워크 흉내) */
export function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// --- 인증 토큰 (실서버 모드에서만 사용) ---
const TOKEN_KEY = 'safe-neighborhood:token:v1';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** 실제 서버 연동 시 사용하는 fetch 래퍼. FormData 바디는 Content-Type을 자동 설정한다. */
export async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = getAuthToken();
  const isFormData =
    typeof FormData !== 'undefined' && init?.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers ?? {}),
  };

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError('서버에 연결할 수 없어요. 네트워크를 확인해주세요.', 0);
  }

  if (!res.ok) {
    let message = `요청 실패 (${res.status})`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** JSON body로 요청 (Content-Type 자동 설정) */
export function requestJson<T>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T> {
  return request<T>(path, {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/** 간단한 id 생성기 (목업 전용) */
export function genId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}
