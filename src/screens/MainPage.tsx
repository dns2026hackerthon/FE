'use client';

import { useRouter } from 'next/navigation';
import { useUiStore } from '@/store/uiStore';
import { listReports } from '@/api/reports';
import { useAsync } from '@/hooks/useAsync';
import { LogoWordmark } from '@/components/common/Logo';
import { Icon } from '@/components/common/Icon';
import { SearchBar } from '@/components/main/SearchBar';
import { ViewToggle } from '@/components/main/ViewToggle';
import { CategoryFilter } from '@/components/common/CategoryFilter';
import { FeedSection } from '@/components/main/FeedSection';
import { MapSection } from '@/components/main/MapSection';
import { BottomNav } from '@/components/layout/BottomNav';

export default function MainPage() {
  const router = useRouter();
  const {
    viewMode,
    setViewMode,
    category,
    setCategory,
    sort,
    query,
    setQuery,
  } = useUiStore();

  const { data, loading } = useAsync(
    () => listReports({ category, sort, query }),
    [category, sort, query],
  );
  const reports = data ?? [];

  return (
    <div className="app-shell flex min-h-full flex-col pb-20">
      {/* 홈 헤더 */}
      <header className="sticky top-0 z-20 flex items-center justify-between bg-canvas/90 px-4 py-3 backdrop-blur">
        <LogoWordmark />
        <div className="flex items-center gap-1">
          <IconButton icon="bell" onClick={() => {}} label="알림" />
          <IconButton
            icon="user"
            onClick={() => router.push('/mypage')}
            label="마이페이지"
          />
        </div>
      </header>

      <ViewToggle value={viewMode} onChange={setViewMode} />
      <SearchBar value={query} onChange={setQuery} />
      <CategoryFilter value={category} onChange={setCategory} />

      {viewMode === 'map' ? (
        <MapSection reports={reports} loading={loading} />
      ) : (
        <FeedSection reports={reports} loading={loading} />
      )}

      <BottomNav />
    </div>
  );
}

function IconButton({
  icon,
  onClick,
  label,
}: {
  icon: 'bell' | 'user';
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full text-ink active:bg-black/5"
    >
      <Icon name={icon} size={22} />
    </button>
  );
}
