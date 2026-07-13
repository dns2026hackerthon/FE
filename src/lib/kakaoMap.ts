// Kakao Maps SDK 동적 로더.
// NEXT_PUBLIC_KAKAO_MAP_KEY 가 있으면 실제 SDK를 불러오고, 없으면 지도를 사용할 수 없다.

import type { GeoPoint } from '@/types';

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

export const hasKakaoKey = Boolean(KAKAO_KEY);

let loadPromise: Promise<typeof window.kakao> | null = null;

declare global {
  interface Window {
    // Kakao SDK가 전역에 kakao 를 주입한다. 타입은 느슨하게 any.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

export function loadKakaoMap(): Promise<typeof window.kakao> {
  if (!hasKakaoKey) {
    return Promise.reject(new Error('KAKAO_MAP_KEY_MISSING'));
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve(window.kakao);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao));
    };
    script.onerror = () => reject(new Error('KAKAO_MAP_LOAD_FAILED'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** 좌표 → 도로명/지번 주소 (Kakao Geocoder). 실패 시 null. */
export async function reverseGeocode(p: GeoPoint): Promise<string | null> {
  if (!hasKakaoKey) return null;
  const kakao = await loadKakaoMap().catch(() => null);
  if (!kakao) return null;

  return new Promise((resolve) => {
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(
      p.lng,
      p.lat,
      (
        result: Array<{
          road_address?: { address_name: string } | null;
          address?: { address_name: string } | null;
        }>,
        status: string,
      ) => {
        if (status === kakao.maps.services.Status.OK && result[0]) {
          resolve(
            result[0].road_address?.address_name ||
              result[0].address?.address_name ||
              null,
          );
        } else {
          resolve(null);
        }
      },
    );
  });
}

/** 키워드로 장소/지역을 검색해 첫 결과의 좌표를 반환한다. (지역검색) */
export async function searchKakaoPlace(query: string): Promise<GeoPoint | null> {
  if (!hasKakaoKey) return null;
  const kakao = await loadKakaoMap().catch(() => null);
  if (!kakao) return null;

  return new Promise((resolve) => {
    const places = new kakao.maps.services.Places();
    places.keywordSearch(query, (data: Array<{ x: string; y: string }>, status: string) => {
      if (status === kakao.maps.services.Status.OK && data.length > 0) {
        resolve({ lat: parseFloat(data[0].y), lng: parseFloat(data[0].x) });
      } else {
        resolve(null);
      }
    });
  });
}
