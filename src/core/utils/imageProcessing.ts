import {
  demo1_images,
  demo_SceneGraph_ArtCollection_Images,
} from "../../_experimental/lumina/images";
import { ImageBoxData } from "../types/ImageBoxData";

export const reconstructImageSource = async (
  imageUrl: string,
  box: ImageBoxData,
  sourceImage?: HTMLImageElement
): Promise<ImageData> => {
  return new Promise((resolve) => {
    const processImage = (img: HTMLImageElement) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      // Calculate the scaling just like in CanvasSelection
      const scale = Math.min(800 / img.width, 600 / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (800 - scaledWidth) / 2;
      const offsetY = (600 - scaledHeight) / 2;

      // Calculate source coordinates
      const sourceX = (box.topLeft.x - offsetX) / scale;
      const sourceY = (box.topLeft.y - offsetY) / scale;
      const sourceWidth = (box.bottomRight.x - box.topLeft.x) / scale;
      const sourceHeight = (box.bottomRight.y - box.topLeft.y) / scale;

      // Set canvas size and draw
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        sourceWidth,
        sourceHeight
      );

      resolve(ctx.getImageData(0, 0, sourceWidth, sourceHeight));
    };

    if (sourceImage) {
      processImage(sourceImage);
    } else {
      const img = new Image();
      img.src =
        demo_SceneGraph_ArtCollection_Images[imageUrl] ||
        demo1_images[imageUrl];
      img.onload = () => processImage(img);
    }
  });
};
