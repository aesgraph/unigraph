import React, { useCallback, useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface Selection {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasSelectionProps {
  onImageLoad?: (image: HTMLImageElement) => void;
  sourceImage?: HTMLImageElement | null;
  width?: number;
  height?: number;
  onCaptureSelection: (
    imageData: ImageData,
    selection: { x: number; y: number; width: number; height: number }
  ) => void;
  onHighlightArea?: (handler: (areas: Area[] | null) => void) => void;
}

const CanvasSelection: React.FC<CanvasSelectionProps> = ({
  // eslint-disable-next-line unused-imports/no-unused-vars
  onImageLoad,
  sourceImage,
  width = 800,
  height = 600,
  onCaptureSelection,
  onHighlightArea,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isSelectionFinalized, setIsSelectionFinalized] =
    useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<Position | null>(null);
  const drawCanvasRef = useRef<() => void>(() => {});

  // Store drawCanvas function in a ref instead of as a callback
  useEffect(() => {
    drawCanvasRef.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, width, height);

      if (sourceImage) {
        const scale = Math.min(
          width / sourceImage.width,
          height / sourceImage.height
        );
        const imgWidth = sourceImage.width * scale;
        const imgHeight = sourceImage.height * scale;
        const x = (width - imgWidth) / 2;
        const y = (height - imgHeight) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(sourceImage, x, y, imgWidth, imgHeight);
      } else {
        ctx.fillStyle = "#333";
        ctx.font = "20px Arial";
        ctx.fillText("Load an image, then select areas", 20, 30);
      }
    };

    // Initial draw
    drawCanvasRef.current();
  }, [sourceImage, width, height]);

  const drawSelection = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Redraw the base canvas with image
    drawCanvasRef.current?.();

    // Draw selection rectangle
    if (selection) {
      ctx.strokeStyle = "#0066ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        selection.x,
        selection.y,
        selection.width,
        selection.height
      );

      // Semi-transparent fill
      ctx.fillStyle = "rgba(0, 102, 255, 0.1)";
      ctx.fillRect(selection.x, selection.y, selection.width, selection.height);
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Position => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPos(pos);
    setSelection(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    const currentPos = getMousePos(e);
    setMousePosition(currentPos);

    if (!isDrawing) return;

    setSelection({
      x: Math.min(startPos.x, currentPos.x),
      y: Math.min(startPos.y, currentPos.y),
      width: Math.abs(currentPos.x - startPos.x),
      height: Math.abs(currentPos.y - startPos.y),
    });

    drawSelection();
  };

  const handleMouseUp = (): void => {
    setIsDrawing(false);
    if (selection && selection.width > 0 && selection.height > 0) {
      setIsSelectionFinalized(true);
      console.log("Final selection:", selection);
    }
  };

  const handleMouseLeave = () => {
    setMousePosition(null);
    handleMouseUp();
  };

  const captureSelection = () => {
    if (!canvasRef.current || !selection) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create a temporary canvas for clean image capture
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // Draw only the base image without selection overlay
    const dpr = window.devicePixelRatio || 1;
    tempCtx.scale(dpr, dpr);
    if (sourceImage) {
      const scale = Math.min(
        width / sourceImage.width,
        height / sourceImage.height
      );
      const imgWidth = sourceImage.width * scale;
      const imgHeight = sourceImage.height * scale;
      const x = (width - imgWidth) / 2;
      const y = (height - imgHeight) / 2;

      tempCtx.drawImage(sourceImage, x, y, imgWidth, imgHeight);
    }

    try {
      // Capture the clean image data from the selection area
      const imageData = tempCtx.getImageData(
        selection.x * dpr,
        selection.y * dpr,
        selection.width * dpr,
        selection.height * dpr
      );
      onCaptureSelection(imageData, selection);
      setSelection(null);
      setIsSelectionFinalized(false);
    } catch (error) {
      console.error("Error capturing selection:", error);
    }
  };

  const drawHighlightPath = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      area: { x: number; y: number; width: number; height: number }
    ) => {
      const cornerX = width;
      const cornerY = 0;
      const targetX = area.x + area.width;
      const targetY = area.y;

      // Draw curved path from corner to highlight area
      ctx.beginPath();
      ctx.moveTo(cornerX, cornerY);
      ctx.strokeStyle = "rgba(255, 0, 204, 0.5)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]); // Create dashed line

      // Calculate control point for curve
      const controlX = cornerX;
      const controlY = targetY;

      ctx.bezierCurveTo(
        controlX,
        controlY, // Control point 1
        targetX + 50,
        targetY, // Control point 2
        targetX,
        targetY // End point
      );
      ctx.stroke();
      ctx.setLineDash([]); // Reset line style
    },
    [width]
  );

  const highlightArea = useCallback(
    (areas: Area[] | null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      drawCanvasRef.current?.();

      if (areas) {
        areas.forEach((area) => {
          // Draw highlight rectangle
          ctx.strokeStyle = "rgba(255, 0, 204, 0.49)";
          ctx.lineWidth = 2;
          ctx.strokeRect(area.x, area.y, area.width, area.height);
          ctx.fillStyle = "rgba(255, 0, 204, 0.1)";
          ctx.fillRect(area.x, area.y, area.width, area.height);

          // Draw connection path
          drawHighlightPath(ctx, area);
        });
      }
    },
    [drawHighlightPath]
  );

  // Register highlight handler once
  useEffect(() => {
    if (onHighlightArea) {
      onHighlightArea(highlightArea);
    }
  }, [highlightArea, onHighlightArea]); // Empty deps since highlightArea never changes

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 cursor-crosshair"
        onMouseDown={(e) => {
          setIsSelectionFinalized(false);
          handleMouseDown(e);
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      {selection && isSelectionFinalized && (
        <div
          style={{
            position: "absolute",
            left: selection.x + selection.width + 10,
            top: selection.y,
            zIndex: 10,
            backgroundColor: "white",
            padding: "8px",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div className="text-sm text-gray-600 mb-2">
            {Math.round(selection.width)} x {Math.round(selection.height)}
          </div>
          <button
            onClick={captureSelection}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Create Segment
          </button>
        </div>
      )}
      {mousePosition && (
        <div
          style={{
            position: "fixed",
            left: mousePosition.x + 20,
            top: mousePosition.y - 20,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          x: {Math.round(mousePosition.x)}, y: {Math.round(mousePosition.y)}
        </div>
      )}
    </div>
  );
};

export default CanvasSelection;
