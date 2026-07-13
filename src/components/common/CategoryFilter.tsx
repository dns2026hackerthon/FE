import type { CategoryId } from '@/types';
import { CATEGORIES } from '@/constants/categories';

interface Props {
  value: CategoryId | null;
  onChange: (c: CategoryId | null) => void;
}

/** 가로 스크롤 카테고리 필터 칩 (전체 / 보행안전 / 도로위험 / 시설물 / 치안) */
export function CategoryFilter({ value, onChange }: Props) {
  const chip = (active: boolean) =>
    `shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
      active
        ? 'bg-navy text-white'
        : 'bg-surface text-ink-muted border border-black/5'
    }`;

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2">
      <button className={chip(value === null)} onClick={() => onChange(null)}>
        전체
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          className={chip(value === c.id)}
          onClick={() => onChange(c.id)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
