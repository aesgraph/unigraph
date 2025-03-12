import Tooltip from "@mui/material/Tooltip";
import React, { useCallback, useEffect, useRef, useState } from "react";

const colorNames: { [key: string]: string } = {
  "rgb(255, 0, 0)": "Red",
  "rgb(0, 255, 0)": "Green",
  "rgb(0, 0, 255)": "Blue",
  "rgb(255, 255, 0)": "Yellow",
  "rgb(0, 255, 255)": "Cyan",
  "rgb(255, 0, 255)": "Magenta",
  "rgb(0, 0, 0)": "Black",
  "rgb(255, 255, 255)": "White",
  // Add more color mappings as needed
};

const getColorName = (color: string): string => {
  const rgb = color.match(/\d+/g)?.map(Number);
  if (!rgb) return color;

  const [r, g, b] = rgb;

  // Calculate the closest color
  let closestColor = color;
  let closestDistance = Infinity;

  for (const [key, name] of Object.entries(colorNames)) {
    const [kr, kg, kb] = key.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const distance = Math.sqrt(
      Math.pow(r - kr, 2) + Math.pow(g - kg, 2) + Math.pow(b - kb, 2)
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      closestColor = name;
    }
  }

  return closestColor;
};

interface Point {
  x: number;
  y: number;
}

interface Segment {
  points: Point[];
  color: string;
}

interface Color {
  r: number;
  g: number;
  b: number;
}

interface ColorCluster {
  center: Color;
  points: Point[];
}

interface ZoomableCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  title: string;
  maxHeight?: number;
  width?: number;
  dominantColors: Color[];
  segments: Segment[];
  visibleSegments: boolean[];
}

const ZoomableCanvas: React.FC<ZoomableCanvasProps> = ({
  canvasRef,
  title,
  maxHeight = 600,
  width = 600,
  dominantColors,
  segments,
  visibleSegments,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    color: string;
  } | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;

    // Calculate scale to fit while maintaining aspect ratio
    const scaleX = (width - 40) / canvas.width;
    const scaleY = (maxHeight - 40) / canvas.height;
    const scale = Math.min(scaleX, scaleY);

    // Calculate dimensions after scaling
    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;

    // Calculate position to center
    const left = (width - scaledWidth) / 2;
    const top = (maxHeight - scaledHeight) / 2;

    // Update canvas styles
    Object.assign(canvas.style, {
      display: "block",
      position: "absolute",
      width: `${canvas.width}px`,
      height: `${canvas.height}px`,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
      left: `${left}px`,
      top: `${top}px`,
    });

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / scale;
      const y = (event.clientY - rect.top) / scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const radius = 5; // Increase the check radius
      let foundColor = null;

      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const pixel = ctx.getImageData(x + dx, y + dy, 1, 1).data;
          const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

          // Check if the pixel color matches any dominant color
          const dominantColor = dominantColors.find(
            (domColor) =>
              color === `rgb(${domColor.r}, ${domColor.g}, ${domColor.b})`
          );
          if (dominantColor) {
            foundColor = color;
            break;
          }
        }
        if (foundColor) break;
      }

      if (foundColor) {
        setTooltip({ x: event.clientX, y: event.clientY, color: foundColor });
      } else {
        setTooltip(null);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    return () => canvas.removeEventListener("mousemove", handleMouseMove);
  }, [
    canvasRef.current?.width,
    canvasRef.current?.height,
    width,
    maxHeight,
    dominantColors,
  ]);

  const drawSegment = (ctx: CanvasRenderingContext2D, segment: Segment) => {
    ctx.fillStyle = segment.color;
    segment.points.forEach((point) => {
      ctx.fillRect(point.x, point.y, 1, 1);
    });
  };

  const clearSegment = (ctx: CanvasRenderingContext2D, segment: Segment) => {
    segment.points.forEach((point) => {
      ctx.clearRect(point.x, point.y, 1, 1);
    });
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw visible segments
    segments.forEach((segment, index) => {
      if (visibleSegments[index]) {
        drawSegment(ctx, segment);
      }
    });
  }, [segments]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Update only the changed segment
    segments.forEach((segment, index) => {
      if (visibleSegments[index]) {
        drawSegment(ctx, segment);
      } else {
        clearSegment(ctx, segment);
      }
    });
  }, [visibleSegments]);

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
      </div>
      <div
        ref={containerRef}
        style={{
          width,
          height: maxHeight,
          border: "1px solid #ccc",
          position: "relative",
          backgroundColor: "#f5f5f5",
          overflow: "hidden",
        }}
      >
        <canvas ref={canvasRef} />
        {tooltip && (
          <Tooltip
            open={true}
            title={
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: tooltip.color,
                  borderRadius: "50%",
                }}
              />
            }
            placement="top"
            arrow
            style={{ position: "absolute", left: tooltip.x, top: tooltip.y }}
          >
            <div />
          </Tooltip>
        )}
      </div>
    </div>
  );
};

