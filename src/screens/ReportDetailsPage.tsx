'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CategoryId, RiskLevel } from '@/types';
import { useDraftStore } from '@/store/draftStore';
import { useAuthStore } from '@/store/authStore';
import { createReport } from '@/api/reports';
import { CATEGORIES, RISK_LEVELS, DEFAULT_CENTER } from '@/constants/categories';
import { AppLayout } from '@/components/layout/AppLayout';
import { TopBar } from '@/components/layout/TopBar';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';

export default function ReportDetailsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { draft, aiSuggestion, patch, reset } = useDraftStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 등록 완료 후 draft가 비워져도 1단계로 튕기지 않도록 하는 플래그
  const submittedRef = useRef(false);

  // 위치 기본값 세팅 (AI가 없을 때 폴백)
  useEffect(() => {
    if (!draft.location) {
      patch({
        location: DEFAULT_CENTER,
        address: draft.address || '서울시 성북구 정릉로 77',
      });
    }
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

  const canSubmit = Boolean(draft.category && draft.title.trim());

  const onSubmit = async () => {
    if (!canSubmit) {
      setError('위험 유형과 제목을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await createReport({
        draft,
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

        {/* 위험 유형 */}
        <Field label="위험 유형" aiHint={!!aiSuggestion}>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <CategoryChip
                key={c.id}
                id={c.id}
                label={c.label}
                color={c.color}
                selected={draft.category === c.id}
                onSelect={() => patch({ category: c.id })}
              />
            ))}
          </div>
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
                placeholder="주소를 입력하세요"
              />
              <p className="mt-0.5 text-[11px] text-ink-muted">
                현재 위치를 기준으로 설정됨 · 변경
              </p>
            </div>
          </div>
        </Field>

        {/* 위험도 */}
        <Field label="위험도">
          <div className="flex gap-2">
            {RISK_LEVELS.map((r) => (
              <RiskChip
                key={r.id}
                id={r.id}
                label={r.label}
                color={r.color}
                selected={draft.risk === r.id}
                onSelect={() => patch({ risk: r.id })}
              />
            ))}
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

function CategoryChip({
  id,
  label,
  color,
  selected,
  onSelect,
}: {
  id: CategoryId;
  label: string;
  color: string;
  selected: boolean;
  onSelect: () => void;
}) {
  void id;
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-[14px] font-semibold transition ${
        selected
          ? 'border-transparent bg-navy text-white'
          : 'border-black/10 bg-surface text-ink'
      }`}
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </button>
  );
}

function RiskChip({
  id,
  label,
  color,
  selected,
  onSelect,
}: {
  id: RiskLevel;
  label: string;
  color: string;
  selected: boolean;
  onSelect: () => void;
}) {
  void id;
  return (
    <button
      onClick={onSelect}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl border py-3 text-[14px] font-bold transition ${
        selected ? 'border-transparent text-white' : 'border-black/10 bg-surface text-ink-muted'
      }`}
      style={selected ? { backgroundColor: color } : undefined}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: selected ? '#fff' : color }}
      />
      {label}
    </button>
  );
}
