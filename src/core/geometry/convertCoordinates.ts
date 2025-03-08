import { Vector3 } from "three";
import { Position } from "../layouts/layoutHelpers";

export const deviceToCanvasCoordinates = (
  deviceX: number,
  deviceY: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } => {
  const x = (deviceX + 1) * (canvasWidth / 2);
  const y = (1 - deviceY) * (canvasHeight / 2);
  return { x, y };
};

export const canvasToDeviceCoordinates = (
  canvasX: number,
  canvasY: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } => {
  const x = canvasX / (canvasWidth / 2) - 1;
  const y = 1 - canvasY / (canvasHeight / 2);
  return { x, y };
};

export const WINDOW_ASPECT_RATIO = () => {
  return window.innerWidth / window.innerHeight;
};

export type Dimension = {
  width: number;
  height: number;
};

export const scaleDeviceCoordinatesToImagePosition = (
  deviceCoordinates: Vector3,
  imageDimension: Dimension
): Position => {
  const x = ((deviceCoordinates.x + 1.5) / 3) * imageDimension.width;
  const y = ((1 - deviceCoordinates.y) / 2) * imageDimension.height;
  return { x, y };
};
