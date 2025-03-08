import imageA from "/public/images/art/Untitled_Artwork 256.png";
import imageE from "/public/images/art/Untitled_Artwork 257.png";
import imageH from "/public/images/art/Untitled_Artwork 258.png";
import imageI from "/public/images/art/Untitled_Artwork 263.png";

export const demo_SceneGraph_ArtCollection_Images: { [key: string]: any } = {
  "/public/images/art/Untitled_Artwork 256.png": imageA,
  "/public/images/art/Untitled_Artwork 257.png": imageE,
  "/public/images/art/Untitled_Artwork 258.png": imageH,
  "/public/images/art/Untitled_Artwork 263.png": imageI,
};

import demo1 from "/public/images/wikipedia/Solvay_conference_1927.jpg";
export const demo1_images: { [key: string]: any } = {
  "/public/images/wikipedia/Solvay_conference_1927.jpg": demo1,
};

import aesgraph_slide1 from "/public/images/aesgraph/slide1.png";
import demo3_2 from "/public/images/demo/StackedGallery/slide0.png";
import demo3_3 from "/public/images/demo/StackedGallery/slide1.png";
export const demo_SceneGraph_StackedImageGallery_images: {
  [key: string]: any;
} = {
  "/public/images/aesgraph/slide1.png": aesgraph_slide1,
  "/public/images/demo/StackedGallery/slide0.png": demo3_2,
  "/public/images/demo/StackedGallery/slide1.png": demo3_3,
};

import demo4_1 from "/public/images/demo/StackedGalleryTransparent/1.png";
import demo4_2 from "/public/images/demo/StackedGalleryTransparent/2.png";
import demo4_3 from "/public/images/demo/StackedGalleryTransparent/3.png";
export const demo_SceneGraph_StackedImageGalleryTransparent_images: {
  [key: string]: any;
} = {
  "/public/images/demo/StackedGalleryTransparent/1.png": demo4_1,
  "/public/images/demo/StackedGalleryTransparent/2.png": demo4_2,
  "/public/images/demo/StackedGalleryTransparent/3.png": demo4_3,
};

export const demo_SceneGraph_ImageGallery_images: { [key: string]: any } = {
  "/public/images/aesgraph/slide1.png": aesgraph_slide1,
};

import thinking from "/public/images/art/Untitled_Artwork 288.png";
export const demo_SceneGraph_Thinking_images: { [key: string]: any } = {
  "/public/images/art/Untitled_Artwork 288.png": thinking,
};

// Variable pointing to the app/public/images path

export const images = {
  ...demo_SceneGraph_ArtCollection_Images,
  ...demo1_images,
  ...demo_SceneGraph_StackedImageGallery_images,
  ...demo_SceneGraph_StackedImageGalleryTransparent_images,
  ...demo_SceneGraph_ImageGallery_images,
};
