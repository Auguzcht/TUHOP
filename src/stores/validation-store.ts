import { create } from "zustand";

type SeverityFilter = "all" | "low" | "moderate" | "high";

interface ValidationState {
  severityFilter: SeverityFilter;
  districtFilters: string[];
  searchQuery: string;
  page: number;
  /** Report IDs the validator has opened but not yet completed */
  viewedReports: Set<string>;
  setSeverityFilter: (filter: SeverityFilter) => void;
  toggleDistrict: (name: string) => void;
  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;
  markViewed: (reportId: string) => void;
  resetFilters: () => void;
}

export const useValidationStore = create<ValidationState>((set) => ({
  severityFilter: "all",
  districtFilters: [],
  searchQuery: "",
  page: 1,
  viewedReports: new Set(),
  setSeverityFilter: (filter) => set({ severityFilter: filter, page: 1 }),
  toggleDistrict: (name) =>
    set((state) => {
      const exists = state.districtFilters.includes(name);
      return {
        districtFilters: exists
          ? state.districtFilters.filter((item) => item !== name)
          : [...state.districtFilters, name],
        page: 1,
      };
    }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setPage: (page) => set({ page }),
  markViewed: (reportId) =>
    set((state) => {
      const next = new Set(state.viewedReports);
      next.add(reportId);
      return { viewedReports: next };
    }),
  resetFilters: () =>
    set({
      severityFilter: "all",
      districtFilters: [],
      searchQuery: "",
      page: 1,
    }),
}));
