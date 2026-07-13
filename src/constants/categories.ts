import type { CategoryId, RiskLevel } from '@/types';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  /** Tailwind 텍스트 색 클래스 */
  textClass: string;
  /** Tailwind 배경(연한) 클래스 */
  softBgClass: string;
  /** 마커/포인트용 hex */
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'walk',
    label: '보행 안전',
    textClass: 'text-cat-walk',
    softBgClass: 'bg-cat-walk/10',
    color: '#0D9488',
  },
  {
    id: 'road',
    label: '도로 위험',
    textClass: 'text-cat-road',
    softBgClass: 'bg-cat-road/10',
    color: '#EA580C',
  },
  {
    id: 'facility',
    label: '시설물',
    textClass: 'text-cat-facility',
    softBgClass: 'bg-cat-facility/10',
    color: '#7C3AED',
  },
  {
    id: 'safety',
    label: '치안',
    textClass: 'text-cat-safety',
    softBgClass: 'bg-cat-safety/10',
    color: '#DB2777',
  },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryMeta> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryId, CategoryMeta>,
);

/** 위험 유형 드롭다운 옵션. '기타' 선택 시 사용자가 직접 입력한다. */
export const HAZARD_TYPES = [
  '침수',
  '빙판길',
  '도로 파손',
  '싱크홀',
  '누전',
  '쓰러진 나무',
  '낙하물',
  '화재',
  '기타',
] as const;

export const HAZARD_ETC = '기타';

/** 위험 유형 → 지도/피드 필터용 카테고리 자동 매핑 */
const HAZARD_TO_CATEGORY: Record<string, CategoryId> = {
  침수: 'road',
  빙판길: 'road',
  '도로 파손': 'road',
  싱크홀: 'road',
  누전: 'facility',
  '쓰러진 나무': 'walk',
  낙하물: 'walk',
  화재: 'facility',
};

export function categoryForHazard(hazardType: string): CategoryId {
  return HAZARD_TO_CATEGORY[hazardType] ?? 'safety';
}

/** 위험도(1~10) 구간별 표시 정보 */
export function riskMeta(risk: RiskLevel): {
  textClass: string;
  color: string;
} {
  if (risk >= 8) return { textClass: 'text-risk-high', color: '#DC2626' };
  if (risk >= 4) return { textClass: 'text-risk-mid', color: '#D97706' };
  return { textClass: 'text-risk-low', color: '#16A34A' };
}

export const RISK_MIN = 1;
export const RISK_MAX = 10;
export const RISK_DEFAULT = 5;

/** 서울시청 근처 기본 좌표 (지도 초기 중심) — 실제 위치 실패 시 폴백 */
export const DEFAULT_CENTER = { lat: 37.6096, lng: 127.0175 }; // 성북구 근처
