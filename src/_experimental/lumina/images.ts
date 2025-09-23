export const demo_SceneGraph_ArtCollection_Images: { [key: string]: string } = {
  "/images/art/Untitled_Artwork 256.png":
    "/images/art/Untitled_Artwork 256.png",
  "/images/art/Untitled_Artwork 257.png":
    "/images/art/Untitled_Artwork 257.png",
  "/images/art/Untitled_Artwork 258.png":
    "/images/art/Untitled_Artwork 258.png",
  "/images/art/Untitled_Artwork 263.png":
    "/images/art/Untitled_Artwork 263.png",
};

export const demo1_images: { [key: string]: string } = {
  "/images/wikipedia/Solvay_conference_1927.jpg":
    "/images/wikipedia/Solvay_conference_1927.jpg",
};

export const demo_SceneGraph_StackedImageGallery_images: {
  [key: string]: string;
} = {
  "/images/aesgraph/slide1.png": "/images/aesgraph/slide1.png",
  "/images/demo/StackedGallery/slide0.png":
    "/images/demo/StackedGallery/slide0.png",
  "/images/demo/StackedGallery/slide1.png":
    "/images/demo/StackedGallery/slide1.png",
};

export const demo_SceneGraph_StackedImageGalleryTransparent_images: {
  [key: string]: string;
} = {
  "/images/demo/StackedGalleryTransparent/1.png":
    "/images/demo/StackedGalleryTransparent/1.png",
  "/images/demo/StackedGalleryTransparent/2.png":
    "/images/demo/StackedGalleryTransparent/2.png",
  "/images/demo/StackedGalleryTransparent/3.png":
    "/images/demo/StackedGalleryTransparent/3.png",
};

export const demo_SceneGraph_ImageGallery_images: { [key: string]: string } = {
  "/images/aesgraph/slide1.png": "/images/aesgraph/slide1.png",
};

export const demo_SceneGraph_Thinking_images: { [key: string]: string } = {
  "/images/art/Untitled_Artwork 258.png":
    "/images/art/Untitled_Artwork 258.png",
};

export const demo_SceneGraph_Particulation_images: { [key: string]: string } = {
  "/images/demo/experiment/particulation.png":
    "/images/demo/experiment/particulation.png",
};

// Variable pointing to the app/public/images path

export const images = {
  ...demo_SceneGraph_ArtCollection_Images,
  ...demo1_images,
  ...demo_SceneGraph_StackedImageGallery_images,
  ...demo_SceneGraph_StackedImageGalleryTransparent_images,
  ...demo_SceneGraph_ImageGallery_images,
  ...demo_SceneGraph_Particulation_images,
};
