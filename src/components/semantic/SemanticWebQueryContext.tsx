import React, { createContext, ReactNode, useContext, useState } from "react";

// Type for a query history entry
export interface QueryHistoryEntry {
  id: string;
  query: string;
  timestamp: Date;
  endpoint: string;
}

// Type for a single session's state
export interface SemanticWebQuerySessionState {
  query: string;
  history: QueryHistoryEntry[];
}

// Context value type
export interface SemanticWebQueryContextType {
  getSessionState: (
    sessionId: string
  ) => SemanticWebQuerySessionState | undefined;
  setSessionQuery: (sessionId: string, query: string) => void;
  addToHistory: (
    sessionId: string,
    query: string,
    endpoint: string,
    timestamp?: Date
  ) => void;
  getHistory: (sessionId: string) => QueryHistoryEntry[];
  clearHistory: (sessionId: string) => void;
}

export const SemanticWebQueryContext = createContext<
  SemanticWebQueryContextType | undefined
>(undefined);

export const SemanticWebQueryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Map of sessionId -> session state
  const [sessions, setSessions] = useState<
    Record<string, SemanticWebQuerySessionState>
  >({});

  const getSessionState = (sessionId: string) => sessions[sessionId];

  const setSessionQuery = (sessionId: string, query: string) => {
    setSessions((prev) => ({
      ...prev,
      [sessionId]: {
        ...(prev[sessionId] || { query: "", history: [] }),
        query,
      },
    }));
  };

  const addToHistory = (
    sessionId: string,
    query: string,
    endpoint: string,
    timestamp?: Date
  ) => {
    setSessions((prev) => ({
      ...prev,
      [sessionId]: {
        ...(prev[sessionId] || { query: "", history: [] }),
        history: [
          ...(prev[sessionId]?.history || []),
          {
            id: Date.now().toString(), // Simple ID generation
            query,
            timestamp: timestamp || new Date(),
            endpoint,
          },
        ],
      },
    }));
  };

  const getHistory = (sessionId: string) => {
    return sessions[sessionId]?.history || [];
  };

  const clearHistory = (sessionId: string) => {
    setSessions((prev) => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        history: [],
      },
    }));
  };

  return (
    <SemanticWebQueryContext.Provider
      value={{
        getSessionState,
        setSessionQuery,
        addToHistory,
        getHistory,
        clearHistory,
      }}
    >
      {children}
    </SemanticWebQueryContext.Provider>
  );
};

// Hook for use in SemanticWebQueryPanel
export function useSemanticWebQuerySession(sessionId: string) {
  const ctx = useContext(SemanticWebQueryContext);
  if (!ctx)
    throw new Error(
      "useSemanticWebQuerySession must be used within a SemanticWebQueryProvider"
    );
  const {
    getSessionState,
    setSessionQuery,
    addToHistory,
    getHistory,
    clearHistory,
  } = ctx;
  const state = getSessionState(sessionId) || { query: "", history: [] };
  return {
    query: state.query,
    setQuery: (q: string) => setSessionQuery(sessionId, q),
    history: state.history,
    addToHistory: (query: string, endpoint: string, timestamp?: Date) =>
      addToHistory(sessionId, query, endpoint, timestamp),
    getHistory: () => getHistory(sessionId),
    clearHistory: () => clearHistory(sessionId),
  };
}
