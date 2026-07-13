import type { Report, Comment } from '@/types';

// 시드(목업) 데이터 제거됨. 실제 신고는 사용자가 등록하거나 서버에서 받아온다.
// 서버 연동 전까지는 빈 상태로 시작한다.
export const MOCK_REPORTS: Report[] = [];

export const MOCK_COMMENTS: Comment[] = [];
