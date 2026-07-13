import type { User } from '@/types';
import { ApiError, delay, genId } from './http';
import { loadUsers, saveUsers, saveCurrentUser } from './mockDb';

// 인증 API — 목업 구현. 서버 연동 시 이 파일만 교체.

export interface Credentials {
  username: string;
  password: string;
}

export async function login({
  username,
  password,
}: Credentials): Promise<User> {
  const users = loadUsers();
  const found = users.find((u) => u.username === username);
  if (!found || found.password !== password) {
    throw new ApiError('아이디 또는 비밀번호가 올바르지 않습니다.', 401);
  }
  saveCurrentUser(found.user);
  return delay(found.user);
}

export async function signup({
  username,
  password,
}: Credentials): Promise<User> {
  const users = loadUsers();
  if (users.some((u) => u.username === username)) {
    throw new ApiError('이미 사용 중인 아이디입니다.', 409);
  }
  const user: User = {
    id: genId('u'),
    username,
    nickname: '안심이웃님',
    profileImage: null,
  };
  users.push({ username, password, user });
  saveUsers(users);
  saveCurrentUser(user);
  return delay(user);
}

export async function loginAsGuest(): Promise<User> {
  const user: User = {
    id: 'guest',
    username: 'guest',
    nickname: '게스트',
    isGuest: true,
  };
  saveCurrentUser(user);
  return delay(user);
}

export async function logout(): Promise<void> {
  saveCurrentUser(null);
  return delay(undefined);
}

export async function changePassword(
  userId: string,
  next: string,
): Promise<void> {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.user.id === userId);
  if (idx === -1) throw new ApiError('사용자를 찾을 수 없습니다.', 404);
  users[idx].password = next;
  saveUsers(users);
  return delay(undefined);
}

export async function deleteAccount(userId: string): Promise<void> {
  const users = loadUsers().filter((u) => u.user.id !== userId);
  saveUsers(users);
  saveCurrentUser(null);
  return delay(undefined);
}

export async function updateProfile(
  user: User,
  patch: Partial<Pick<User, 'nickname' | 'profileImage'>>,
): Promise<User> {
  const next = { ...user, ...patch };
  const users = loadUsers();
  const idx = users.findIndex((u) => u.user.id === user.id);
  if (idx !== -1) {
    users[idx].user = next;
    saveUsers(users);
  }
  saveCurrentUser(next);
  return delay(next);
}
