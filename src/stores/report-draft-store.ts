import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ReportDraft = {
  postContent: string;
  floodDate: string;
  streetAddress: string;
  physicalReference: string;
  physicalReferenceText: string;
  mobilityImpact: string;
  mobilityImpactText: string;
  relevantComments: string;
};

type ReportDraftStore = {
  draft: ReportDraft;
  updateDraft: (fields: Partial<ReportDraft>) => void;
  clearDraft: () => void;
};

const defaultDraft: ReportDraft = {
  postContent: "",
  floodDate: new Date().toISOString().split("T")[0],
  streetAddress: "",
  physicalReference: "",
  physicalReferenceText: "",
  mobilityImpact: "",
  mobilityImpactText: "",
  relevantComments: "",
};

export const useReportDraftStore = create<ReportDraftStore>()(
  persist(
    (set) => ({
      draft: defaultDraft,
      updateDraft: (fields) =>
        set((state) => ({ draft: { ...state.draft, ...fields } })),
      clearDraft: () => set({ draft: defaultDraft }),
    }),
    {
      name: "tuhop-report-draft",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
