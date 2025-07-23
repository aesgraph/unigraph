import React, { createContext, ReactNode, useContext, useState } from "react";

// Type for a single session's state
export interface SemanticWebQuerySessionState {
  query: string;
  // Add more fields as needed (results, history, etc)
}

// Context value type
export interface SemanticWebQueryContextType {
  getSessionState: (
    sessionId: string
  ) => SemanticWebQuerySessionState | undefined;
  setSessionQuery: (sessionId: string, query: string) => void;
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
        ...(prev[sessionId] || { query: "" }),
        query,
      },
    }));
  };

  return (
    <SemanticWebQueryContext.Provider
      value={{ getSessionState, setSessionQuery }}
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
  const { getSessionState, setSessionQuery } = ctx;
  const state = getSessionState(sessionId) || { query: "" };
  return {
    query: state.query,
    setQuery: (q: string) => setSessionQuery(sessionId, q),
  };
}
