'use client';

import { useEffect, useState } from 'react';
import type { GeoPoint } from '@/types';
import { searchKakaoPlaceDetailed, reverseGeocode } from '@/lib/kakaoMap';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { LocationPickerMap } from './LocationPickerMap';

interface Props {
  open: boolean;
  initial: GeoPoint;
  initialAddress?: string;
  onClose: () => void;
  onConfirm: (point: GeoPoint, address: string) => void;
}

/** 주소/장소 이름 직접 검색 또는 지도 탭으로 위치를 지정하는 모달 */
export function LocationPickerModal({
  open,
  initial,
  initialAddress = '',
  onClose,
  onConfirm,
}: Props) {
  const [point, setPoint] = useState<GeoPoint>(initial);
  const [address, setAddress] = useState(initialAddress);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // 모달을 열 때마다 현재 draft 값으로 리셋 (이전 검색 상태가 남지 않도록)
  useEffect(() => {
    if (open) {
      setPoint(initial);
      setAddress(initialAddress);
      setQuery('');
      setNotFound(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handlePick = async (p: GeoPoint) => {
    setPoint(p);
    setNotFound(false);
    const addr = await reverseGeocode(p);
    setAddress(addr ?? `위도 ${p.lat.toFixed(5)}, 경도 ${p.lng.toFixed(5)}`);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setNotFound(false);
    try {
      const result = await searchKakaoPlaceDetailed(query.trim());
      if (result) {
        setPoint(result.location);
        setAddress(result.address);
      } else {
        setNotFound(true);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = () => {
    onConfirm(point, address || query.trim());
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="위치 지정">
      <div className="flex flex-col gap-3">
        <form
          className="flex items-center gap-2 rounded-2xl border border-black/10 bg-canvas px-3 py-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <Icon name="search" size={16} className="text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="주소 또는 장소 이름으로 검색"
            className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-faint"
          />
          <button
            type="submit"
            disabled={!query.trim() || searching}
            className="shrink-0 rounded-full bg-navy px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-40"
          >
            {searching ? '검색 중' : '검색'}
          </button>
        </form>

        {notFound && (
          <p className="text-[12px] text-risk-high">
            검색 결과가 없어요. 지도를 탭해 직접 위치를 지정해주세요.
          </p>
        )}

        <div className="h-[220px] overflow-hidden rounded-2xl">
          <LocationPickerMap value={point} onPick={handlePick} />
        </div>

        <div className="flex items-start gap-2 rounded-2xl border border-black/10 bg-surface p-3">
          <Icon name="map-pin" size={16} className="mt-0.5 text-brand-dark" />
          <p className="text-[13px] font-semibold text-ink">
            {address || '지도를 탭하거나 검색해서 위치를 지정하세요'}
          </p>
        </div>

        <Button size="lg" fullWidth disabled={!address} onClick={handleConfirm}>
          이 위치로 지정
        </Button>
      </div>
    </Modal>
  );
}
