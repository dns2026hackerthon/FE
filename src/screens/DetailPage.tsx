'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import type { Report } from '@/types';
import {
  getReport,
  listComments,
  addComment,
  toggleLike,
  flagReport,
} from '@/api/reports';
import { useAsync } from '@/hooks/useAsync';
import { useAuthStore } from '@/store/authStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { TopBar } from '@/components/layout/TopBar';
import { Icon } from '@/components/common/Icon';
import { CategoryBadge, HazardBadge, RiskBadge } from '@/components/common/Badges';
import { Loading, EmptyState } from '@/components/common/State';
import { formatRelativeTime, formatShortRelative, formatCount } from '@/lib/format';

export default function DetailPage() {
  const params = useParams<{ id: string }>();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? '';
  const { user } = useAuthStore();

  const { data: initial, loading } = useAsync(() => getReport(id), [id]);
  const { data: comments, reload: reloadComments } = useAsync(
    () => listComments(id),
    [id],
  );

  const [report, setReport] = useState<Report | null>(null);
  const current = report ?? initial;

  const [commentText, setCommentText] = useState('');
  const [flagged, setFlagged] = useState(false);

  const onLike = async () => {
    if (!current) return;
    const updated = await toggleLike(current.id);
    setReport(updated);
  };

  const onSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !current) return;
    await addComment(current.id, user?.nickname ?? '익명', commentText.trim());
    setCommentText('');
    reloadComments();
    setReport((r) =>
      r ? { ...r, commentCount: r.commentCount + 1 } : r,
    );
  };

  const onFlag = async () => {
    if (!current || flagged) return;
    await flagReport(current.id);
    setFlagged(true);
  };

  if (loading && !current) {
    return (
      <AppLayout withNav={false}>
        <TopBar title="신고 상세" showBack />
        <Loading />
      </AppLayout>
    );
  }

  if (!current) {
    return (
      <AppLayout withNav={false}>
        <TopBar title="신고 상세" showBack />
        <EmptyState title="신고를 찾을 수 없어요" />
      </AppLayout>
    );
  }

  const commentList = comments ?? [];

  return (
    <AppLayout withNav={false}>
      <TopBar
        title="신고 상세"
        showBack
        right={
          <button
            onClick={onFlag}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
              flagged ? 'text-ink-faint' : 'text-risk-high'
            }`}
          >
            <Icon name="siren" size={15} />
            {flagged ? '신고됨' : '게시물 신고'}
          </button>
        }
      />

      {/* 사진 */}
      <div className="aspect-[4/3] w-full bg-black/5">
        {current.imageUrl ? (
          <img
            src={current.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-faint">
            <Icon name="image" size={40} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 px-4 py-4">
        {/* 유형 / 위험도 */}
        <div className="flex items-center gap-2">
          <CategoryBadge category={current.category} />
          <HazardBadge hazardType={current.hazardType} />
          <RiskBadge risk={current.risk} />
        </div>

        <h1 className="text-xl font-extrabold leading-snug text-ink">
          {current.title}
        </h1>

        {/* 위치 */}
        <div className="flex items-start gap-2 rounded-2xl bg-surface p-3 shadow-card">
          <Icon name="map-pin" size={18} className="mt-0.5 text-brand-dark" />
          <div>
            <p className="text-[14px] font-semibold text-ink">
              {current.address}
            </p>
            <p className="text-[11px] text-ink-muted">
              신고일 {formatRelativeTime(current.createdAt)}
            </p>
          </div>
        </div>

        {/* 설명 */}
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
          {current.description}
        </p>

        {/* 조회 / 공감 */}
        <div className="flex items-center gap-4 border-y border-black/5 py-3">
          <div className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Icon name="eye" size={18} />
            <span className="font-semibold">조회</span>
            <span>{formatCount(current.viewCount)}</span>
          </div>
          <button
            onClick={onLike}
            className={`flex items-center gap-1.5 text-sm font-semibold ${
              current.likedByMe ? 'text-risk-high' : 'text-ink-muted'
            }`}
          >
            <Icon name="heart" size={18} filled={current.likedByMe} />
            공감 <span>{formatCount(current.likeCount)}</span>
          </button>
        </div>

        {/* 댓글 */}
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-[15px] font-bold text-ink">
            <Icon name="message-circle" size={17} />
            댓글 <span className="text-brand-dark">{commentList.length}</span>
          </h2>

          {commentList.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-faint">
              첫 댓글을 남겨보세요.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {commentList.map((c) => (
                <li key={c.id} className="flex gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light text-[13px] font-bold text-brand-dark">
                    {c.authorNickname.slice(0, 1)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-ink">
                        {c.authorNickname}
                      </span>
                      <span className="text-[11px] text-ink-faint">
                        {formatShortRelative(c.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[14px] leading-relaxed text-ink">
                      {c.content}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* 댓글 입력 (하단 고정) */}
      <form
        onSubmit={onSubmitComment}
        className="safe-bottom sticky bottom-0 z-10 mx-auto flex w-full max-w-app items-center gap-2 border-t border-black/5 bg-surface/95 px-4 py-3 backdrop-blur"
      >
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="댓글 작성"
          className="h-11 flex-1 rounded-full bg-black/[0.04] px-4 text-[14px] text-ink outline-none placeholder:text-ink-faint"
        />
        <button
          type="submit"
          disabled={!commentText.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white disabled:opacity-40"
          aria-label="댓글 등록"
        >
          <Icon name="send" size={18} />
        </button>
      </form>
    </AppLayout>
  );
}
