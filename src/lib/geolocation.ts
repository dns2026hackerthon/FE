import type { GeoPoint } from '@/types';

/** 두 좌표 사이 거리(m) — 하버사인 공식 */
export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** 근접한 좌표를 하나의 클러스터로 묶는다 (지도 위 중복 마커 방지) */
export interface LocationCluster {
  center: GeoPoint;
  ids: string[];
}

export function clusterByLocation(
  points: Array<{ id: string; location: GeoPoint }>,
  thresholdMeters = 25,
): LocationCluster[] {
  const clusters: LocationCluster[] = [];
  for (const p of points) {
    const existing = clusters.find(
      (c) => distanceMeters(c.center, p.location) <= thresholdMeters,
    );
    if (existing) {
      existing.ids.push(p.id);
    } else {
      clusters.push({ center: { ...p.location }, ids: [p.id] });
    }
  }
  return clusters;
}

export type GeoErrorReason = 'insecure' | 'denied' | 'unavailable' | 'timeout';

export class GeoError extends Error {
  reason: GeoErrorReason;
  constructor(reason: GeoErrorReason, message: string) {
    super(message);
    this.reason = reason;
  }
}

/** 브라우저 Geolocation API로 현재 위치를 가져온다. */
export function getCurrentPosition(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new GeoError('unavailable', '이 브라우저는 위치 기능을 지원하지 않아요.'));
      return;
    }
    // HTTPS(또는 localhost)가 아니면 브라우저가 위치 API를 차단한다.
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      reject(
        new GeoError(
          'insecure',
          '위치 기능은 HTTPS 또는 localhost에서만 동작해요. 모바일은 https 주소로 접속하세요.',
        ),
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        const reason: GeoErrorReason =
          err.code === err.PERMISSION_DENIED
            ? 'denied'
            : err.code === err.TIMEOUT
              ? 'timeout'
              : 'unavailable';
        const message =
          reason === 'denied'
            ? '위치 권한이 거부됐어요. 브라우저 설정에서 허용해주세요.'
            : reason === 'timeout'
              ? '위치를 가져오는 데 시간이 초과됐어요. 다시 시도해주세요.'
              : '현재 위치를 가져올 수 없어요.';
        reject(new GeoError(reason, message));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  });
}
