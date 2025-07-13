import { v4 as uuidv4 } from "uuid";
import { ImageBoxData } from "../../core/types/ImageBoxData";

interface Point {
  x: number;
  y: number;
}

interface Color {
  r: number;
  g: number;
  b: number;
}

interface ConnectedComponent {
  points: Point[];
  color: Color;
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export const findColorIslands = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  minSegmentSize: number,
  colorThreshold: number = 10
): ConnectedComponent[] => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const visited = new Set<string>();
  const components: ConnectedComponent[] = [];

  console.log("Width and Height is", width, height);

  const colorKey = (x: number, y: number): string => `${x},${y}`;

  const getPixel = (x: number, y: number): Color => {
    const idx = (y * width + x) * 4;
    return {
      r: imageData.data[idx],
      g: imageData.data[idx + 1],
      b: imageData.data[idx + 2],
    };
  };

  const colorsMatch = (c1: Color, c2: Color): boolean => {
    return (
      Math.abs(c1.r - c2.r) <= colorThreshold &&
      Math.abs(c1.g - c2.g) <= colorThreshold &&
      Math.abs(c1.b - c2.b) <= colorThreshold
    );
  };

  const labelComponent = (startX: number, startY: number) => {
    const startColor = getPixel(startX, startY);
    const points: Point[] = [];
    const queue: Point[] = [{ x: startX, y: startY }];
    const boundingBox = {
      minX: startX,
      minY: startY,
      maxX: startX,
      maxY: startY,
    };

    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      const key = colorKey(x, y);

      if (visited.has(key)) continue;

      const currentColor = getPixel(x, y);
      if (!colorsMatch(startColor, currentColor)) continue;

      visited.add(key);
      points.push({ x, y });

      boundingBox.minX = Math.min(boundingBox.minX, x);
      boundingBox.minY = Math.min(boundingBox.minY, y);
      boundingBox.maxX = Math.max(boundingBox.maxX, x);
      boundingBox.maxY = Math.max(boundingBox.maxY, y);

      const neighbors = [
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 },
      ];

      for (const neighbor of neighbors) {
        if (
          neighbor.x >= 0 &&
          neighbor.x < width &&
          neighbor.y >= 0 &&
          neighbor.y < height &&
          !visited.has(colorKey(neighbor.x, neighbor.y))
        ) {
          queue.push(neighbor);
        }
      }
    }

    if (points.length >= minSegmentSize) {
      components.push({ points, color: startColor, boundingBox });
    }
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!visited.has(colorKey(x, y))) {
        labelComponent(x, y);
      }
    }
  }

  return components;
};

const MIN_BOX_SIZE = 1; // Minimum size in pixels for image boxes

export const createImageBoxesFromSegments = (
  components: ConnectedComponent[],
  canvasWidth: number,
  canvasHeight: number,
  sourceImage: HTMLImageElement,
  sourceImageUrl: string // Add URL parameter
): ImageBoxData[] => {
  // Calculate scale and position just like in CanvasSelection
  const scale = Math.min(800 / sourceImage.width, 600 / sourceImage.height);
  const scaledWidth = sourceImage.width * scale;
  const scaledHeight = sourceImage.height * scale;
  const offsetX = (800 - scaledWidth) / 2;
  const offsetY = (600 - scaledHeight) / 2;

  return components
    .filter((component) => {
      // Add strict size validation
      const width = component.boundingBox.maxX - component.boundingBox.minX;
      const height = component.boundingBox.maxY - component.boundingBox.minY;
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;
      return scaledWidth >= MIN_BOX_SIZE && scaledHeight >= MIN_BOX_SIZE;
    })
    .map((component) => {
      const { boundingBox, color } = component;

      // Create a temporary canvas for the segment
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d")!;
      const width = boundingBox.maxX - boundingBox.minX;
      const height = boundingBox.maxY - boundingBox.minY;

      tempCanvas.width = width;
      tempCanvas.height = height;

      // Draw just this segment
      tempCtx.drawImage(
        sourceImage,
        boundingBox.minX,
        boundingBox.minY,
        width,
        height,
        0,
        0,
        width,
        height
      );

      // Transform coordinates from source image space to canvas display space
      // Now using pixel coordinates instead of normalized coordinates
      const topLeft = {
        x: boundingBox.minX * scale + offsetX,
        y: boundingBox.minY * scale + offsetY,
      };
      const bottomRight = {
        x: boundingBox.maxX * scale + offsetX,
        y: boundingBox.maxY * scale + offsetY,
      };

      return {
        id: uuidv4(),
        label: `RGB(${color.r},${color.g},${color.b})`,
        type: "ImageBox",
        description: `Size: ${component.points.length} pixels`,
        imageUrl: sourceImageUrl, // Use the provided source image URL
        topLeft,
        bottomRight,
        imageSource: tempCtx.getImageData(0, 0, width, height),
      };
    });
};
