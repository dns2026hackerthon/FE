import type { Report, Comment, User } from '@/types';
import { MOCK_REPORTS, MOCK_COMMENTS } from '@/mocks/reports';

/**
 * 인메모리 목업 DB.
 * 서버 연동 전까지 사용하며, 사용자가 만든 데이터는 localStorage에 영속화한다.
 * 실제 서버가 붙으면 이 파일과 api/* 의 구현만 교체하면 된다.
 */

// v3: 위험도(1~10 정수)·위험 유형(hazardType) 스키마 변경 — 구버전 데이터를 버린다.
const LS_KEY = 'safe-neighborhood:db:v3';

interface DbShape {
  reports: Report[];
  comments: Comment[];
}

function seed(): DbShape {
  return {
    reports: structuredClone(MOCK_REPORTS),
    comments: structuredClone(MOCK_COMMENTS),
  };
}

function load(): DbShape {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as DbShape;
    if (!parsed.reports) return seed();
    return parsed;
  } catch {
    return seed();
  }
}

let db: DbShape = load();

function persist() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(db));
  } catch {
    /* 용량 초과 등은 조용히 무시 */
  }
}

export const mockDb = {
  get reports() {
    return db.reports;
  },
  get comments() {
    return db.comments;
  },
  commit() {
    persist();
  },
  reset() {
    db = seed();
    persist();
  },
};

// --- 인증(사용자) 영속화는 별도 키로 ---
const AUTH_KEY = 'safe-neighborhood:auth:v1';
const USERS_KEY = 'safe-neighborhood:users:v1';

export function loadCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: User | null) {
  if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_KEY);
}

interface StoredCredential {
  username: string;
  password: string;
  user: User;
}

export function loadUsers(): StoredCredential[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredCredential[]) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: StoredCredential[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
