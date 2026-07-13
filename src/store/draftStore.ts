import { create } from 'zustand';
import type { ReportDraft, AiSuggestion } from '@/types';

const emptyDraft: ReportDraft = {
  imageDataUrl: null,
  category: null,
  risk: 'mid',
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

  applyAi: (aiSuggestion) =>
    set((s) => ({
      aiSuggestion,
      draft: {
        ...s.draft,
        category: s.draft.category ?? aiSuggestion.category,
        risk: aiSuggestion.risk,
        title: s.draft.title || aiSuggestion.title,
        description: s.draft.description || aiSuggestion.description,
        address: s.draft.address || aiSuggestion.address,
        location: s.draft.location ?? aiSuggestion.location,
      },
    })),

  patch: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),

  reset: () => set({ draft: { ...emptyDraft }, aiSuggestion: null }),
}));
