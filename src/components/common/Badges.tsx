import type { CategoryId, RiskLevel } from '@/types';
import { CATEGORY_MAP, riskMeta } from '@/constants/categories';

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

/** 위험 유형(침수/빙판길/...) 뱃지 */
export function HazardBadge({ hazardType }: { hazardType: string }) {
  if (!hazardType) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-black/[0.06] px-2 py-0.5 text-[11px] font-semibold text-ink">
      {hazardType}
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
  const meta = riskMeta(risk);
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${meta.textClass}`}
    >
      {showDot && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
      )}
      위험도 {risk}/10
    </span>
  );
}
