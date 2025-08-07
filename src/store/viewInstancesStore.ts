import { create } from "zustand";

interface HtmlPageViewerInstance {
  tabId: string;
  resourceId: string;
  url: string;
  title: string;
  html: string;
  lastAccessed: number;
}

interface ViewInstancesState {
  htmlPageViewers: Map<string, HtmlPageViewerInstance>;

  // HTML Page Viewer methods
  createHtmlPageViewer: (
    tabId: string,
    resourceId: string,
    url: string,
    title: string
  ) => void;
  updateHtmlPageViewerContent: (tabId: string, html: string) => void;
  getHtmlPageViewer: (tabId: string) => HtmlPageViewerInstance | undefined;
  getAllHtmlPageViewers: () => HtmlPageViewerInstance[];
  removeHtmlPageViewer: (tabId: string) => void;
  updateLastAccessed: (tabId: string) => void;

  // Cleanup old instances (keep only last 10)
  cleanupOldInstances: () => void;
}

const useViewInstancesStore = create<ViewInstancesState>((set, get) => ({
  htmlPageViewers: new Map(),

  createHtmlPageViewer: (
    tabId: string,
    resourceId: string,
    url: string,
    title: string
  ) => {
    console.log(
      "ViewInstancesStore: Creating HTML page viewer for tabId:",
      tabId
    );
    set((state) => {
      const newHtmlPageViewers = new Map(state.htmlPageViewers);
      newHtmlPageViewers.set(tabId, {
        tabId,
        resourceId,
        url,
        title,
        html: "",
        lastAccessed: Date.now(),
      });
      return { htmlPageViewers: newHtmlPageViewers };
    });
  },

  updateHtmlPageViewerContent: (tabId: string, html: string) => {
    console.log(
      "ViewInstancesStore: Updating content for tabId:",
      tabId,
      "content length:",
      html.length
    );
    set((state) => {
      const newHtmlPageViewers = new Map(state.htmlPageViewers);
      const existing = newHtmlPageViewers.get(tabId);
      if (existing) {
        newHtmlPageViewers.set(tabId, {
          ...existing,
          html,
          lastAccessed: Date.now(),
        });
      }
      return { htmlPageViewers: newHtmlPageViewers };
    });
  },

  getHtmlPageViewer: (tabId: string) => {
    const instance = get().htmlPageViewers.get(tabId);
    console.log(
      "ViewInstancesStore: Getting HTML page viewer for tabId:",
      tabId,
      "found:",
      !!instance
    );
    if (instance) {
      // Update last accessed time
      set((state) => {
        const newHtmlPageViewers = new Map(state.htmlPageViewers);
        newHtmlPageViewers.set(tabId, {
          ...instance,
          lastAccessed: Date.now(),
        });
        return { htmlPageViewers: newHtmlPageViewers };
      });
    }
    return instance;
  },

  getAllHtmlPageViewers: () => {
    return Array.from(get().htmlPageViewers.values());
  },

  removeHtmlPageViewer: (tabId: string) => {
    console.log(
      "ViewInstancesStore: Removing HTML page viewer for tabId:",
      tabId
    );
    set((state) => {
      const newHtmlPageViewers = new Map(state.htmlPageViewers);
      newHtmlPageViewers.delete(tabId);
      return { htmlPageViewers: newHtmlPageViewers };
    });
  },

  updateLastAccessed: (tabId: string) => {
    set((state) => {
      const newHtmlPageViewers = new Map(state.htmlPageViewers);
      const existing = newHtmlPageViewers.get(tabId);
      if (existing) {
        newHtmlPageViewers.set(tabId, {
          ...existing,
          lastAccessed: Date.now(),
        });
      }
      return { htmlPageViewers: newHtmlPageViewers };
    });
  },

  cleanupOldInstances: () => {
    set((state) => {
      const instances = Array.from(state.htmlPageViewers.values());
      if (instances.length > 10) {
        // Sort by last accessed and keep only the 10 most recent
        const sorted = instances.sort(
          (a, b) => b.lastAccessed - a.lastAccessed
        );
        const toKeep = sorted.slice(0, 10);
        const newHtmlPageViewers = new Map();
        toKeep.forEach((instance) => {
          newHtmlPageViewers.set(instance.tabId, instance);
        });
        console.log(
          "ViewInstancesStore: Cleaned up old instances, kept:",
          toKeep.length
        );
        return { htmlPageViewers: newHtmlPageViewers };
      }
      return state;
    });
  },
}));

export default useViewInstancesStore;
