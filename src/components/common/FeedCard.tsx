'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Report } from '@/types';
import { Icon } from './Icon';
import { RiskBadge } from './Badges';
import { CATEGORY_MAP } from '@/constants/categories';
import { toggleLike } from '@/api/reports';
import { formatRelativeTime, formatCount } from '@/lib/format';

/**
 * 인스타그램 스타일 피드 카드.
 * 작성자 헤더 → 정사각 사진 → 액션(공감/댓글/공유) → 공감 수/캡션/위치 순.
 */
export function FeedCard({ report: initial }: { report: Report }) {
  const router = useRouter();
  const [report, setReport] = useState(initial);
  const [liking, setLiking] = useState(false);

  const goDetail = () => router.push(`/report/${report.id}`);

  const onLike = async () => {
    if (liking) return;
    setLiking(true);
    // 낙관적 업데이트
    setReport((r) => ({
      ...r,
      likedByMe: !r.likedByMe,
      likeCount: r.likeCount + (r.likedByMe ? -1 : 1),
    }));
    try {
      const updated = await toggleLike(report.id);
      setReport(updated);
    } catch {
      // 실패 시 롤백
      setReport((r) => ({
        ...r,
        likedByMe: !r.likedByMe,
        likeCount: r.likeCount + (r.likedByMe ? -1 : 1),
      }));
    } finally {
      setLiking(false);
    }
  };

  const onShare = async () => {
    const url = `${window.location.origin}/report/${report.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: report.title, url });
        return;
      } catch {
        /* 취소/미지원 시 아래 폴백 */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard 미지원 환경은 무시 */
    }
  };

  return (
    <article className="overflow-hidden rounded-card bg-surface shadow-card">
      {/* 작성자 헤더 */}
      <header className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light text-[13px] font-bold text-brand-dark">
          {report.authorNickname.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-ink">
            {report.authorNickname}
          </p>
          <p className="flex items-center gap-1 truncate text-[11px] text-ink-muted">
            <Icon name="map-pin" size={11} className="shrink-0" />
            <span className="truncate">{report.address}</span>
          </p>
        </div>
        <RiskBadge risk={report.risk} />
      </header>

      {/* 정사각 사진 */}
      <button
        onClick={goDetail}
        className="relative block aspect-square w-full"
        aria-label={`${report.title} 상세 보기`}
      >
        <FeedImage report={report} />
        {/* 이미지 위 오버레이 — 어떤 카테고리 색 위에서도 읽히도록 흰 pill 사용 */}
        <span className="absolute left-2 top-2 flex flex-wrap items-center gap-1">
          <span
            className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold shadow-sm"
            style={{ color: CATEGORY_MAP[report.category].color }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: CATEGORY_MAP[report.category].color }}
            />
            {CATEGORY_MAP[report.category].label}
          </span>
          {report.hazardType && (
            <span className="inline-flex items-center rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              {report.hazardType}
            </span>
          )}
        </span>
      </button>

      {/* 액션 바 */}
      <div className="flex items-center gap-4 px-3 pt-2.5">
        <button
          onClick={onLike}
          className={`flex items-center gap-1 ${
            report.likedByMe ? 'text-risk-high' : 'text-ink'
          }`}
          aria-label="공감"
        >
          <Icon name="heart" size={24} filled={report.likedByMe} />
        </button>
        <button
          onClick={goDetail}
          className="flex items-center gap-1 text-ink"
          aria-label="댓글"
        >
          <Icon name="message-circle" size={23} />
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-1 text-ink"
          aria-label="공유"
        >
          <Icon name="share" size={22} />
        </button>
      </div>

      {/* 공감 수 · 캡션 · 메타 */}
      <div className="px-3 pb-3 pt-1.5">
        <p className="text-[13px] font-bold text-ink">
          공감 {formatCount(report.likeCount)}
        </p>
        <p className="mt-1 text-[14px] leading-snug text-ink">
          <button onClick={goDetail} className="text-left">
            <span className="font-bold">{report.authorNickname}</span>{' '}
            <span className="font-semibold">{report.title}</span>
          </button>
        </p>
        {report.description && (
          <button
            onClick={goDetail}
            className="mt-0.5 line-clamp-2 block text-left text-[13px] leading-snug text-ink-muted"
          >
            {report.description}
          </button>
        )}
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-ink-faint">
          <span className="flex items-center gap-1">
            <Icon name="eye" size={12} /> 조회 {formatCount(report.viewCount)}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Icon name="message-circle" size={12} />{' '}
            {formatCount(report.commentCount)}
          </span>
          <span>·</span>
          <span>{formatRelativeTime(report.createdAt)}</span>
        </div>
      </div>
    </article>
  );
}

/** 사진이 있으면 사진을, 없으면 카테고리 색 배경 + 아이콘 플레이스홀더 */
function FeedImage({ report }: { report: Report }) {
  if (report.imageUrl) {
    return (
      <img
        src={report.imageUrl}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ backgroundColor: CATEGORY_MAP[report.category].color }}
    >
      <Icon name="siren" size={72} className="text-white/90" />
    </div>
  );
}
