// 도메인 타입 정의 — 추후 서버 API 응답과 1:1 매핑되는 것을 목표로 한다.

/** 위험 유형 카테고리 (전 화면 공통) */
export type CategoryId = 'walk' | 'road' | 'facility' | 'safety';

/** 위험도 */
export type RiskLevel = 'low' | 'mid' | 'high';

/** 위치 정보 */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/** 사용자 */
export interface User {
  id: string;
  username: string; // 아이디
  nickname: string; // 표시 이름 (예: 안심이웃님)
  profileImage?: string | null;
  isGuest?: boolean;
}

/** 댓글 */
export interface Comment {
  id: string;
  reportId: string;
  authorNickname: string;
  content: string;
  createdAt: string; // ISO
}

/** 위험 신고 게시물 */
export interface Report {
  id: string;
  category: CategoryId;
  risk: RiskLevel;
  title: string;
  description: string;
  address: string; // 사람이 읽는 주소
  location: GeoPoint;
  imageUrl?: string | null;
  authorId: string;
  authorNickname: string;
  createdAt: string; // ISO
  viewCount: number;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
}

/** 피드 정렬 기준 */
export type SortKey = 'latest' | 'views' | 'likes';

/** 메인 뷰 모드 */
export type ViewMode = 'map' | 'feed';

/** 피드 레이아웃 (리스트 / 그리드) */
export type FeedLayout = 'list' | 'grid';

/** 신고 작성 폼 데이터 */
export interface ReportDraft {
  imageDataUrl: string | null;
  category: CategoryId | null;
  risk: RiskLevel;
  address: string;
  location: GeoPoint | null;
  title: string;
  description: string;
}

/** AI 사진 분석 결과 (스텁 → 추후 서버 대체) */
export interface AiSuggestion {
  category: CategoryId;
  risk: RiskLevel;
  title: string;
  description: string;
  address: string;
  location: GeoPoint;
}
