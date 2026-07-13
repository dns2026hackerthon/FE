'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon, type IconName } from '@/components/common/Icon';

const items: { to: string; icon: IconName; label: string }[] = [
  { to: '/', icon: 'home', label: '홈' },
  { to: '/mypage', icon: 'user', label: '마이' },
];

/** 하단 탭바 — 좌: 홈 / 중앙: 위험 신고(오렌지 FAB) / 우: 마이 */
export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname() ?? '';

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-app border-t border-black/5 bg-surface/95 backdrop-blur shadow-nav">
      <div className="relative grid h-16 grid-cols-3 items-center">
        <TabItem {...items[0]} active={pathname === '/'} />

        {/* 중앙 신고 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={() => router.push('/report/new')}
            className="-mt-8 flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full bg-brand text-white shadow-fab active:scale-95 transition"
            aria-label="위험 신고"
          >
            <Icon name="plus" size={26} />
            <span className="text-[10px] font-bold leading-none">신고</span>
          </button>
        </div>

        <TabItem {...items[1]} active={pathname.startsWith('/mypage')} />
      </div>
    </nav>
  );
}

function TabItem({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: IconName;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={to}
      className={`flex flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
        active ? 'text-brand-dark' : 'text-ink-faint'
      }`}
    >
      <Icon name={icon} size={22} strokeWidth={active ? 2.4 : 2} />
      {label}
    </Link>
  );
}
