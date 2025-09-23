import { ForceGraph3DInstance } from "3d-force-graph";
import * as THREE from "three";
import { ObjectOf } from "../../App";

export const createHoverableRectangle = (
  scene: THREE.Scene,
  id: string,
  width: number,
  height: number,
  position: THREE.Vector3,
  color: number = 0xffffff
): THREE.Mesh => {
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({ color, transparent: true });
  const rectangle = new THREE.Mesh(geometry, material);
  rectangle.position.copy(position);
  rectangle.userData.id = id;
  scene.add(rectangle);
  return rectangle;
};

export const handleMouseHover = (
  raycaster: THREE.Raycaster,
  mouse: THREE.Vector2,
  camera: THREE.Camera,
  rectangles: THREE.Mesh[]
) => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(rectangles);

  rectangles.forEach((rectangle) => {
    (rectangle.material as THREE.MeshBasicMaterial).color.set(0xffffff); // Reset color
  });

  if (intersects.length > 0) {
    const intersected = intersects[0].object as THREE.Mesh;
    (intersected.material as THREE.MeshBasicMaterial).color.set(0xffd700); // Gold color
    console.log(`Hovered over rectangle with ID: ${intersected.userData.id}`);
  }
};

export const flyToNode = (
  instance: ForceGraph3DInstance,
  node: any,
  mode: "Layout" | "Physics" = "Physics"
) => {
  if (mode === "Layout") {
    // Top-down 2D view: camera high above Z, looking at node
    const distance = 200;
    const newPos = {
      x: node.x,
      y: node.y,
      z: node.z + distance,
    };
    instance.cameraPosition(
      newPos, // new position
      node, // lookAt ({ x, y, z })
      1000 // Shorter duration for 2D
    );
    return;
  }
  // 3D/Physics mode (default)
  const distance = 200; // Increased base distance
  const distRatio = 1.5 + distance / Math.hypot(node.x, node.y, node.z); // Reduced ratio multiplier

  const newPos =
    node.x || node.y || node.z
      ? {
          x: node.x * distRatio * 1, // Added 2 multiplier to reduce distance
          y: node.y * distRatio * 1,
          z: node.z * distRatio * 1,
        }
      : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

  instance.cameraPosition(
    newPos, // new position
    node, // lookAt ({ x, y, z })
    1500 // Reduced transition duration for snappier response
  );
};

export const convertScreenToWorldCoordinates = (
  screenX: number,
  screenY: number,
  camera: THREE.Camera,
  width: number,
  height: number
): THREE.Vector3 => {
  const vector = new THREE.Vector3(
    (screenX / width) * 2 - 1,
    -(screenY / height) * 2 + 1,
    0
  );
  vector.unproject(camera);
  return vector;
};

export const convertWorldToScreenCoordinates = (
  screenX: number,
  screenY: number,
  camera: THREE.Camera,
  width: number,
  height: number
): THREE.Vector3 => {
  const vector = new THREE.Vector3(screenX, screenY, 0).clone().project(camera);
  return new THREE.Vector3(
    ((vector.x + 1) / 2) * width,
    (-(vector.y - 1) / 2) * height,
    0.5
  );
};

export const getOriginPoint = (
  startPoint: THREE.Vector3,
  endPoint: THREE.Vector3
) => {
  return new THREE.Vector3(
    Math.min(startPoint.x, endPoint.x),
    Math.min(startPoint.y, endPoint.y),
    Math.min(startPoint.z, endPoint.z)
  );
};

// Create plane geometry with a slightly larger border plane
export const createPlaneWithBorder = (
  texture: THREE.Texture,
  index: number,
  id: string,
  renderer: THREE.WebGLRenderer
): THREE.Group => {
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

  group.position.x = Math.random() * 5 - 2.5;
  group.position.y = Math.random() * 5 - 2.5;
  group.position.z = Math.random() * 50 - 25;
  group.userData.id = id;
  group.userData.borderMaterial = borderMaterial;
  group.userData.imageMaterial = imageMaterial;

  console.log("created group ", group);

  return group;
};

// Function to determine opacity based on distance
export const calculateOpacity = (
  distance: number,
  minDistance: number,
  maxDistance: number
) => {
  return Math.min(
    1,
    Math.max(0, (distance - minDistance) / (maxDistance - minDistance))
  );
};

export const loadImage = (
  name: string,
  url: any,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer
) => {
  const loader = new THREE.TextureLoader();
  const planeGroups: THREE.Object3D[] = [];
  loader.load(url, (texture) => {
    console.log("loaded", url);
    const planeGroup = createImageElement(texture, 0, name, renderer);
    scene.add(planeGroup);
    planeGroups.push(planeGroup);
  });
  return planeGroups[0];
};

export const loadImages = (
  images: ObjectOf<any>,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer
) => {
  const loader = new THREE.TextureLoader();
  const planeGroups: THREE.Group[] = [];
  Object.entries(images).forEach(([name, url]) => {
    loader.load(url, (texture) => {
      const planeGroup = createPlaneWithBorder(texture, 0, name, renderer);
      scene.add(planeGroup);
      planeGroups.push(planeGroup);
    });
  });
  return planeGroups;
};

