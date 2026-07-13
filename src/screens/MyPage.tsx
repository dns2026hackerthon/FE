'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { listMyReports, deleteReport } from '@/api/reports';
import { useAsync } from '@/hooks/useAsync';
import { compressImage } from '@/lib/image';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { ReportGridCard } from '@/components/common/ReportCard';
import { Loading } from '@/components/common/State';
import { AuthField } from '@/components/auth/AuthField';

type Dialog = null | 'password' | 'logout' | 'withdraw';

export default function MyPage() {
  const router = useRouter();
  const { user, logout, changePassword, deleteAccount, updateProfile } =
    useAuthStore();
  const avatarRef = useRef<HTMLInputElement>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { data, loading, reload } = useAsync(
    () => (user ? listMyReports(user.id) : Promise.resolve([])),
    [user?.id],
  );
  const myReports = data ?? [];

  const onAvatar = async (file?: File | null) => {
    if (!file) return;
    // 프로필 사진은 더 작게 (아바타 표시용)
    const dataUrl = await compressImage(file, { maxDimension: 512, quality: 0.8 });
    await updateProfile({ profileImage: dataUrl });
  };

  const onChangePassword = async () => {
    if (pw1.length < 4 || pw1 !== pw2) return;
    setBusy(true);
    try {
      await changePassword(pw1);
      setDialog(null);
      setPw1('');
      setPw2('');
    } finally {
      setBusy(false);
    }
  };

  const onLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const onWithdraw = async () => {
    setBusy(true);
    try {
      await deleteAccount();
      router.replace('/login');
    } finally {
      setBusy(false);
    }
  };

  const onDeleteReport = async (id: string) => {
    await deleteReport(id);
    reload();
  };

  const isGuest = user?.isGuest;

  return (
    <div className="app-shell flex min-h-full flex-col pb-20">
      <TopBar title="마이페이지" />

      {/* 프로필 */}
      <section className="flex items-center gap-4 px-5 py-5">
        <button
          onClick={() => !isGuest && avatarRef.current?.click()}
          className="relative"
          aria-label="프로필 이미지 수정"
        >
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-brand-light text-brand-dark">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Icon name="user" size={30} />
            )}
          </div>
          {!isGuest && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-canvas bg-navy text-white">
              <Icon name="camera" size={12} />
            </span>
          )}
        </button>
        <div>
          <p className="text-[12px] font-semibold text-ink-muted">
            안전한 동네 시민
          </p>
          <p className="text-[18px] font-extrabold text-ink">
            {user?.nickname ?? '게스트'}
          </p>
          {!isGuest && (
            <p className="text-[12px] text-ink-faint">@{user?.username}</p>
          )}
        </div>
      </section>

      <input
        ref={avatarRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onAvatar(e.target.files?.[0])}
      />

      {isGuest && (
        <div className="mx-5 mb-2 rounded-2xl bg-brand-light px-4 py-3 text-[13px] text-brand-dark">
          게스트로 둘러보는 중이에요.{' '}
          <button
            onClick={() => router.push('/login')}
            className="font-bold underline"
          >
            로그인하기
          </button>
        </div>
      )}

      {/* 내 신고 목록 (인스타그램 그리드) */}
      <section className="px-5 pt-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-[15px] font-bold text-ink">
            내 신고 목록
            <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[12px] text-ink-muted">
              {myReports.length}
            </span>
          </h2>
          {myReports.length > 0 && (
            <button
              onClick={() => setEditMode((v) => !v)}
              className="text-[13px] font-semibold text-brand-dark"
            >
              {editMode ? '완료' : '편집'}
            </button>
          )}
        </div>

        {loading ? (
          <Loading />
        ) : myReports.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-card bg-surface py-12 text-center shadow-card">
            <Icon name="siren" size={28} className="text-ink-faint" />
            <p className="text-sm text-ink-muted">등록한 신고가 아직 없어요.</p>
            <Button
              size="md"
              onClick={() => router.push('/report/new')}
              className="mt-1"
            >
              <Icon name="plus" size={18} /> 위험 신고하기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {myReports.map((r) => (
              <div key={r.id} className="relative">
                <ReportGridCard report={r} />
                {editMode && (
                  <button
                    onClick={() => onDeleteReport(r.id)}
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-navy/70 text-white"
                    aria-label="삭제"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 설정 */}
      <section className="mt-6 px-5">
        <div className="overflow-hidden rounded-card bg-surface shadow-card">
          {!isGuest && (
            <SettingRow
              icon="lock"
              label="비밀번호 변경"
              onClick={() => setDialog('password')}
            />
          )}
          <SettingRow
            icon="log-out"
            label="로그아웃"
            onClick={() => setDialog('logout')}
          />
          {!isGuest && (
            <SettingRow
              icon="trash"
              label="회원탈퇴"
              danger
              onClick={() => setDialog('withdraw')}
              last
            />
          )}
        </div>
      </section>

      {/* 비밀번호 변경 */}
      <Modal
        open={dialog === 'password'}
        onClose={() => setDialog(null)}
        title="비밀번호 변경"
      >
        <div className="flex flex-col gap-3">
          <AuthField
            label="새 비밀번호"
            type="password"
            value={pw1}
            onChange={setPw1}
            placeholder="새 비밀번호 (4자 이상)"
          />
          <AuthField
            label="비밀번호 확인"
            type="password"
            value={pw2}
            onChange={setPw2}
            placeholder="다시 입력하세요"
          />
          <Button
            size="lg"
            fullWidth
            loading={busy}
            disabled={pw1.length < 4 || pw1 !== pw2}
            onClick={onChangePassword}
            className="mt-1"
          >
            변경하기
          </Button>
        </div>
      </Modal>

      {/* 로그아웃 확인 */}
      <Modal
        open={dialog === 'logout'}
        onClose={() => setDialog(null)}
        title="로그아웃 하시겠어요?"
      >
        <div className="flex gap-2">
          <Button variant="ghost" fullWidth onClick={() => setDialog(null)}>
            취소
          </Button>
          <Button variant="secondary" fullWidth onClick={onLogout}>
            로그아웃
          </Button>
        </div>
      </Modal>

      {/* 회원탈퇴 확인 */}
      <Modal
        open={dialog === 'withdraw'}
        onClose={() => setDialog(null)}
        title="정말 탈퇴하시겠어요?"
      >
        <p className="mb-4 text-center text-sm text-ink-muted">
          탈퇴 시 계정 정보가 삭제되며 복구할 수 없어요.
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" fullWidth onClick={() => setDialog(null)}>
            취소
          </Button>
          <Button variant="danger" fullWidth loading={busy} onClick={onWithdraw}>
            탈퇴하기
          </Button>
        </div>
      </Modal>

      <BottomNav />
    </div>
  );
}

function SettingRow({
  icon,
  label,
  onClick,
  danger,
  last,
}: {
  icon: 'lock' | 'log-out' | 'trash';
  label: string;
  onClick: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-4 text-left active:bg-black/[0.02] ${
        last ? '' : 'border-b border-black/5'
      }`}
    >
      <Icon
        name={icon}
        size={20}
        className={danger ? 'text-risk-high' : 'text-ink-muted'}
      />
      <span
        className={`flex-1 text-[15px] font-semibold ${
          danger ? 'text-risk-high' : 'text-ink'
        }`}
      >
        {label}
      </span>
      <Icon name="chevron-right" size={18} className="text-ink-faint" />
    </button>
  );
}
