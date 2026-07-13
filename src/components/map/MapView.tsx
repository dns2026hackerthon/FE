'use client';

import { useEffect, useRef, useState } from 'react';
import type { Report, GeoPoint } from '@/types';
import { loadKakaoMap, hasKakaoKey } from '@/lib/kakaoMap';
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
  /** 마커를 눌렀을 때 (해당 신고를 선택하는 용도) */
  onSelectReport?: (id: string) => void;
}

/**
 * 지도 뷰. Kakao SDK 키가 없거나 로드에 실패하면 가짜 지도를 그리지 않고
 * 안내 메시지만 표시한다.
 */
export function MapView(props: Props) {
  if (!hasKakaoKey) return <MapUnavailable reason="키없음" />;
  return <KakaoMap {...props} />;
}

function KakaoMap({ reports, center, moveSeq = 0, myLocation, onSelectReport }: Props) {
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

  // 지도 최초 1회 생성
  useEffect(() => {
    let cancelled = false;
    loadKakaoMap()
      .then((kakao) => {
        if (cancelled || !containerRef.current) return;
        kakaoRef.current = kakao;
        mapRef.current = new kakao.maps.Map(containerRef.current, {
          center: new kakao.maps.LatLng(center.lat, center.lng),
          level: 4,
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

  // 신고 마커 렌더링 (카테고리 필터 등으로 reports가 바뀌면 다시 그림)
  useEffect(() => {
    if (!ready || !mapRef.current || !kakaoRef.current) return;
    const kakao = kakaoRef.current;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = reports.map((r) => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(r.location.lat, r.location.lng),
        map: mapRef.current,
      });
      kakao.maps.event.addListener(marker, 'click', () => onSelectReport?.(r.id));
      return marker;
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports, ready, onSelectReport]);

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
