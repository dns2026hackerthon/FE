import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export function Loading({ label = '불러오는 중...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-faint">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-black/10 border-t-brand" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({
  icon = 'siren',
  title,
  description,
  action,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand-dark">
        <Icon name={icon} size={26} />
      </div>
      <p className="text-[15px] font-bold text-ink">{title}</p>
      {description && (
        <p className="text-sm text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
