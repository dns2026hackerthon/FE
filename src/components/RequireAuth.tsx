'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/**
 * 로그인(또는 게스트) 상태가 아니면 /login 으로 보낸다.
 * localStorage 기반 인증이라 서버 미들웨어로는 알 수 없어 클라이언트에서 가드한다.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  if (!user) return null;
  return <>{children}</>;
}
