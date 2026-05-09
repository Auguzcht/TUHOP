import { create } from "zustand";

type SeverityFilter = "all" | "low" | "moderate" | "high";

interface ValidationState {
	severityFilter: SeverityFilter;
	districtFilters: string[];
	searchQuery: string;
	setSeverityFilter: (filter: SeverityFilter) => void;
	toggleDistrict: (name: string) => void;
	setSearchQuery: (query: string) => void;
	resetFilters: () => void;
}

export const useValidationStore = create<ValidationState>((set) => ({
	severityFilter: "all",
	districtFilters: [],
	searchQuery: "",
	setSeverityFilter: (filter) => set({ severityFilter: filter }),
	toggleDistrict: (name) =>
		set((state) => {
			const exists = state.districtFilters.includes(name);
			return {
				districtFilters: exists
					? state.districtFilters.filter((item) => item !== name)
					: [...state.districtFilters, name],
			};
		}),
	setSearchQuery: (query) => set({ searchQuery: query }),
	resetFilters: () =>
		set({ severityFilter: "all", districtFilters: [], searchQuery: "" }),
}));
