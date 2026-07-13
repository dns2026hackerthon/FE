import { create } from 'zustand';
import type { CategoryId, SortKey, ViewMode, FeedLayout } from '@/types';

interface UiState {
  viewMode: ViewMode; // 지도뷰 / 피드뷰
  feedLayout: FeedLayout; // 인스타 카드 피드 / 컴팩트 리스트
  category: CategoryId | null; // 선택된 카테고리 필터 (null = 전체)
  sort: SortKey;
  query: string;

  setViewMode: (v: ViewMode) => void;
  toggleViewMode: () => void;
  setFeedLayout: (l: FeedLayout) => void;
  setCategory: (c: CategoryId | null) => void;
  setSort: (s: SortKey) => void;
  setQuery: (q: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  viewMode: 'map',
  feedLayout: 'feed',
  category: null,
  sort: 'latest',
  query: '',

  setViewMode: (viewMode) => set({ viewMode }),
  toggleViewMode: () =>
    set((s) => ({ viewMode: s.viewMode === 'map' ? 'feed' : 'map' })),
  setFeedLayout: (feedLayout) => set({ feedLayout }),
  setCategory: (category) => set({ category }),
  setSort: (sort) => set({ sort }),
  setQuery: (query) => set({ query }),
}));
