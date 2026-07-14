'use client';

import { useEffect, useRef, useState } from 'react';
import type { Report, GeoPoint } from '@/types';
import { loadKakaoMap, hasKakaoKey } from '@/lib/kakaoMap';
import { clusterByLocation } from '@/lib/geolocation';
import { Icon } from '@/components/common/Icon';

interface Props {
  reports: Report[];
  center: GeoPoint;
  /**
   * 지도 이동 트리거. 같은 좌표라도 이 값이 증가하면 지도를 center로 다시 이동시킨다.
   * (현재 위치 버튼을 연달아 눌러도 항상 동작하게 하기 위함)
   */
  moveSeq?: number;
  /** 내 현재 위치 — 지도 위에 항상 표시되는 파란 점 마커 */
  myLocation?: GeoPoint | null;
  /** 마커(클러스터)를 눌렀을 때 — 같은 위치에 묶인 신고 id 목록을 넘겨준다 */
  onSelectReports?: (ids: string[]) => void;
}

/**
 * 지도 뷰. Kakao SDK 키가 없거나 로드에 실패하면 가짜 지도를 그리지 않고
 * 안내 메시지만 표시한다.
 */
export function MapView(props: Props) {
  if (!hasKakaoKey) return <MapUnavailable reason="키없음" />;
  return <KakaoMap {...props} />;
}

function KakaoMap({ reports, center, moveSeq = 0, myLocation, onSelectReports }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kakaoRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myMarkerRef = useRef<any>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  // 현재 줌 레벨 (Kakao: 값이 클수록 축소). 줌이 바뀌면 병합 강도를 조절한다.
  const [level, setLevel] = useState(4);

  // 지도 최초 1회 생성
  useEffect(() => {
    let cancelled = false;
    loadKakaoMap()
      .then((kakao) => {
        if (cancelled || !containerRef.current) return;
        kakaoRef.current = kakao;
        const map = new kakao.maps.Map(containerRef.current, {
          center: new kakao.maps.LatLng(center.lat, center.lng),
          level: 4,
        });
        mapRef.current = map;
        setLevel(map.getLevel());
        // 줌(확대/축소) 변경 시 레벨을 반영해 마커 병합을 다시 계산한다.
        kakao.maps.event.addListener(map, 'zoom_changed', () => {
          setLevel(map.getLevel());
        });
        setReady(true);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // center/moveSeq가 바뀌면 (현재 위치 버튼 / 검색 결과) 즉시 이동 — 애니메이션 없음.
  // moveSeq를 deps에 포함해 같은 좌표로도 반복 이동이 가능하다.
  useEffect(() => {
    if (!ready || !mapRef.current || !kakaoRef.current) return;
    const kakao = kakaoRef.current;
    mapRef.current.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, moveSeq, ready]);

  // 신고 마커 렌더링 — 근접 좌표는 하나의 마커로 묶는다(클러스터링).
  // 클러스터 클릭 시 묶인 신고 id 목록을 넘긴다.
  useEffect(() => {
    if (!ready || !mapRef.current || !kakaoRef.current) return;
    const kakao = kakaoRef.current;

    markersRef.current.forEach((m) => m.setMap(null));

    // 줌 레벨이 축소될수록 더 넓게 묶는다 (레벨4 기준 ~30m, 한 단계마다 2배).
    const threshold = 30 * Math.pow(2, level - 4);
    const clusters = clusterByLocation(
      reports.map((r) => ({ id: r.id, location: r.location })),
      threshold,
    );

    markersRef.current = clusters.map((cluster) => {
      const position = new kakao.maps.LatLng(
        cluster.center.lat,
        cluster.center.lng,
      );

      if (cluster.ids.length === 1) {
        const marker = new kakao.maps.Marker({ position, map: mapRef.current });
        kakao.maps.event.addListener(marker, 'click', () =>
          onSelectReports?.(cluster.ids),
        );
        return marker;
      }

      // 2건 이상 — 개수 배지가 있는 커스텀 마커
      const el = document.createElement('div');
      el.textContent = String(cluster.ids.length);
      el.style.cssText =
        'display:flex;align-items:center;justify-content:center;' +
        'min-width:28px;height:28px;padding:0 6px;border-radius:9999px;' +
        'background:#DC2626;color:#fff;font-size:13px;font-weight:700;' +
        'border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.45);cursor:pointer;';
      el.addEventListener('click', () => onSelectReports?.(cluster.ids));

      return new kakao.maps.CustomOverlay({
        position,
        content: el,
        map: mapRef.current,
        yAnchor: 0.5,
        xAnchor: 0.5,
        zIndex: 4,
      });
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports, ready, level, onSelectReports]);

  // 내 현재 위치 마커 (파란 점) — 검색/이동으로 지도가 움직여도 항상 지도 위에 남는다.
  useEffect(() => {
    if (!ready || !mapRef.current || !kakaoRef.current || !myLocation) return;
    const kakao = kakaoRef.current;
    const pos = new kakao.maps.LatLng(myLocation.lat, myLocation.lng);

    if (!myMarkerRef.current) {
      // 정적 파란 점 (애니메이션 없음)
      myMarkerRef.current = new kakao.maps.CustomOverlay({
        position: pos,
        content:
          '<div style="width:16px;height:16px;border-radius:9999px;background:#3B82F6;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.45);"></div>',
        map: mapRef.current,
        yAnchor: 0.5,
        xAnchor: 0.5,
        zIndex: 5,
      });
    } else {
      myMarkerRef.current.setPosition(pos);
      myMarkerRef.current.setMap(mapRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myLocation?.lat, myLocation?.lng, ready]);

  if (failed) return <MapUnavailable reason="로드실패" />;
  return <div ref={containerRef} className="h-full w-full" />;
}

/** Kakao 지도를 쓸 수 없을 때 보여줄 안내 (가짜 지도 없음) */
function MapUnavailable({ reason }: { reason: '키없음' | '로드실패' }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-black/[0.03] text-center">
      <Icon name="map" size={28} className="text-ink-faint" />
      <p className="text-[13px] font-semibold text-ink-muted">
        지도를 불러올 수 없어요
      </p>
      <p className="max-w-[220px] text-[11px] text-ink-faint">
        {reason === '키없음'
          ? 'Kakao 지도 키가 설정되지 않았어요.'
          : 'Kakao 지도를 불러오는 데 실패했어요. 도메인 등록 여부를 확인해주세요.'}
      </p>
    </div>
  );
}
