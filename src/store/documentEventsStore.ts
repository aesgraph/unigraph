import { create } from "zustand";

export type DocumentEventType =
  | "document:created"
  | "document:renamed"
  | "document:deleted"
  | "document:updated";

export interface DocumentEvent {
  type: DocumentEventType;
  id?: string; // document id if known
  parentId?: string | null;
  projectId?: string | null;
  title?: string;
  extension?: string;
  timestamp: number;
  payload?: any;
}

interface DocumentEventsStore {
  lastEvent?: DocumentEvent;
  version: number; // incrementing counter clients can subscribe to
  emit: (event: Omit<DocumentEvent, "timestamp">) => void;
  getLastEvent: () => DocumentEvent | undefined;
}

export const useDocumentEventsStore = create<DocumentEventsStore>(
  (set, get) => ({
    lastEvent: undefined,
    version: 0,
    emit: (event) => {
      const full: DocumentEvent = { ...event, timestamp: Date.now() };
      set((state) => ({ lastEvent: full, version: state.version + 1 }));
    },
    getLastEvent: () => get().lastEvent,
  })
);

// Helper to emit events outside React
export const emitDocumentEvent = (event: Omit<DocumentEvent, "timestamp">) => {
  useDocumentEventsStore.getState().emit(event);
};

export default useDocumentEventsStore;
