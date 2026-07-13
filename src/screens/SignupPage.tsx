'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LogoMark } from '@/components/common/Logo';
import { Button } from '@/components/common/Button';
import { AuthField } from '@/components/auth/AuthField';

export default function SignupPage() {
  const router = useRouter();
  const { user, signup, loginAsGuest } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;
  const valid = username.trim() && password.length >= 4 && password === confirm;

  // 이미 로그인된 상태면 홈으로
  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setError(null);
    setLoading(true);
    try {
      await signup(username.trim(), password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
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
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark size={64} />
          <h1 className="mt-4 text-2xl font-extrabold text-ink">안전한 동네</h1>
          <p className="mt-1 text-[11px] font-bold tracking-[0.2em] text-ink-faint">
            SAFE NEIGHBORHOOD
          </p>
          <p className="mt-4 text-[15px] font-bold text-ink">
            함께 만드는 안전한 우리 동네
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <AuthField
            label="아이디"
            value={username}
            onChange={setUsername}
            placeholder="사용할 아이디를 입력하세요"
            autoComplete="username"
          />
          <AuthField
            label="비밀번호"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="비밀번호 (4자 이상)"
            autoComplete="new-password"
          />
          <AuthField
            label="비밀번호 확인"
            type="password"
            value={confirm}
            onChange={setConfirm}
            placeholder="비밀번호를 다시 입력하세요"
            autoComplete="new-password"
          />

          {mismatch && (
            <p className="text-sm font-medium text-risk-high">
              비밀번호가 일치하지 않습니다.
            </p>
          )}
          {error && (
            <p className="text-sm font-medium text-risk-high">{error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!valid}
            className="mt-2"
          >
            회원가입
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-3 text-sm font-semibold text-ink-muted">
          <Link href="/login" className="text-ink hover:text-brand-dark">
            로그인
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
