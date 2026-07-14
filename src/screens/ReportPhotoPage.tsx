'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDraftStore } from '@/store/draftStore';
import { analyzePhoto } from '@/api/ai';
import { compressImage, ImageProcessError } from '@/lib/image';
import { getCurrentPosition } from '@/lib/geolocation';
import { reverseGeocode } from '@/lib/kakaoMap';
import { AppLayout } from '@/components/layout/AppLayout';
import { TopBar } from '@/components/layout/TopBar';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';

export default function ReportPhotoPage() {
  const router = useRouter();
  const { draft, setImage, applyAi, patch, reset, justSubmitted, clearSubmitted } =
    useDraftStore();

  // 등록 직후 뒤로가기로 이 작성 화면에 되돌아온 경우 → 피드(홈)로 보낸다.
  useEffect(() => {
    if (justSubmitted) {
      clearSubmitted();
      router.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cameraRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);
  // 인제스천(사진 읽기 → 업로드 → AI 분석) 진행률 0~100
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopProgress = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  const onPick = async (file?: File | null) => {
    if (!file) return;
    setPickError(null);
    setAnalyzing(true);
    setProgress(5); // 파일 읽기 시작
    // 분석 완료 전까지 진행률을 단계적으로 올린다 (완료 시 100%)
    stopProgress();
    progressTimer.current = setInterval(() => {
      setProgress((p) => (p < 90 ? p + 5 : p));
    }, 120);
    try {
      // 원본을 그대로 들고 있지 않고 즉시 축소 인코딩 — 모바일 카메라
      // 원본(수십 MB)을 그대로 base64로 저장하면 메모리 부족으로 죽는다.
      const dataUrl = await compressImage(file);
      setImage(dataUrl);
      setProgress((p) => Math.max(p, 30)); // 압축 완료

      // 기본 위치 = 촬영/이미지 삽입 시점의 기기 GPS (2단계에서 직접 검색/지도 지정으로 변경 가능)
      const locationPromise = getCurrentPosition()
        .then(async (point) => {
          const address = await reverseGeocode(point);
          patch({
            location: point,
            address: address ?? `위도 ${point.lat.toFixed(5)}, 경도 ${point.lng.toFixed(5)}`,
          });
        })
        .catch(() => {
          // 위치 실패 시 2단계에서 직접 검색/지도 지정으로 안내
        });

      const suggestion = await analyzePhoto(dataUrl);
      applyAi(suggestion);
      await locationPromise;
      setProgress(100);
    } catch (err) {
      setPickError(
        err instanceof ImageProcessError
          ? err.message
          : '사진을 처리하지 못했어요. 다른 사진으로 다시 시도해주세요.',
      );
    } finally {
      stopProgress();
      setAnalyzing(false);
    }
  };

  const goNext = () => router.push('/report/new/details');

  const onBack = () => {
    reset();
    router.push('/');
  };

  return (
    <AppLayout withNav={false}>
      <TopBar subtitle="신고 작성 · 1/2" title="현장 사진 첨부" showBack onBack={onBack} />

      <div className="flex flex-1 flex-col px-5 py-4">
        {/* 미리보기 or 안내 */}
        {draft.imageDataUrl ? (
          <div className="relative overflow-hidden rounded-card shadow-card">
            <img
              src={draft.imageDataUrl}
              alt="첨부된 사진"
              className="aspect-[4/3] w-full object-cover"
            />
            {analyzing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy/60 px-8 text-white">
                <Icon name="sparkles" size={26} />
                <p className="text-sm font-semibold">
                  AI 분석 진행률 {progress}%
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-card border-2 border-dashed border-black/10 bg-surface py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-brand-dark">
              <Icon name="camera" size={30} />
            </div>
            <p className="mt-4 text-[15px] font-bold text-ink">
              사진 첨부가 먼저 필요해요
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              사진 선택 <span className="text-risk-high">*</span> 1장 이상
            </p>
          </div>
        )}

        {pickError && (
          <p className="mt-3 text-center text-[13px] font-medium text-risk-high">
            {pickError}
          </p>
        )}

        {/* 사진 촬영 / 앨범 선택 */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <PickCard
            icon="camera"
            title="사진 촬영"
            desc="카메라로 바로 촬영"
            onClick={() => cameraRef.current?.click()}
          />
          <PickCard
            icon="image"
            title="앨범에서 선택"
            desc="기존 사진 불러오기"
            onClick={() => albumRef.current?.click()}
          />
        </div>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
        <input
          ref={albumRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />

        <div className="mt-auto pt-6">
          <Button
            size="lg"
            fullWidth
            disabled={!draft.imageDataUrl || analyzing}
            onClick={goNext}
          >
            다음: 위험 정보 입력
            <Icon name="chevron-right" size={20} />
          </Button>
          <p className="mt-3 text-center text-[12px] text-ink-faint">
            사진을 선택하면 다음 단계로 이동할 수 있어요.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

function PickCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: 'camera' | 'image';
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-card bg-surface px-3 py-5 shadow-card active:scale-[0.98] transition"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-brand">
        <Icon name={icon} size={22} />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-bold text-ink">{title}</p>
        <p className="text-[11px] text-ink-muted">{desc}</p>
      </div>
    </button>
  );
}
