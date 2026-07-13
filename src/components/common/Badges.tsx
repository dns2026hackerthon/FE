import type { CategoryId, RiskLevel } from '@/types';
import { CATEGORY_MAP, RISK_MAP } from '@/constants/categories';

export function CategoryBadge({ category }: { category: CategoryId }) {
  const meta = CATEGORY_MAP[category];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.softBgClass} ${meta.textClass}`}
    >
      {meta.label}
    </span>
  );
}

export function RiskBadge({
  risk,
  showDot = true,
}: {
  risk: RiskLevel;
  showDot?: boolean;
}) {
  const meta = RISK_MAP[risk];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${meta.textClass}`}>
      {showDot && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
      )}
      위험도 {meta.label}
    </span>
  );
}
