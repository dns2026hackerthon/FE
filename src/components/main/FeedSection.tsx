import type { Report, SortKey } from '@/types';
import { useUiStore } from '@/store/uiStore';
import { Icon } from '@/components/common/Icon';
import { ReportCard } from '@/components/common/ReportCard';
import { FeedCard } from '@/components/common/FeedCard';
import { Loading, EmptyState } from '@/components/common/State';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'latest', label: '최신순' },
  { key: 'views', label: '조회수순' },
  { key: 'likes', label: '공감순' },
];

interface Props {
  reports: Report[];
  loading: boolean;
}

export function FeedSection({ reports, loading }: Props) {
  const { sort, setSort, feedLayout, setFeedLayout } = useUiStore();

  return (
    <div className="flex flex-1 flex-col">
      {/* 개수 + 정렬 + 레이아웃 토글 */}
      <div className="flex items-center justify-between px-4 pb-1 pt-2">
        <p className="text-[13px] font-bold text-ink">
          <span className="text-brand-dark">{reports.length}</span>개의 신고가
          있어요
        </p>
        <button
          onClick={() => setFeedLayout(feedLayout === 'feed' ? 'list' : 'feed')}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface shadow-card text-ink-muted"
          aria-label={feedLayout === 'feed' ? '리스트로 보기' : '피드 카드로 보기'}
        >
          <Icon name={feedLayout === 'feed' ? 'list' : 'image'} size={17} />
        </button>
      </div>

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-2">
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold transition ${
              sort === s.key
                ? 'bg-brand-light text-brand-dark'
                : 'text-ink-faint'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 목록 */}
      {loading ? (
        <Loading />
      ) : reports.length === 0 ? (
        <EmptyState
          title="해당하는 신고가 없어요"
          description="다른 카테고리나 검색어를 시도해보세요."
        />
      ) : feedLayout === 'list' ? (
        <div className="flex flex-col gap-2.5 px-4 pt-1">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-4 pt-1">
          {reports.map((r) => (
            <FeedCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}
