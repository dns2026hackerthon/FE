import { create } from 'zustand';
import type { ReportDraft, AiSuggestion } from '@/types';
import { categoryForHazard, RISK_DEFAULT } from '@/constants/categories';

const emptyDraft: ReportDraft = {
  imageDataUrl: null,
  category: null,
  hazardType: '',
  risk: RISK_DEFAULT,
  address: '',
  location: null,
  title: '',
  description: '',
};

interface DraftState {
  draft: ReportDraft;
  aiSuggestion: AiSuggestion | null;
  /**
   * 방금 신고를 등록했는지 여부. 등록 직후 상세로 이동하고 draft를 비운 뒤에도
   * 남아, 상세에서 뒤로가기로 작성 화면(1/2단계)에 되돌아오면 그 화면이 홈(피드)로
   * 튕겨 보내는 데 사용한다. (등록 후 뒤로가기는 피드로 가야 함)
   */
  justSubmitted: boolean;
  setImage: (dataUrl: string | null) => void;
  applyAi: (s: AiSuggestion) => void;
  patch: (p: Partial<ReportDraft>) => void;
  reset: () => void;
  markSubmitted: () => void;
  clearSubmitted: () => void;
}

export const useDraftStore = create<DraftState>((set) => ({
  draft: { ...emptyDraft },
  aiSuggestion: null,
  justSubmitted: false,

  setImage: (imageDataUrl) =>
    set((s) => ({ draft: { ...s.draft, imageDataUrl } })),

  // AI는 위험 유형/위험도/제목/설명만 제안한다. 위치·주소는 기기 GPS에서 온다.
  applyAi: (aiSuggestion) =>
    set((s) => ({
      aiSuggestion,
      draft: {
        ...s.draft,
        hazardType: s.draft.hazardType || aiSuggestion.hazardType,
        category:
          s.draft.category ?? categoryForHazard(aiSuggestion.hazardType),
        risk: aiSuggestion.risk,
        title: s.draft.title || aiSuggestion.title,
        description: s.draft.description || aiSuggestion.description,
      },
    })),

  patch: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),

  // reset은 draft만 비운다. justSubmitted는 별도로 관리 (등록 직후 유지되어야 함).
  reset: () => set({ draft: { ...emptyDraft }, aiSuggestion: null }),
  markSubmitted: () => set({ justSubmitted: true }),
  clearSubmitted: () => set({ justSubmitted: false }),
}));
