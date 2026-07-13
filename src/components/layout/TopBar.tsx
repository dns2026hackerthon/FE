'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common/Icon';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  center?: ReactNode;
  transparent?: boolean;
}

/** 공용 상단바 */
export function TopBar({
  title,
  subtitle,
  showBack,
  onBack,
  right,
  center,
  transparent,
}: TopBarProps) {
  const router = useRouter();
  return (
    <header
      className={`sticky top-0 z-20 flex h-14 items-center gap-2 px-3 ${
        transparent ? '' : 'border-b border-black/5 bg-canvas/90 backdrop-blur'
      }`}
    >
      {showBack ? (
        <button
          onClick={() => (onBack ? onBack() : router.back())}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink active:bg-black/5"
          aria-label="뒤로"
        >
          <Icon name="arrow-left" size={22} />
        </button>
      ) : (
        <div className="w-1" />
      )}

      {center ? (
        <div className="flex flex-1 justify-center">{center}</div>
      ) : (
        <div className="min-w-0 flex-1">
          {subtitle && (
            <p className="text-[11px] font-semibold text-brand-dark">
              {subtitle}
            </p>
          )}
          {title && (
            <h1 className="truncate text-[17px] font-bold text-ink">{title}</h1>
          )}
        </div>
      )}

      <div className="flex items-center gap-1">{right}</div>
    </header>
  );
}
