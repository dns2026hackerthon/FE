'use client';

import { useState } from 'react';
import type { Report, GeoPoint } from '@/types';
import { MapView } from '@/components/map/MapView';
import { ReportCard } from '@/components/common/ReportCard';
import { Loading, EmptyState } from '@/components/common/State';
import { Icon } from '@/components/common/Icon';
import { distanceMeters } from '@/lib/geolocation';

const NEARBY_RADIUS_M = 500;

interface Props {
  reports: Report[];
  loading: boolean;
  center: GeoPoint;
  moveSeq: number;
  myLocation: GeoPoint | null;
  locating: boolean;
  onLocateMe: () => void;
  geoError?: string | null;
  onDismissGeoError?: () => void;
}

/** 지도 + 하단 목록 (마커 선택 시 해당 게시물, 아니면 '이 주변 위험' 500m 목록) */
export function MapSection({
  reports,
  loading,
  center,
  moveSeq,
  myLocation,
  locating,
  onLocateMe,
  geoError,
  onDismissGeoError,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 마커로 선택한 게시물 (삭제 등으로 목록에서 사라지면 자동 해제)
  const selected = selectedId
    ? reports.find((r) => r.id === selectedId) ?? null
    : null;

  // 내 위치 기준 500m 이내 신고만 '이 주변 위험'에 노출
  const nearby = myLocation
    ? reports.filter(
        (r) => distanceMeters(myLocation, r.location) <= NEARBY_RADIUS_M,
      )
    : [];

  return (
    <div className="flex flex-1 flex-col">
      {/* 지도 영역 */}
      <div className="relative mx-4 mt-2 h-[42vh] min-h-[260px] overflow-hidden rounded-card shadow-card">
        <MapView
          reports={reports}
          center={center}
          moveSeq={moveSeq}
          myLocation={myLocation}
          onSelectReport={setSelectedId}
        />
        {/* 현재 위치로 이동 버튼 — Kakao 타일 위에 항상 보이도록 z-index 부여 */}
        <button
          onClick={onLocateMe}
          disabled={locating}
          className="absolute bottom-3 right-3 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink shadow-md ring-1 ring-black/5 active:scale-95 disabled:opacity-60"
          aria-label="현재 위치로"
        >
          <Icon name="crosshair" size={20} />
        </button>
        {/* 위치 오류 안내 토스트 */}
        {geoError && (
          <button
            onClick={onDismissGeoError}
            className="absolute inset-x-3 bottom-3 z-30 rounded-xl bg-navy/90 px-3 py-2 text-left text-[12px] leading-snug text-white shadow-lg"
          >
            {geoError}
            <span className="mt-0.5 block text-[10px] text-white/60">탭하여 닫기</span>
          </button>
        )}
      </div>

      {selected ? (
        /* 마커 선택 시: 해당 게시물만 표시 */
        <>
          <div className="mt-4 flex items-center justify-between px-4">
            <h2 className="text-[15px] font-bold text-ink">선택한 신고</h2>
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-1 rounded-full bg-black/[0.05] px-3 py-1.5 text-[12px] font-semibold text-ink-muted"
            >
              <Icon name="x" size={14} />
              닫기
            </button>
          </div>
          <div className="px-4 pb-2 pt-3">
            <ReportCard report={selected} />
          </div>
        </>
      ) : (
        /* 기본: 내 위치 500m 이내 신고 목록 */
        <>
          <div className="mt-4 flex items-center justify-between px-4">
            <div>
              <h2 className="text-[15px] font-bold text-ink">이 주변 위험</h2>
              <p className="text-[11px] text-ink-muted">
                내 주변 신고 · {NEARBY_RADIUS_M}m 이내
              </p>
            </div>
            <span className="rounded-full bg-brand-light px-2.5 py-1 text-[12px] font-bold text-brand-dark">
              {nearby.length}건
            </span>
          </div>

          {loading ? (
            <Loading />
          ) : !myLocation ? (
            <EmptyState
              icon="map-pin"
              title="내 위치를 확인할 수 없어요"
              description="위치 권한을 허용하면 주변 신고를 보여드려요."
            />
          ) : nearby.length === 0 ? (
            <EmptyState
              icon="map-pin"
              title="주변에 등록된 신고가 없어요"
              description={`내 위치 ${NEARBY_RADIUS_M}m 이내 신고가 없습니다.`}
            />
          ) : (
            <div className="flex flex-col gap-2.5 px-4 pb-2 pt-3">
              {nearby.map((r) => (
                <ReportCard key={r.id} report={r} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
