import React, { useCallback, useEffect, useRef, useState } from "react";
import "./ResizableSplitter.css";

interface ResizableSplitterProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftPanelWidth: number;
  onWidthChange: (width: number) => void;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  splitterWidth?: number;
  className?: string;
}

const ResizableSplitter: React.FC<ResizableSplitterProps> = ({
  leftPanel,
  rightPanel,
  leftPanelWidth,
  onWidthChange,
  minLeftWidth = 200,
  maxLeftWidth = 600,
  splitterWidth = 6,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitterRef = useRef<HTMLDivElement>(null);

  // Use refs to avoid re-renders during drag
  const dragStateRef = useRef({
    startX: 0,
    startWidth: 0,
    isDragging: false,
  });

  // Throttle width updates using requestAnimationFrame
  const rafRef = useRef<number | null>(null);
  const pendingWidthRef = useRef<number | null>(null);

  const updateWidth = useCallback(
    (newWidth: number) => {
      pendingWidthRef.current = newWidth;

      if (rafRef.current) {
        return; // Already scheduled
      }

      rafRef.current = requestAnimationFrame(() => {
        if (pendingWidthRef.current !== null) {
          onWidthChange(pendingWidthRef.current);
          pendingWidthRef.current = null;
        }
        rafRef.current = null;
      });
    },
    [onWidthChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      dragStateRef.current = {
        startX: e.clientX,
        startWidth: leftPanelWidth,
        isDragging: true,
      };

      setIsDragging(true);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [leftPanelWidth]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragStateRef.current.isDragging) return;

      const deltaX = e.clientX - dragStateRef.current.startX;
      const newWidth = Math.max(
        minLeftWidth,
        Math.min(maxLeftWidth, dragStateRef.current.startWidth + deltaX)
      );

      updateWidth(newWidth);
    },
    [minLeftWidth, maxLeftWidth, updateWidth]
  );

  const handleMouseUp = useCallback(() => {
    dragStateRef.current.isDragging = false;
    setIsDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove, {
        passive: true,
      });
      document.addEventListener("mouseup", handleMouseUp, { passive: true });
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`resizable-splitter-container ${className}`}
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        className="resizable-splitter-left-panel"
        style={{
          width: `${leftPanelWidth}px`,
          minWidth: `${minLeftWidth}px`,
          maxWidth: `${maxLeftWidth}px`,
          flexShrink: 0,
        }}
      >
        {leftPanel}
      </div>
      <div
        ref={splitterRef}
        className={`resizable-splitter-handle ${isDragging ? "dragging" : ""}`}
        style={{
          width: `${splitterWidth}px`,
          flexShrink: 0,
          cursor: "col-resize",
        }}
        onMouseDown={handleMouseDown}
      />
      <div
        className="resizable-splitter-right-panel"
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {rightPanel}
      </div>
    </div>
  );
};

export default ResizableSplitter;
