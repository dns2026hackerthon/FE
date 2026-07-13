import Link from 'next/link';
import type { Report } from '@/types';
import { Icon } from './Icon';
import { CategoryBadge, RiskBadge } from './Badges';
import { formatRelativeTime, formatCount } from '@/lib/format';

/** 피드 리스트용 가로형 카드 */
export function ReportCard({ report }: { report: Report }) {
  return (
    <Link
      href={`/report/${report.id}`}
      className="flex gap-3 rounded-card bg-surface p-3 shadow-card active:scale-[0.99] transition"
    >
      <Thumb report={report} className="h-[86px] w-[86px] shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <CategoryBadge category={report.category} />
          </div>
          <RiskBadge risk={report.risk} />
        </div>
        <h3 className="mt-1 truncate text-[15px] font-bold text-ink">
          {report.title}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-muted">
          <Icon name="map-pin" size={13} className="shrink-0" />
          <span className="truncate">{report.address}</span>
        </p>
        <div className="mt-auto flex items-center justify-between pt-1.5">
          <span className="text-[11px] text-ink-faint">
            {formatRelativeTime(report.createdAt)}
          </span>
          <div className="flex items-center gap-3 text-[11px] text-ink-muted">
            <span className="flex items-center gap-1">
              <Icon name="eye" size={13} /> {formatCount(report.viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <Icon
                name="heart"
                size={13}
                filled={report.likedByMe}
                className={report.likedByMe ? 'text-risk-high' : ''}
              />
              {formatCount(report.likeCount)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** 그리드(인스타그램 스타일)용 정사각 카드 */
export function ReportGridCard({ report }: { report: Report }) {
  return (
    <Link
      href={`/report/${report.id}`}
      className="relative aspect-square overflow-hidden rounded-xl bg-black/5"
    >
      <Thumb report={report} className="h-full w-full" rounded={false} />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="truncate text-[11px] font-semibold text-white">
          {report.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-white/80">
          <span className="flex items-center gap-0.5">
            <Icon name="heart" size={11} filled /> {formatCount(report.likeCount)}
          </span>
          <span className="flex items-center gap-0.5">
            <Icon name="eye" size={11} /> {formatCount(report.viewCount)}
          </span>
        </div>
      </div>
      <span className="absolute left-1.5 top-1.5">
        <CategoryBadge category={report.category} />
      </span>
    </Link>
  );
}

function Thumb({
  report,
  className = '',
  rounded = true,
}: {
  report: Report;
  className?: string;
  rounded?: boolean;
}) {
  if (report.imageUrl) {
    return (
      <img
        src={report.imageUrl}
        alt=""
        loading="lazy"
        className={`${className} ${rounded ? 'rounded-xl' : ''} object-cover bg-black/5`}
      />
    );
  }
  return (
    <div
      className={`${className} ${
        rounded ? 'rounded-xl' : ''
      } flex items-center justify-center bg-black/5 text-ink-faint`}
    >
      <Icon name="image" size={22} />
    </div>
  );
}
