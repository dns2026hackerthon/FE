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
  setImage: (dataUrl: string | null) => void;
  applyAi: (s: AiSuggestion) => void;
  patch: (p: Partial<ReportDraft>) => void;
  reset: () => void;
}

export const useDraftStore = create<DraftState>((set) => ({
  draft: { ...emptyDraft },
  aiSuggestion: null,

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

  reset: () => set({ draft: { ...emptyDraft }, aiSuggestion: null }),
}));
