'use client';

import { useRouter } from 'next/navigation';
import type { Report, GeoPoint } from '@/types';
import { MapView } from '@/components/map/MapView';
import { ReportCard } from '@/components/common/ReportCard';
import { Loading, EmptyState } from '@/components/common/State';
import { Icon } from '@/components/common/Icon';

interface Props {
  reports: Report[];
  loading: boolean;
  center: GeoPoint;
  myLocation: GeoPoint | null;
  locating: boolean;
  onLocateMe: () => void;
}

/** 지도 + 하단 '이 주변 위험' 목록 */
export function MapSection({
  reports,
  loading,
  center,
  myLocation,
  locating,
  onLocateMe,
}: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col">
      {/* 지도 영역 */}
      <div className="relative mx-4 mt-2 h-[42vh] min-h-[260px] overflow-hidden rounded-card shadow-card">
        <MapView
          reports={reports}
          center={center}
          myLocation={myLocation}
          onSelectReport={(id) => router.push(`/report/${id}`)}
        />
        {/* 현재 위치로 이동 버튼 */}
        <button
          onClick={onLocateMe}
          disabled={locating}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-md active:scale-95 disabled:opacity-60"
          aria-label="현재 위치로"
        >
          {locating ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/10 border-t-brand" />
          ) : (
            <Icon name="crosshair" size={20} />
          )}
        </button>
      </div>

      {/* 주변 위험 목록 */}
      <div className="mt-4 flex items-center justify-between px-4">
        <div>
          <h2 className="text-[15px] font-bold text-ink">이 주변 위험</h2>
          <p className="text-[11px] text-ink-muted">내 주변 신고 · 500m 이내</p>
        </div>
        <span className="rounded-full bg-brand-light px-2.5 py-1 text-[12px] font-bold text-brand-dark">
          {reports.length}건
        </span>
      </div>

      {loading ? (
        <Loading />
      ) : reports.length === 0 ? (
        <EmptyState
          icon="map-pin"
          title="주변에 등록된 신고가 없어요"
          description="첫 번째 위험을 신고해보세요."
        />
      ) : (
        <div className="flex flex-col gap-2.5 px-4 pb-2 pt-3">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}
