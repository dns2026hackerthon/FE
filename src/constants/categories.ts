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

export interface RiskMeta {
  id: RiskLevel;
  label: string;
  textClass: string;
  bgClass: string;
  color: string;
}

export const RISK_LEVELS: RiskMeta[] = [
  {
    id: 'low',
    label: '낮음',
    textClass: 'text-risk-low',
    bgClass: 'bg-risk-low',
    color: '#16A34A',
  },
  {
    id: 'mid',
    label: '보통',
    textClass: 'text-risk-mid',
    bgClass: 'bg-risk-mid',
    color: '#D97706',
  },
  {
    id: 'high',
    label: '높음',
    textClass: 'text-risk-high',
    bgClass: 'bg-risk-high',
    color: '#DC2626',
  },
];

export const RISK_MAP: Record<RiskLevel, RiskMeta> = RISK_LEVELS.reduce(
  (acc, r) => {
    acc[r.id] = r;
    return acc;
  },
  {} as Record<RiskLevel, RiskMeta>,
);

/** 서울시청 근처 기본 좌표 (지도 초기 중심) — 실제 위치 실패 시 폴백 */
export const DEFAULT_CENTER = { lat: 37.6096, lng: 127.0175 }; // 성북구 근처