const ImageSegmenter: React.FC = () => {
  const [dominantColors, setDominantColors] = useState<Color[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [visibleSegments, setVisibleSegments] = useState<boolean[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [threshold, setThreshold] = useState(10);
  const CANVAS_WIDTH = 600; // Fixed canvas width
  const CANVAS_HEIGHT = 500; // Slightly reduced height for better screen fit

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set original dimensions on canvas
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      console.log("Image uploaded and drawn on canvas");
      findDominantColorsAndVisualize();
    };
    img.src = URL.createObjectURL(file);
  };

  const findDominantColorsAndVisualize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log("Image data retrieved from canvas", imageData);

    // Find dominant colors
    const colors = findDominantColors(imageData);
    console.log("Dominant colors found", colors);
    setDominantColors(colors);

    // Segment the image based on dominant colors
    const newSegments = segmentImage(imageData, colors);
    setSegments(newSegments);
    setVisibleSegments(new Array(newSegments.length).fill(true));
  }, [threshold]);

  const findDominantColors = (
    imageData: ImageData,
    maxColors: number = 8
  ): Color[] => {
    const colors: Color[] = [];
    const pixelCount = new Map<string, number>();

    // Sample every 4th pixel for performance
    for (let y = 0; y < imageData.height; y += 2) {
      for (let x = 0; x < imageData.width; x += 2) {
        const color = getPixelColor(imageData, x, y);
        // Quantize colors slightly to reduce noise
        const key = `${Math.round(color.r / 5) * 5},${Math.round(color.g / 5) * 5},${Math.round(color.b / 5) * 5}`;
        pixelCount.set(key, (pixelCount.get(key) || 0) + 1);
      }
    }

    console.log("Pixel count map", pixelCount);

    // Sort by frequency and get top colors
    const sortedColors = Array.from(pixelCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxColors)
      .map(([key]) => {
        const [r, g, b] = key.split(",").map(Number);
        return { r, g, b };
      });

    console.log("Sorted colors", sortedColors);
    return sortedColors;
  };

  const segmentImage = (imageData: ImageData, colors: Color[]): Segment[] => {
    const width = imageData.width;
    const height = imageData.height;
    const segments: Segment[] = [];

    colors.forEach((color) => {
      const points: Point[] = [];
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pixelColor = getPixelColor(imageData, x, y);
          if (colorsAreSimilar(pixelColor, color)) {
            points.push({ x, y });
          }
        }
      }
      segments.push({
        points,
        color: `rgb(${color.r}, ${color.g}, ${color.b})`,
      });
    });

    return segments;
  };

  const colorsAreSimilar = (color1: Color, color2: Color): boolean => {
    return colorDistance(color1, color2) <= threshold;
  };

  const colorDistance = (c1: Color, c2: Color): number => {
    return Math.sqrt(
      Math.pow(c1.r - c2.r, 2) +
        Math.pow(c1.g - c2.g, 2) +
        Math.pow(c1.b - c2.b, 2)
    );
  };

  const getPixelColor = (imageData: ImageData, x: number, y: number): Color => {
    const idx = (y * imageData.width + x) * 4;
    return {
      r: imageData.data[idx],
      g: imageData.data[idx + 1],
      b: imageData.data[idx + 2],
    };
  };

  const handleSegmentVisibilityChange = (index: number) => {
    setVisibleSegments((prev) => {
      const newVisibleSegments = [...prev];
      newVisibleSegments[index] = !newVisibleSegments[index];
      return newVisibleSegments;
    });
  };

  return (
    <div style={{ padding: "20px", display: "flex" }}>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: "20px" }}>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          <div style={{ marginTop: "10px" }}>
            <label>
              Color Threshold:
              <input
                type="range"
                min="1"
                max="50"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
              {threshold}
            </label>
            <button
              onClick={findDominantColorsAndVisualize}
              style={{ marginLeft: "10px" }}
            >
              Resegment
            </button>
          </div>
        </div>
        <ZoomableCanvas
          canvasRef={canvasRef}
          title="Image"
          maxHeight={CANVAS_HEIGHT}
          width={CANVAS_WIDTH}
          dominantColors={dominantColors}
          segments={segments}
          visibleSegments={visibleSegments}
        />
      </div>
      <div
        style={{
          marginLeft: "20px",
          maxHeight: CANVAS_HEIGHT,
          overflowY: "auto",
          flex: "0 0 200px",
        }}
      >
        <div style={{ marginBottom: "10px" }}>
          Found {dominantColors.length} dominant colors
        </div>
        {segments.map((segment, index) => (
          <div key={index}>
            <label>
              <input
                type="checkbox"
                checked={visibleSegments[index]}
                onChange={() => handleSegmentVisibilityChange(index)}
              />
              {getColorName(segment.color)}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageSegmenter;
