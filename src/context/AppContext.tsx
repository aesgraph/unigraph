import React, { createContext, useContext } from "react";
import { Entity } from "../core/model/entity/abstractEntity";

interface AppContextProps {
  setEditingEntity: (entity: Entity | null) => void;
  setJsonEditEntity: (entity: Entity | null) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppContextProvider: React.FC<{
  value: AppContextProps;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};
