// Kakao Maps SDK 동적 로더.
// VITE_KAKAO_MAP_KEY 가 있으면 실제 SDK를 불러오고, 없으면 플레이스홀더로 폴백한다.

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
