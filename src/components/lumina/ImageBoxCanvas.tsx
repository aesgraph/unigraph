import React, { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { scaleDeviceCoordinatesToImagePosition } from "../../core/geometry/convertCoordinates";
import { ImageBoxData } from "../../core/types/ImageBoxData";
import { images } from "./images";

interface ImageBoxCanvasProps {
  imageBoxData: ImageBoxData;
  size?: number;
  sourceImage?: HTMLImageElement;
}

export const getImageBoxCanvas = (
  imageBoxData: ImageBoxData,
  size?: number
) => {
  return <ImageBoxCanvas imageBoxData={imageBoxData} size={size} />;
};

const ImageBoxCanvas: React.FC<ImageBoxCanvasProps> = ({
  imageBoxData,
  size,
  sourceImage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maxCanvasSize = size;
  const [canvasSize, setCanvasSize] = React.useState({
    width: maxCanvasSize,
    height: maxCanvasSize,
  });

  useEffect(() => {
    const drawCanvas = (image: HTMLImageElement) => {
      const width = image.width;
      const height = image.height;
      const imageTopLeftPos = scaleDeviceCoordinatesToImagePosition(
        new Vector3(imageBoxData.topLeft.x, imageBoxData.topLeft.y, 0),
        { width, height }
      );
      const imageBottomRight = scaleDeviceCoordinatesToImagePosition(
        new Vector3(imageBoxData.bottomRight.x, imageBoxData.bottomRight.y, 0),
        { width, height }
      );

      const drawWidth = Math.abs(imageBottomRight.x - imageTopLeftPos.x);
      const drawHeight = Math.abs(imageBottomRight.y - imageTopLeftPos.y);

      const { scaledWidth, scaledHeight } = rescaleToFit(
        drawWidth,
        drawHeight,
        maxCanvasSize
      );
      setCanvasSize({ width: scaledWidth, height: scaledHeight });

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(
            image,
            imageTopLeftPos.x,
            imageTopLeftPos.y,
            drawWidth,
            drawHeight,
            0,
            0,
            canvas.width,
            canvas.height
          );
        }
      }
    };

    if (sourceImage) {
      if (sourceImage.complete) {
        drawCanvas(sourceImage);
      } else {
        sourceImage.onload = () => drawCanvas(sourceImage);
      }
    } else {
      const image = new Image();
      image.src = images[imageBoxData.imageUrl];
      image.onload = () => drawCanvas(image);
    }
  }, [imageBoxData, canvasSize, sourceImage, maxCanvasSize]);

  return (
    <canvas
      style={{ userSelect: "none" }}
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
    />
  );
};

export default ImageBoxCanvas;

export const rescaleToFit = (
  drawWidth: number,
  drawHeight: number,
  boundingBoxSize: number | undefined
): { scaledWidth: number; scaledHeight: number } => {
  if (boundingBoxSize === undefined) {
    return {
      scaledWidth: drawWidth,
      scaledHeight: drawHeight,
    };
  }
  if (drawWidth > boundingBoxSize) {
    const scaleFactor = boundingBoxSize / drawWidth;
    drawWidth *= scaleFactor;
    drawHeight *= scaleFactor;
  }
  if (drawHeight > boundingBoxSize) {
    const scaleFactor = boundingBoxSize / drawHeight;
    drawWidth *= scaleFactor;
    drawHeight *= scaleFactor;
  }

  return {
    scaledWidth: drawWidth,
    scaledHeight: drawHeight,
  };
};
