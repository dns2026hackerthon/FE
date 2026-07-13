'use client';

import { useEffect, useRef, useState } from 'react';
import type { GeoPoint } from '@/types';
import { loadKakaoMap, hasKakaoKey } from '@/lib/kakaoMap';

interface Props {
  /** 지도 중심 & 마커 위치. 부모가 검색으로 좌표를 바꾸면 지도도 함께 이동한다. */
  value: GeoPoint;
  /** 지도를 탭해 위치를 지정했을 때 */
  onPick: (point: GeoPoint) => void;
}

/** 탭해서 위치를 지정할 수 있는 인터랙티브 지도. 검색 결과 좌표로도 동기화된다. */
export function LocationPickerMap({ value, onPick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kakaoRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hasKakaoKey) {
      setFailed(true);
      return;
    }
    let cancelled = false;
    loadKakaoMap()
      .then((kakao) => {
        if (cancelled || !containerRef.current) return;
        kakaoRef.current = kakao;
        const map = new kakao.maps.Map(containerRef.current, {
          center: new kakao.maps.LatLng(value.lat, value.lng),
          level: 3,
        });
        mapRef.current = map;
        markerRef.current = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(value.lat, value.lng),
          map,
        });
        kakao.maps.event.addListener(
          map,
          'click',
          (e: { latLng: { getLat: () => number; getLng: () => number } }) => {
            const point = { lat: e.latLng.getLat(), lng: e.latLng.getLng() };
            markerRef.current.setPosition(
              new kakao.maps.LatLng(point.lat, point.lng),
            );
            onPickRef.current(point);
          },
        );
        setReady(true);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 부모가 검색 등으로 value를 바꾸면 마커/중심도 동기화
  useEffect(() => {
    if (!ready || !mapRef.current || !kakaoRef.current) return;
    const kakao = kakaoRef.current;
    const pos = new kakao.maps.LatLng(value.lat, value.lng);
    mapRef.current.setCenter(pos);
    markerRef.current?.setPosition(pos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.lat, value.lng, ready]);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black/[0.03] text-[12px] text-ink-faint">
        지도를 불러올 수 없어요. 주소로 검색해주세요.
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}
