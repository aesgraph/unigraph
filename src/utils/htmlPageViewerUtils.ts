import { useHtmlPageViewerStore } from "../store/htmlPageViewerStore";

/**
 * Utility functions for HTML Page Viewer cache management
 */

export const getCacheStats = () => {
  const state = useHtmlPageViewerStore.getState();
  const cachedTabIds = state.getCachedTabIds();

  return {
    totalCached: cachedTabIds.length,
    cachedTabIds,
    cacheSize: Object.keys(state.contentCache).length,
    loadingStates: Object.keys(state.loadingStates).length,
    errorStates: Object.keys(state.errorStates).length,
  };
};

export const clearAllCache = () => {
  const { clearContent } = useHtmlPageViewerStore.getState();
  clearContent();
  console.log("Cleared all HTML Page Viewer cache");
};

export const getCacheForTab = (tabId: string) => {
  const { getContent, hasValidContent } = useHtmlPageViewerStore.getState();
  const content = getContent(tabId);

  return {
    hasContent: !!content,
    isValid: hasValidContent(tabId),
    content: content,
  };
};

export const debugCache = () => {
  const stats = getCacheStats();
  console.log("HTML Page Viewer Cache Stats:", stats);

  stats.cachedTabIds.forEach((tabId) => {
    const cacheInfo = getCacheForTab(tabId);
    console.log(`Tab ${tabId}:`, cacheInfo);
  });
};
