import type {
  Report,
  Comment,
  CategoryId,
  SortKey,
  ReportDraft,
} from '@/types';
import { ApiError, delay, genId } from './http';
import { mockDb } from './mockDb';

// 신고 게시물 API — 목업 구현. 서버 연동 시 이 파일만 교체.

export interface ListParams {
  category?: CategoryId | null; // null/undefined = 전체
  sort?: SortKey;
  query?: string;
}

export async function listReports(params: ListParams = {}): Promise<Report[]> {
  const { category, sort = 'latest', query } = params;
  let items = [...mockDb.reports];

  if (category) items = items.filter((r) => r.category === category);

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    items = items.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q),
    );
  }

  items.sort((a, b) => {
    if (sort === 'views') return b.viewCount - a.viewCount;
    if (sort === 'likes') return b.likeCount - a.likeCount;
    // latest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return delay(items);
}

export async function getReport(id: string): Promise<Report> {
  const found = mockDb.reports.find((r) => r.id === id);
  if (!found) throw new ApiError('신고를 찾을 수 없습니다.', 404);
  // 조회수 증가
  found.viewCount += 1;
  mockDb.commit();
  return delay({ ...found });
}

export async function listMyReports(authorId: string): Promise<Report[]> {
  const items = mockDb.reports
    .filter((r) => r.authorId === authorId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  return delay(items);
}

export interface CreateReportInput {
  draft: ReportDraft;
  authorId: string;
  authorNickname: string;
}

export async function createReport({
  draft,
  authorId,
  authorNickname,
}: CreateReportInput): Promise<Report> {
  if (!draft.category) throw new ApiError('위험 유형을 선택해주세요.', 400);
  if (!draft.location) throw new ApiError('위치 정보가 필요합니다.', 400);

  const report: Report = {
    id: genId('r'),
    category: draft.category,
    risk: draft.risk,
    title: draft.title.trim() || '제목 없는 신고',
    description: draft.description.trim(),
    address: draft.address,
    location: draft.location,
    imageUrl: draft.imageDataUrl,
    authorId,
    authorNickname,
    createdAt: new Date().toISOString(),
    viewCount: 0,
    likeCount: 0,
    likedByMe: false,
    commentCount: 0,
  };
  mockDb.reports.unshift(report);
  mockDb.commit();
  return delay(report);
}

export async function toggleLike(id: string): Promise<Report> {
  const found = mockDb.reports.find((r) => r.id === id);
  if (!found) throw new ApiError('신고를 찾을 수 없습니다.', 404);
  found.likedByMe = !found.likedByMe;
  found.likeCount += found.likedByMe ? 1 : -1;
  mockDb.commit();
  return delay({ ...found });
}

export async function deleteReport(id: string): Promise<void> {
  const idx = mockDb.reports.findIndex((r) => r.id === id);
  if (idx !== -1) {
    mockDb.reports.splice(idx, 1);
    mockDb.commit();
  }
  return delay(undefined);
}

export async function updateReport(
  id: string,
  patch: Partial<Pick<Report, 'title' | 'description' | 'category' | 'risk'>>,
): Promise<Report> {
  const found = mockDb.reports.find((r) => r.id === id);
  if (!found) throw new ApiError('신고를 찾을 수 없습니다.', 404);
  Object.assign(found, patch);
  mockDb.commit();
  return delay({ ...found });
}

/** 게시물 신고하기 (부적절 콘텐츠 신고) — 목업은 접수만 */
export async function flagReport(id: string, _reason?: string): Promise<void> {
  void id;
  void _reason;
  return delay(undefined);
}

// --- 댓글 ---

export async function listComments(reportId: string): Promise<Comment[]> {
  const items = mockDb.comments
    .filter((c) => c.reportId === reportId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  return delay(items);
}

export async function addComment(
  reportId: string,
  authorNickname: string,
  content: string,
): Promise<Comment> {
  const comment: Comment = {
    id: genId('c'),
    reportId,
    authorNickname,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
  mockDb.comments.push(comment);
  const report = mockDb.reports.find((r) => r.id === reportId);
  if (report) report.commentCount += 1;
  mockDb.commit();
  return delay(comment);
}
