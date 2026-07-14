'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LogoMark } from '@/components/common/Logo';
import { Button } from '@/components/common/Button';
import { AuthField } from '@/components/auth/AuthField';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loginAsGuest } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 이미 로그인된 상태면 홈으로
  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onGuest = async () => {
    await loginAsGuest();
    router.replace('/');
  };

  return (
    <div className="app-shell flex min-h-full flex-col px-7 pb-8">
      <div className="flex flex-1 flex-col justify-center">
        {/* 로고 */}
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark size={64} />
          <h1 className="mt-4 text-2xl font-extrabold text-ink">dns</h1>
          <p className="mt-1 text-[11px] font-bold tracking-[0.2em] text-ink-faint">
            SAFE NEIGHBORHOOD
          </p>
          <p className="mt-4 text-[15px] font-bold text-ink">
            우리 동네, 오늘도 안심.
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            동네의 위험 정보를 확인하고 함께 해결해요.
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <AuthField
            label="아이디"
            value={username}
            onChange={setUsername}
            placeholder="아이디를 입력하세요"
            autoComplete="username"
          />
          <AuthField
            label="비밀번호"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
          />

          {error && (
            <p className="text-sm font-medium text-risk-high">{error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!username || !password}
            className="mt-2"
          >
            로그인
          </Button>
        </form>

        {/* 하단 링크 */}
        <div className="mt-5 flex items-center justify-center gap-3 text-sm font-semibold text-ink-muted">
          <Link href="/signup" className="text-ink hover:text-brand-dark">
            회원가입
          </Link>
          <span className="text-black/15">|</span>
          <button onClick={onGuest} className="hover:text-brand-dark">
            게스트로 둘러보기
          </button>
        </div>
      </div>

      <p className="pt-6 text-center text-[11px] text-ink-faint">
        신고 내용은 지역사회의 안전을 위해 활용됩니다.
      </p>
    </div>
  );
}
