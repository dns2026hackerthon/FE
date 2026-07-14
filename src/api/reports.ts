import type {
  Report,
  Comment,
  CategoryId,
  SortKey,
  ReportDraft,
} from '@/types';
import { ApiError, USE_MOCK, delay, genId, request, requestJson } from './http';
import { mockDb } from './mockDb';
import { dataUrlToBlob } from '@/lib/image';

// 신고 게시물 API. USE_MOCK이면 목업, 아니면 실서버(request) 사용.
// 서버 연동 시 http.ts 상단에 정리된 REST 계약을 참고.

export interface ListParams {
  category?: CategoryId | null; // null/undefined = 전체
  hazardType?: string | null; // 세부 위험유형 필터 (부분 일치)
  sort?: SortKey;
  query?: string;
}

export async function listReports(params: ListParams = {}): Promise<Report[]> {
  const { category, hazardType, sort = 'latest', query } = params;

  if (!USE_MOCK) {
    const qs = new URLSearchParams();
    if (category) qs.set('category', category);
    if (hazardType?.trim()) qs.set('hazardType', hazardType.trim());
    if (sort) qs.set('sort', sort);
    if (query?.trim()) qs.set('query', query.trim());
    const suffix = qs.toString() ? `?${qs}` : '';
    return request<Report[]>(`/reports${suffix}`);
  }

  let items = [...mockDb.reports];

  if (category) items = items.filter((r) => r.category === category);

  if (hazardType && hazardType.trim()) {
    const h = hazardType.trim().toLowerCase();
    items = items.filter((r) => r.hazardType.toLowerCase().includes(h));
  }

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
  if (!USE_MOCK) {
    return request<Report>(`/reports/${id}`);
  }

  const found = mockDb.reports.find((r) => r.id === id);
  if (!found) throw new ApiError('신고를 찾을 수 없습니다.', 404);
  // 조회수 증가
  found.viewCount += 1;
  mockDb.commit();
  return delay({ ...found });
}

export async function listMyReports(authorId: string): Promise<Report[]> {
  if (!USE_MOCK) {
    return request<Report[]>('/reports/mine');
  }

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
  if (!draft.hazardType.trim())
    throw new ApiError('위험 유형을 선택해주세요.', 400);
  if (!draft.location) throw new ApiError('위치 정보가 필요합니다.', 400);

  if (!USE_MOCK) {
    const form = new FormData();
    if (draft.imageDataUrl) {
      const blob = await dataUrlToBlob(draft.imageDataUrl);
      form.append('image', blob, 'photo.jpg');
    }
    form.append('hazardType', draft.hazardType.trim());
    form.append('category', draft.category ?? 'safety');
    form.append('risk', String(draft.risk));
    form.append('title', draft.title.trim() || '제목 없는 신고');
    form.append('description', draft.description.trim());
    form.append('address', draft.address);
    form.append('lat', String(draft.location.lat));
    form.append('lng', String(draft.location.lng));
    return request<Report>('/reports', { method: 'POST', body: form });
  }

  const report: Report = {
    id: genId('r'),
    category: draft.category ?? 'safety',
    hazardType: draft.hazardType.trim(),
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
  if (!USE_MOCK) {
    return request<Report>(`/reports/${id}/like`, { method: 'POST' });
  }

  const found = mockDb.reports.find((r) => r.id === id);
  if (!found) throw new ApiError('신고를 찾을 수 없습니다.', 404);
  found.likedByMe = !found.likedByMe;
  found.likeCount += found.likedByMe ? 1 : -1;
  mockDb.commit();
  return delay({ ...found });
}

export async function deleteReport(id: string): Promise<void> {
  if (!USE_MOCK) {
    await request(`/reports/${id}`, { method: 'DELETE' });
    return;
  }

  const idx = mockDb.reports.findIndex((r) => r.id === id);
  if (idx !== -1) {
    mockDb.reports.splice(idx, 1);
    mockDb.commit();
  }
  return delay(undefined);
}

export async function updateReport(
  id: string,
  patch: Partial<
    Pick<Report, 'title' | 'description' | 'category' | 'hazardType' | 'risk'>
  >,
): Promise<Report> {
  if (!USE_MOCK) {
    return requestJson<Report>(`/reports/${id}`, 'PATCH', patch);
  }

  const found = mockDb.reports.find((r) => r.id === id);
  if (!found) throw new ApiError('신고를 찾을 수 없습니다.', 404);
  Object.assign(found, patch);
  mockDb.commit();
  return delay({ ...found });
}

/** 게시물 신고하기 (부적절 콘텐츠 신고) */
export async function flagReport(id: string, reason?: string): Promise<void> {
  if (!USE_MOCK) {
    await requestJson(`/reports/${id}/flag`, 'POST', { reason });
    return;
  }
  void id;
  void reason;
  return delay(undefined);
}

// --- 댓글 ---

export async function listComments(reportId: string): Promise<Comment[]> {
  if (!USE_MOCK) {
    return request<Comment[]>(`/reports/${reportId}/comments`);
  }

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
  if (!USE_MOCK) {
    return requestJson<Comment>(`/reports/${reportId}/comments`, 'POST', {
      content: content.trim(),
    });
  }

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
