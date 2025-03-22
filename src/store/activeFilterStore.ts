import { create } from "zustand";
import { FilterRuleDefinition } from "../components/filters/FilterRuleDefinition";

interface Filter {
  name?: string;
  description?: string;
  filterRules: FilterRuleDefinition[];
}

interface ActiveFiltersState {
  activeFilter: Filter | null;
  setActiveFilter: (activeFilter: Filter | null) => void;
  getActiveFilter: () => Filter | null;
}

const useActiveFilterStore = create<ActiveFiltersState>((set, get) => ({
  activeFilter: null,
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  getActiveFilter: () => get().activeFilter,
}));

export const setActiveFilter = (activeFilter: Filter | null) => {
  useActiveFilterStore.getState().setActiveFilter(activeFilter);
};

export const getActiveFilter = () => {
  return useActiveFilterStore.getState().getActiveFilter();
};

export default useActiveFilterStore;
