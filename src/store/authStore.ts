import { create } from 'zustand';
import type { User } from '@/types';
import * as authApi from '@/api/auth';
import { loadCurrentUser } from '@/api/mockDb';

interface AuthState {
  user: User | null;
  initialized: boolean;
  init: () => void;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (next: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (
    patch: Partial<Pick<User, 'nickname' | 'profileImage'>>,
  ) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  initialized: false,

  init: () => {
    set({ user: loadCurrentUser(), initialized: true });
  },

  login: async (username, password) => {
    const user = await authApi.login({ username, password });
    set({ user });
  },

  signup: async (username, password) => {
    const user = await authApi.signup({ username, password });
    set({ user });
  },

  loginAsGuest: async () => {
    const user = await authApi.loginAsGuest();
    set({ user });
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null });
  },

  changePassword: async (next) => {
    const user = get().user;
    if (!user || user.isGuest) return;
    await authApi.changePassword(user.id, next);
  },

  deleteAccount: async () => {
    const user = get().user;
    if (!user) return;
    await authApi.deleteAccount(user.id);
    set({ user: null });
  },

  updateProfile: async (patch) => {
    const user = get().user;
    if (!user) return;
    const next = await authApi.updateProfile(user, patch);
    set({ user: next });
  },
}));
