'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GeoPoint } from '@/types';
import { useUiStore } from '@/store/uiStore';
import { listReports } from '@/api/reports';
import { useAsync } from '@/hooks/useAsync';
import { getCurrentPosition } from '@/lib/geolocation';
import { searchKakaoPlace } from '@/lib/kakaoMap';
import { DEFAULT_CENTER } from '@/constants/categories';
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

  // 지도 중심 좌표(mapCenter)와 내 현재 위치(myLocation)를 분리한다.
  // - mapCenter: 지도가 실제로 보여주는 위치 (검색/현재위치 버튼으로 이동)
  // - myLocation: 내 GPS 위치 (지도 위 파란 점 마커로 항상 표시)
  const [mapCenter, setMapCenter] = useState<GeoPoint>(DEFAULT_CENTER);
  const [myLocation, setMyLocation] = useState<GeoPoint | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    getCurrentPosition()
      .then((point) => {
        setMyLocation(point);
        setMapCenter(point);
      })
      .catch(() => {
        // 위치 권한 거부/미지원 시 기본 좌표 유지
      });
  }, []);

  const locateMe = useCallback(async () => {
    setLocating(true);
    try {
      const point = await getCurrentPosition();
      setMyLocation(point);
      setMapCenter(point);
    } catch {
      // 조용히 무시 (권한 거부 등)
    } finally {
      setLocating(false);
    }
  }, []);

  // 지도뷰에서 검색은 텍스트 필터가 아니라 "장소 검색 후 지도 이동"이다.
  const handleSearchSubmit = useCallback(
    async (q: string) => {
      if (viewMode !== 'map' || !q.trim()) return;
      const point = await searchKakaoPlace(q.trim());
      if (point) setMapCenter(point);
    },
    [viewMode],
  );

  // 피드뷰에서만 텍스트 검색어로 신고 목록을 필터링한다.
  // (지도뷰의 검색어는 장소 검색용이라 마커 필터링에 쓰지 않는다)
  const { data, loading } = useAsync(
    () => listReports({ category, sort, query: viewMode === 'feed' ? query : undefined }),
    [category, sort, query, viewMode],
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
      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={handleSearchSubmit}
        placeholder={viewMode === 'map' ? '지역·장소 검색' : '위험 정보 검색'}
      />
      <CategoryFilter value={category} onChange={setCategory} />

      {viewMode === 'map' ? (
        <MapSection
          reports={reports}
          loading={loading}
          center={mapCenter}
          myLocation={myLocation}
          locating={locating}
          onLocateMe={locateMe}
        />
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
