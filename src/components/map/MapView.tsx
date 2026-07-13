import { useEffect, useRef, useState } from 'react';
import type { Report, GeoPoint } from '@/types';
import { DEFAULT_CENTER } from '@/constants/categories';
import { loadKakaoMap, hasKakaoKey } from '@/lib/kakaoMap';
import { Icon } from '@/components/common/Icon';

interface Props {
  reports: Report[];
  center?: GeoPoint;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

/**
 * 지도 뷰. Kakao SDK 키가 없거나 로드에 실패하면 가짜 지도를 그리지 않고
 * 안내 메시지만 표시한다.
 */
export function MapView(props: Props) {
  if (!hasKakaoKey) return <MapUnavailable reason="키없음" />;
  return <KakaoMap {...props} />;
}

function KakaoMap({ reports, center = DEFAULT_CENTER, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadKakaoMap()
      .then((kakao) => {
        if (cancelled || !ref.current) return;
        const map = new kakao.maps.Map(ref.current, {
          center: new kakao.maps.LatLng(center.lat, center.lng),
          level: 4,
        });
        reports.forEach((r) => {
          const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(r.location.lat, r.location.lng),
            map,
          });
          kakao.maps.event.addListener(marker, 'click', () => onSelect?.(r.id));
        });
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports]);

  if (failed) return <MapUnavailable reason="로드실패" />;
  return <div ref={ref} className="h-full w-full" />;
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
