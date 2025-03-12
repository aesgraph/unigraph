import React, { createContext, useContext, useState, useCallback } from "react";

interface MousePosition {
  x: number;
  y: number;
}

interface MousePositionContextProps {
  mousePosition: MousePosition;
  setMousePosition: (position: MousePosition) => void;
}

const MousePositionContext = createContext<
  MousePositionContextProps | undefined
>(undefined);

export const MousePositionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });

  const updateMousePosition = useCallback((position: MousePosition) => {
    setMousePosition(position);
  }, []);

  return (
    <MousePositionContext.Provider
      value={{ mousePosition, setMousePosition: updateMousePosition }}
    >
      {children}
    </MousePositionContext.Provider>
  );
};

export const useMousePosition = (): MousePositionContextProps => {
  const context = useContext(MousePositionContext);
  if (!context) {
    throw new Error(
      "useMousePosition must be used within a MousePositionProvider"
    );
  }
  return context;
};
