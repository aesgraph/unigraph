import { create } from "zustand";

interface HtmlPageViewerState {
  // Cache of HTML content by tab ID
  contentCache: Record<
    string,
    {
      html: string;
      url: string;
      title: string;
      resourceId: string;
      timestamp: number;
    }
  >;

  // Loading states by tab ID
  loadingStates: Record<string, boolean>;

  // Error states by tab ID
  errorStates: Record<string, string | null>;

  // Actions
  setContent: (
    tabId: string,
    content: {
      html: string;
      url: string;
      title: string;
      resourceId: string;
    }
  ) => void;

  getContent: (tabId: string) => {
    html: string;
    url: string;
    title: string;
    resourceId: string;
    timestamp: number;
  } | null;

  setLoading: (tabId: string, loading: boolean) => void;
  setError: (tabId: string, error: string | null) => void;

  // Check if content exists and is not stale (older than 1 hour)
  hasValidContent: (tabId: string) => boolean;

  // Clear cache for a specific tab or all tabs
  clearContent: (tabId?: string) => void;

  // Get all cached tab IDs
  getCachedTabIds: () => string[];
}

const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

export const useHtmlPageViewerStore = create<HtmlPageViewerState>(
  (set, get) => ({
    contentCache: {},
    loadingStates: {},
    errorStates: {},

    setContent: (tabId, content) => {
      set((state) => ({
        contentCache: {
          ...state.contentCache,
          [tabId]: {
            ...content,
            timestamp: Date.now(),
          },
        },
        loadingStates: {
          ...state.loadingStates,
          [tabId]: false,
        },
        errorStates: {
          ...state.errorStates,
          [tabId]: null,
        },
      }));
    },

    getContent: (tabId) => {
      const state = get();
      return state.contentCache[tabId] || null;
    },

    setLoading: (tabId, loading) => {
      set((state) => ({
        loadingStates: {
          ...state.loadingStates,
          [tabId]: loading,
        },
      }));
    },

    setError: (tabId, error) => {
      set((state) => ({
        errorStates: {
          ...state.errorStates,
          [tabId]: error,
        },
        loadingStates: {
          ...state.loadingStates,
          [tabId]: false,
        },
      }));
    },

    hasValidContent: (tabId) => {
      const state = get();
      const content = state.contentCache[tabId];
      if (!content) return false;

      const now = Date.now();
      return now - content.timestamp < CACHE_DURATION;
    },

    clearContent: (tabId) => {
      set((state) => {
        if (tabId) {
          const { [tabId]: removed, ...restCache } = state.contentCache;
          const { [tabId]: removedLoading, ...restLoading } =
            state.loadingStates;
          const { [tabId]: removedError, ...restError } = state.errorStates;

          return {
            contentCache: restCache,
            loadingStates: restLoading,
            errorStates: restError,
          };
        } else {
          return {
            contentCache: {},
            loadingStates: {},
            errorStates: {},
          };
        }
      });
    },

    getCachedTabIds: () => {
      const state = get();
      return Object.keys(state.contentCache);
    },
  })
);