// Create image element
export const createImageElement = (
  texture: THREE.Texture,
  index: number,
  id: string,
  renderer: THREE.WebGLRenderer
): THREE.Object3D => {
  // Configure texture for better quality
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

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
  imagePlane.userData.id = id;
  imagePlane.userData.imageMaterial = imageMaterial;
  imagePlane.position.setZ(0.1);

  console.log("created image plane ", imagePlane);

  return imagePlane;
};

export const getTopLeftBottomRightPoints = (
  point1: THREE.Vector3,
  point2: THREE.Vector3
) => {
  const x1 = Math.min(point1.x, point2.x);
  const x2 = Math.max(point1.x, point2.x);
  const y1 = Math.min(point1.y, point2.y);
  const y2 = Math.max(point1.y, point2.y);
  return {
    topLeft: new THREE.Vector3(x1, y2, 0),
    bottomRight: new THREE.Vector3(x2, y1, 0),
  };
};

export const getIntersections = (
  camera: THREE.Camera,
  scene: THREE.Scene,
  clientX: number,
  clientY: number,
  windowInnerWidth: number,
  windowInnerHeight: number,
  rayCaster: THREE.Raycaster
) => {
  const x = (clientX / windowInnerWidth) * 2 - 1;
  const y = -(clientY / windowInnerHeight) * 2 + 1;
  rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);
  const intersects = rayCaster.intersectObjects(scene.children, true);
  return intersects;
};

export const getFirstGroup = (
  intersects: THREE.Intersection[]
): THREE.Group | null => {
  for (const intersect of intersects) {
    if (
      intersect.object.parent &&
      intersect.object.parent.userData.id === "SelectionBoxGroup"
    ) {
      return intersect.object.parent as THREE.Group;
    }
  }
  return null;
};

export const getCenter = (points: THREE.Vector3[]) => {
  const sum = points.reduce(
    (acc, point) => {
      acc.x += point.x;
      acc.y += point.y;
      acc.z += point.z;
      return acc;
    },
    new THREE.Vector3(0, 0, 0)
  );
  const center = new THREE.Vector3(
    sum.x / points.length,
    sum.y / points.length,
    sum.z / points.length
  );
  return center;
};

export function extractIntersection<T>(
  intersects: THREE.Intersection[],
  id: string
): T | null {
  for (const intersect of intersects) {
    if (intersect.object.userData?.id === id) {
      return intersect as T;
    }
  }
  return null;
}

export function extractIntersections<T>(
  intersects: THREE.Intersection[],
  id: string
): T[] {
  const ret: T[] = [];
  for (const intersect of intersects) {
    if (intersect.object.userData?.id === id) {
      ret.push(intersect as T);
    }
  }

  return ret;
}

export interface ScreenCoordinates {
  topLeftScreen: THREE.Vector3;
  bottomRightScreen: THREE.Vector3;
  width: number;
  height: number;
}

export const getScreenCoordinates = (
  position1: THREE.Vector3,
  position2: THREE.Vector3,
  camera: THREE.Camera,
  innerWidth: number,
  innerHeight: number
): ScreenCoordinates => {
  const { topLeft, bottomRight } = getTopLeftBottomRightPoints(
    position1,
    position2
  );

  const topLeftScreen = convertWorldToScreenCoordinates(
    topLeft.x,
    topLeft.y,
    camera,
    innerWidth,
    innerHeight
  );

  const bottomRightScreen = convertWorldToScreenCoordinates(
    bottomRight.x,
    bottomRight.y,
    camera,
    innerWidth,
    innerHeight
  );

  const width = Math.abs(bottomRightScreen.x - topLeftScreen.x);
  const height = Math.abs(bottomRightScreen.y - topLeftScreen.y);

  return { topLeftScreen, bottomRightScreen, width, height };
};

export function getImagePixelCoordinates(
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer
) {
  const imageGeometry = new THREE.PlaneGeometry(3, 2);
  const imageMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true,
  });
  const imagePlane = new THREE.Mesh(imageGeometry, imageMaterial);

  const geometry = new THREE.PlaneGeometry(3, 2);
  const vertices = geometry.attributes.position;
  const canvas = renderer.domElement;
  const vector = new THREE.Vector3();
  const bounds = {
    min: new THREE.Vector3(Infinity, Infinity, Infinity),
    max: new THREE.Vector3(-Infinity, -Infinity, -Infinity),
  };

  imagePlane.updateMatrixWorld();

  for (let i = 0; i < vertices.count; i++) {
    vector
      .fromBufferAttribute(vertices, i)
      .applyMatrix4(imagePlane.matrixWorld)
      .project(camera);

    const x = ((vector.x + 1) * canvas.width) / 2;
    const y = ((-vector.y + 1) * canvas.height) / 2;

    bounds.min.x = Math.min(bounds.min.x, x);
    bounds.min.y = Math.min(bounds.min.y, y);
    bounds.max.x = Math.max(bounds.max.x, x);
    bounds.max.y = Math.max(bounds.max.y, y);
  }

  return {
    x: bounds.min.x,
    y: bounds.min.y,
    width: bounds.max.x - bounds.min.x,
    height: bounds.max.y - bounds.min.y,
  };
}

export function convertPixelCoordinatesToPositions(pixelCoordinates: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const topLeft = { x: pixelCoordinates.x, y: pixelCoordinates.y };
  const bottomRight = {
    x: pixelCoordinates.x + pixelCoordinates.width,
    y: pixelCoordinates.y + pixelCoordinates.height,
  };
  return { topLeft, bottomRight };
}
