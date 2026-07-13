'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * 앱 진입 시 localStorage에서 인증 상태를 복원한다.
 * 복원 전에는 잠깐 스플래시를 보여준다.
 */
export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    init();
  }, [init]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  return <>{children}</>;
}
