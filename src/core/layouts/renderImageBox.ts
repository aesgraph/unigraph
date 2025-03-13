import * as THREE from "three";
import { SceneGraph } from "../model/SceneGraph";
import { ImageBoxData } from "../types/ImageBoxData";
import { createRandomBoxesForImage } from "./imageBoxUtils";

export interface ImageBox {
  id: string;
  imageId: string;
  position: THREE.Vector3;
  width: number;
  height: number;
}

export interface ImageData {
  id: string;
  url: string;
  group: THREE.Group;
  boxes: ImageBox[];
}

export const createBoxOutline = (box: ImageBox, imageGroup: THREE.Group) => {
  const corners = [
    new THREE.Vector3(
      box.position.x - box.width / 2,
      box.position.y - box.height / 2,
      0.01
    ),
    new THREE.Vector3(
      box.position.x + box.width / 2,
      box.position.y - box.height / 2,
      0.01
    ),
    new THREE.Vector3(
      box.position.x + box.width / 2,
      box.position.y + box.height / 2,
      0.01
    ),
    new THREE.Vector3(
      box.position.x - box.width / 2,
      box.position.y + box.height / 2,
      0.01
    ),
    new THREE.Vector3(
      box.position.x - box.width / 2,
      box.position.y - box.height / 2,
      0.01
    ),
  ].map((v) => v.applyMatrix4(imageGroup.matrixWorld));

  return corners;
};

const loadImageToScene = (
  scene: THREE.Scene,
  id: string,
  url: string,
  renderer: THREE.WebGLRenderer,
  index: number,
  addRandomImageBoxes: boolean = false
): Promise<ImageData> => {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(url, (texture) => {
      const group = createPlaneWithBorder(texture, index, id, renderer, id);
      scene.add(group);

      const boxes = addRandomImageBoxes
        ? createRandomBoxesForImage(group, id)
        : [];

      resolve({
        id,
        url,
        group,
        boxes,
      });
    });
  });
};

// Create plane geometry with a slightly larger border plane
const createPlaneWithBorder = (
  texture: THREE.Texture,
  index: number,
  id: string,
  renderer: THREE.WebGLRenderer,
  label: string
) => {
  const group = new THREE.Group();

  // Configure texture for better quality
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  // Border plane (slightly larger, white)
  const borderGeometry = new THREE.PlaneGeometry(3.1, 2.1);
  const borderMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0, // Set initial opacity to 0
    depthWrite: false,
    depthTest: true,
  });
  const borderPlane = new THREE.Mesh(borderGeometry, borderMaterial);

  // Image plane
  const imageGeometry = new THREE.PlaneGeometry(3, 2);
  const imageMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true,
  });
  const imagePlane = new THREE.Mesh(imageGeometry, imageMaterial);

  // Add both planes to group with slight offset
  group.add(borderPlane);
  group.add(imagePlane);

  group.position.x = (index % 3) * 3;
  group.position.y = Math.floor(index / 3) * 2;
  group.position.z = -index * 3;
  group.userData.id = id;
  group.userData.label = label;
  group.userData.borderMaterial = borderMaterial;
  group.userData.imageMaterial = imageMaterial;

  return group;
};

const createImageBoxFromData = (
  imageGroup: THREE.Group,
  imageId: string,
  boxData: ImageBoxData
): ImageBox => {
  console.log("CREATING IMAGE BOXES");
  // Image plane dimensions in scene (these match createPlaneWithBorder dimensions)
  const PLANE_WIDTH = 3;
  const PLANE_HEIGHT = 2;

  // Convert coordinates from 800x600 to the plane dimensions
  const scaleX = PLANE_WIDTH / 800;
  const scaleY = PLANE_HEIGHT / 600;

  // Scale the box coordinates
  const x1 = boxData.topLeft.x * scaleX - PLANE_WIDTH / 2;
  const x2 = boxData.bottomRight.x * scaleX - PLANE_WIDTH / 2;
  const y1 = PLANE_HEIGHT / 2 - boxData.topLeft.y * scaleY; // Invert Y axis
  const y2 = PLANE_HEIGHT / 2 - boxData.bottomRight.y * scaleY;

  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const x = (x1 + x2) / 2;
  const y = (y1 + y2) / 2;

  const points = [];
  points.push(new THREE.Vector3(x - width / 2, y - height / 2, 0.02));
  points.push(new THREE.Vector3(x + width / 2, y - height / 2, 0.02));
  points.push(new THREE.Vector3(x + width / 2, y + height / 2, 0.02));
  points.push(new THREE.Vector3(x - width / 2, y + height / 2, 0.02));
  points.push(new THREE.Vector3(x - width / 2, y - height / 2, 0.02));

  // Create plane mesh for hover detection
  const planeGeometry = new THREE.PlaneGeometry(width, height);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthTest: false,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.set(x, y, 0.01);

  // Make plane visible for debugging
  // planeMaterial.opacity = 0.1;

  // Important: Add raycast layer to plane
  plane.layers.enable(0);
  plane.userData.type = "imageBox";

  // Create outline with LineMaterial for dynamic color changes
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 1,
  });
  const box = new THREE.Line(geometry, lineMaterial);

  // Create group
  const boxGroup = new THREE.Group();
  boxGroup.add(plane);
  boxGroup.add(box);

  // Important: Add userData to both the plane and box for raycasting
  boxGroup.userData = {
    id: boxData.id,
    type: "imageBox",
    label: boxData.label,
    planeMaterial: planeMaterial,
    lineMaterial: lineMaterial, // Reference to the line material
  };

  imageGroup.add(boxGroup);

  return {
    id: boxData.id,
    imageId,
    position: new THREE.Vector3(x, y, 0),
    width,
    height,
  };
};

export const loadImagesFromSceneGraph = (
  scene: THREE.Scene,
  sceneGraph: SceneGraph,
  renderer: THREE.WebGLRenderer,
  addRandomImageBoxes: boolean = false
): Promise<ImageData[]> => {
  const imageNodes = sceneGraph.getGraph().getNodesByType("image");

  const imagePromises = imageNodes.map((node, index) => {
    const imageUrl = node.getData().userData?.imageUrl;
    return loadImageToScene(
      scene,
      node.getId(),
      imageUrl,
      renderer,
      index,
      addRandomImageBoxes
    );
  });

  return Promise.all(imagePromises);
};

export const loadImageBoxesFromSceneGraph = (
  images: ImageData[],
  sceneGraph: SceneGraph
) => {
  const imageBoxNodes = sceneGraph.getGraph().getNodesByType("imageBox");
  const boxes: ImageBoxData[] = [];

  imageBoxNodes.forEach((boxNode) => {
    const userData = boxNode.getData().userData;
    if (!userData) return;

    const targetImage = images.find((img) => img.id === userData.imageUrl);
    if (targetImage) {
      const boxData = {
        id: boxNode.getId(),
        label: boxNode.getLabel(),
        type: boxNode.getType(),
        imageUrl: userData.imageUrl,
        topLeft: userData.topLeft,
        bottomRight: userData.bottomRight,
        description: userData.description || "",
      };
      boxes.push(boxData);
      // Create the 3D box
      const box = createImageBoxFromData(
        targetImage.group,
        targetImage.id,
        boxData
      );
      targetImage.boxes.push(box);
    }
  });
  return boxes;
};
