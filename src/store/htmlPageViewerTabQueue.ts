import { create } from "zustand";

interface HtmlPageViewerTabQueueState {
  tabQueue: string[];
  addTabId: (tabId: string) => void;
  getNextTabId: () => string | undefined;
  clearQueue: () => void;
}

const useHtmlPageViewerTabQueue = create<HtmlPageViewerTabQueueState>(
  (set, get) => ({
    tabQueue: [],

    addTabId: (tabId: string) => {
      console.log("TabQueue: Adding tabId:", tabId);
      set((state) => ({
        tabQueue: [...state.tabQueue, tabId],
      }));
    },

    getNextTabId: () => {
      const { tabQueue } = get();
      if (tabQueue.length > 0) {
        const nextTabId = tabQueue[0];
        console.log("TabQueue: Getting next tabId:", nextTabId);
        set((state) => ({
          tabQueue: state.tabQueue.slice(1),
        }));
        return nextTabId;
      }
      return undefined;
    },

    clearQueue: () => {
      console.log("TabQueue: Clearing queue");
      set({ tabQueue: [] });
    },
  })
);

export default useHtmlPageViewerTabQueue;
