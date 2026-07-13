'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDraftStore } from '@/store/draftStore';
import { useAuthStore } from '@/store/authStore';
import { createReport } from '@/api/reports';
import {
  HAZARD_TYPES,
  HAZARD_ETC,
  categoryForHazard,
  riskMeta,
  RISK_MIN,
  RISK_MAX,
} from '@/constants/categories';
import { getCurrentPosition } from '@/lib/geolocation';
import { reverseGeocode } from '@/lib/kakaoMap';
import { AppLayout } from '@/components/layout/AppLayout';
import { TopBar } from '@/components/layout/TopBar';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';

const RISK_OPTIONS = Array.from(
  { length: RISK_MAX - RISK_MIN + 1 },
  (_, i) => RISK_MIN + i,
);

export default function ReportDetailsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { draft, aiSuggestion, patch, reset } = useDraftStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    'loading' | 'done' | 'failed'
  >(draft.location ? 'done' : 'loading');
  // 등록 완료 후 draft가 비워져도 1단계로 튕기지 않도록 하는 플래그
  const submittedRef = useRef(false);

  // 드롭다운 표시 상태: draft.hazardType이 목록에 있으면 그 값, 아니면 '기타'+직접입력
  const isPreset =
    draft.hazardType !== '' &&
    draft.hazardType !== HAZARD_ETC &&
    (HAZARD_TYPES as readonly string[]).includes(draft.hazardType);
  const [hazardSelect, setHazardSelect] = useState<string>(
    isPreset ? draft.hazardType : draft.hazardType ? HAZARD_ETC : '',
  );
  const [hazardCustom, setHazardCustom] = useState<string>(
    isPreset ? '' : draft.hazardType,
  );

  // 위치: 기기 GPS → 좌표, Kakao 역지오코딩 → 주소. (AI/서울 기본값을 쓰지 않는다)
  useEffect(() => {
    if (draft.location) {
      setLocationStatus('done');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const point = await getCurrentPosition();
        if (cancelled) return;
        const address = await reverseGeocode(point);
        if (cancelled) return;
        patch({
          location: point,
          address:
            draft.address ||
            address ||
            `위도 ${point.lat.toFixed(5)}, 경도 ${point.lng.toFixed(5)}`,
        });
        setLocationStatus('done');
      } catch {
        if (!cancelled) setLocationStatus('failed');
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 사진 없이 직접 진입 시 1단계로 (단, 등록 완료 후 리셋으로 인한 튕김은 제외)
  useEffect(() => {
    if (!draft.imageDataUrl && !submittedRef.current) {
      router.replace('/report/new');
    }
  }, [draft.imageDataUrl, router]);

  if (!draft.imageDataUrl && !submittedRef.current) {
    return null;
  }

  const finalHazard =
    hazardSelect === HAZARD_ETC ? hazardCustom.trim() : hazardSelect;
  const canSubmit = Boolean(
    finalHazard && draft.title.trim() && draft.location,
  );

  const onHazardSelect = (value: string) => {
    setHazardSelect(value);
    if (value !== HAZARD_ETC) {
      patch({ hazardType: value, category: categoryForHazard(value) });
    } else {
      patch({
        hazardType: hazardCustom.trim(),
        category: categoryForHazard(HAZARD_ETC),
      });
    }
  };

  const onHazardCustom = (value: string) => {
    setHazardCustom(value);
    patch({
      hazardType: value.trim(),
      category: categoryForHazard(HAZARD_ETC),
    });
  };

  const onSubmit = async () => {
    if (!finalHazard || !draft.title.trim()) {
      setError('위험 유형과 제목을 입력해주세요.');
      return;
    }
    if (!draft.location) {
      setError('위치를 확인할 수 없어요. 위치 권한을 허용해주세요.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await createReport({
        draft: { ...draft, hazardType: finalHazard },
        authorId: user?.id ?? 'guest',
        authorNickname: user?.nickname ?? '익명',
      });
      // 리셋으로 인한 가드 리다이렉트를 막고 상세로 이동
      submittedRef.current = true;
      router.replace(`/report/${created.id}`);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록에 실패했습니다.');
      setSubmitting(false);
    }
  };

  const applyAiExample = () => {
    if (aiSuggestion) {
      patch({
        title: aiSuggestion.title,
        description: aiSuggestion.description,
      });
    }
  };

  const risk = draft.risk;
  const riskColor = riskMeta(risk).color;

  return (
    <AppLayout withNav={false}>
      <TopBar
        subtitle="신고 작성 · 2/2"
        title="위험 정보 입력"
        showBack
        onBack={() => router.push('/report/new')}
      />

      <div className="flex flex-col gap-5 px-5 py-4">
        {/* 첨부 사진 */}
        <Field label="첨부된 현장 사진">
          <div className="flex items-center gap-3">
            <img
              src={draft.imageDataUrl ?? undefined}
              alt=""
              className="h-16 w-16 rounded-xl object-cover"
            />
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-ink">
                카메라로 촬영한 사진
              </p>
            </div>
            <button
              onClick={() => router.push('/report/new')}
              className="rounded-full bg-black/[0.05] px-3 py-1.5 text-[12px] font-semibold text-ink-muted"
            >
              변경
            </button>
          </div>
        </Field>

        {/* 위험 유형 — 드롭다운 + 기타 직접 입력 */}
        <Field label="위험 유형" aiHint={!!aiSuggestion}>
          <select
            value={hazardSelect}
            onChange={(e) => onHazardSelect(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-black/10 bg-surface px-4 py-3.5 text-[15px] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            <option value="" disabled>
              위험 유형을 선택하세요
            </option>
            {HAZARD_TYPES.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          {hazardSelect === HAZARD_ETC && (
            <input
              value={hazardCustom}
              onChange={(e) => onHazardCustom(e.target.value)}
              placeholder="위험 유형을 직접 입력하세요"
              className="mt-2 w-full rounded-2xl border border-black/10 bg-surface px-4 py-3.5 text-[15px] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          )}
        </Field>

        {/* 위치 */}
        <Field label="위치">
          <div className="flex items-start gap-2 rounded-2xl border border-black/10 bg-surface p-3">
            <Icon name="map-pin" size={18} className="mt-0.5 text-brand-dark" />
            <div className="flex-1">
              <input
                value={draft.address}
                onChange={(e) => patch({ address: e.target.value })}
                className="w-full bg-transparent text-[14px] font-semibold text-ink outline-none"
                placeholder={
                  locationStatus === 'loading'
                    ? '현재 위치 확인 중...'
                    : '주소를 입력하세요'
                }
              />
              <p className="mt-0.5 text-[11px] text-ink-muted">
                {locationStatus === 'loading' && '기기 GPS로 현재 위치를 확인하고 있어요'}
                {locationStatus === 'done' && '현재 위치(GPS) 기준으로 설정됨 · 주소 수정 가능'}
                {locationStatus === 'failed' &&
                  '위치를 가져올 수 없어요. 위치 권한을 허용해주세요. (HTTPS/localhost 필요)'}
              </p>
            </div>
          </div>
        </Field>

        {/* 위험도 — 1~10 정수 */}
        <Field label={`위험도 (${RISK_MIN}~${RISK_MAX})`}>
          <div className="flex items-center gap-3">
            <select
              value={risk}
              onChange={(e) => patch({ risk: Number(e.target.value) })}
              className="w-24 appearance-none rounded-2xl border border-black/10 bg-surface px-4 py-3.5 text-center text-[15px] font-bold text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {RISK_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span
              className="rounded-full px-3 py-1 text-[13px] font-bold text-white"
              style={{ backgroundColor: riskColor }}
            >
              {risk}/10
            </span>
          </div>
        </Field>

        {/* 제목 */}
        <Field label="신고 제목">
          <input
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="예: 파손된 보도블록, 보행 주의"
            className="w-full rounded-2xl border border-black/10 bg-surface px-4 py-3.5 text-[15px] text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </Field>

        {/* 상세 설명 */}
        <Field
          label="상세 설명"
          action={
            aiSuggestion && (
              <button
                onClick={applyAiExample}
                className="flex items-center gap-1 rounded-full bg-brand-light px-2.5 py-1 text-[11px] font-bold text-brand-dark"
              >
                <Icon name="sparkles" size={13} />
                AI 예시 적용
              </button>
            )
          }
        >
          <textarea
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
            rows={4}
            placeholder="어떤 위험인지 구체적으로 알려주세요."
            className="w-full resize-none rounded-2xl border border-black/10 bg-surface px-4 py-3.5 text-[15px] leading-relaxed text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <p className="mt-1.5 text-[11px] text-ink-faint">
            개인정보가 드러나는 내용은 입력하지 마세요.
          </p>
        </Field>

        {error && <p className="text-sm font-medium text-risk-high">{error}</p>}

        <Button
          size="lg"
          fullWidth
          loading={submitting}
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          신고 등록하기
        </Button>
      </div>
    </AppLayout>
  );
}

function Field({
  label,
  children,
  action,
  aiHint,
}: {
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  aiHint?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[14px] font-bold text-ink">
          {label}
          {aiHint && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-brand-dark">
              <Icon name="sparkles" size={11} />
              AI 추천
            </span>
          )}
        </span>
        {action}
      </div>
      {children}
    </div>
  );
}
