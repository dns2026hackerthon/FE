/**
 * 네트워크 계층 추상화.
 *
 * 현재는 목업(in-memory)으로 동작한다. 서버가 준비되면
 * `USE_MOCK`를 false로 바꾸고 `request()` 구현을 실제 fetch로 채우면 된다.
 * api/*.ts 의 함수 시그니처는 그대로 유지되도록 설계했다.
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

/** 실제 서버 연동 시 사용할 fetch 래퍼 (현재는 미사용). */
export async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
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
  return (await res.json()) as T;
}

/** 간단한 id 생성기 */
export function genId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}
