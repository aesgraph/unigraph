import { create } from "zustand";
import { ObjectOf } from "../App";
import { FilterRuleDefinition } from "../components/filters/FilterRuleDefinition";
import { SceneGraph } from "../core/model/SceneGraph";

export interface Filter {
  name: string;
  description?: string;
  filterRules: FilterRuleDefinition[];
}

interface ActiveFiltersState {
  savedFilters: ObjectOf<Filter>;
  saveFilter: (filter: Filter) => void;
  deleteFilter: (filterName: string) => void;
  getSavedFilters: () => ObjectOf<Filter>;
  clearFilters: () => void;
}

const useActiveFilterStore = create<ActiveFiltersState>((set, get) => ({
  savedFilters: {},
  saveFilter: (filter) => {
    const savedFilters = { ...get().savedFilters };
    savedFilters[filter.name!] = filter;
    set({ savedFilters });
  },
  deleteFilter: (filterName) => {
    const savedFilters = { ...get().savedFilters };
    delete savedFilters[filterName];
    set({ savedFilters });
  },
  getSavedFilters: () => get().savedFilters,

  clearFilters: () => {
    set({ savedFilters: {} });
  },
}));

export const saveFilter = (filter: Filter) => {
  useActiveFilterStore.getState().saveFilter(filter);
};

export const deleteFilter = (filterName: string) => {
  useActiveFilterStore.getState().deleteFilter(filterName);
};

export const getSavedFilters = () => {
  return useActiveFilterStore.getState().getSavedFilters();
};

export const loadFiltersFromSceneGraph = (sceneGraph: SceneGraph) => {
  useActiveFilterStore.getState().clearFilters();
  const savedFilters = sceneGraph.getSavedFilters() ?? {};
  for (const filterName in savedFilters) {
    saveFilter(savedFilters[filterName]);
  }
};

export const saveFiltersToSceneGraph = (sceneGraph: SceneGraph) => {
  sceneGraph.clearFilters();
  const savedFilters = getSavedFilters();
  for (const filterName in savedFilters) {
    sceneGraph.saveFilter(filterName, savedFilters[filterName]);
  }
};

export const getFilterByName = (filterName: string) => {
  return getSavedFilters()[filterName];
};

export default useActiveFilterStore;
