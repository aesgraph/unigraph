import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { v4 as uuidv4 } from "uuid";
import LayoutSwitcher from "../lumina/LayoutSwitcher";
import { demo_SceneGraph_ArtCollection_Images } from "../lumina/images";

interface ImageBox {
  id: string;
  imageId: string;
  position: THREE.Vector3;
  width: number;
  height: number;
}

interface ImageData {
  id: string;
  url: string;
  group: THREE.Group;
  boxes: ImageBox[];
}

interface ImageLayoutOptions {
  type: "grid2d" | "random3d" | "stack";
  gridOptions?: {
    cols: number;
    spacing: {
      x: number;
      y: number;
      z: number;
    };
  };
  randomOptions?: {
    bounds: {
      x: [number, number];
      y: [number, number];
      z: [number, number];
    };
  };
  stackOptions: {
    spacing: number;
  };
}

// Helper functions
const applyLayout = (
  scene: THREE.Scene,
  images: ImageData[],
  links: (THREE.Mesh | THREE.Line)[],
  options: ImageLayoutOptions = {
    type: "grid2d",
    gridOptions: {
      cols: 3,
      spacing: { x: 3, y: 2, z: 3 },
    },
    randomOptions: {
      bounds: {
        x: [-10, 10],
        y: [-10, 10],
        z: [-10, 10],
      },
    },
    stackOptions: {
      spacing: 0.5,
    },
  }
) => {
  // Clear existing links
  links.forEach((link) => scene.remove(link));
  links.length = 0;

  if (options.type === "grid2d") {
    const { cols, spacing } = options.gridOptions!;
    images.forEach((image, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      // Update group position
      image.group.position.x = col * spacing.x;
      image.group.position.y = row * spacing.y;
      image.group.position.z = 0;

      // Update matrix world to ensure correct box positions
      image.group.updateMatrixWorld(true);
    });
  } else if (options.type === "random3d") {
    const { bounds } = options.randomOptions!;
    images.forEach((image) => {
      image.group.position.x =
        bounds.x[0] + Math.random() * (bounds.x[1] - bounds.x[0]);
      image.group.position.y =
        bounds.y[0] + Math.random() * (bounds.y[1] - bounds.y[0]);
      image.group.position.z =
        bounds.z[0] + Math.random() * (bounds.z[1] - bounds.z[0]);
      image.group.updateMatrixWorld(true);
    });
  }

  // Recreate links after positions are updated
  createRandomLinks(scene, images, links);
};

const loadImageToScene = (
  scene: THREE.Scene,
  id: string,
  url: string,
  renderer: THREE.WebGLRenderer,
  index: number
): Promise<ImageData> => {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(url, (texture) => {
      const group = createPlaneWithBorder(texture, index, id, renderer);
      scene.add(group);

      const boxes = createRandomBoxesForImage(group, id);

      resolve({
        id,
        url,
        group,
        boxes,
      });
    });
  });
};

const loadImagesAndBoxes = async (
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer
): Promise<ImageData[]> => {
  const imagePromises = Object.entries(
    demo_SceneGraph_ArtCollection_Images
  ).map(([id, url], index) =>
    loadImageToScene(scene, id, url, renderer, index)
  );

  return Promise.all(imagePromises);
};

const ImageGalleryV2: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const imagesData = useRef<ImageData[]>([]);
  const links = useRef<(THREE.Mesh | THREE.Line)[]>([]);
  const scene = useRef<THREE.Scene>(null);
  const [currentLayout, setCurrentLayout] = useState<
    "grid2d" | "random3d" | "stack"
  >("grid2d");

  const handleLayoutChange = useCallback(
    (newLayout: "grid2d" | "random3d" | "stack") => {
      if (!scene.current || !imagesData.current) return;

      setCurrentLayout(newLayout);
      applyLayout(scene.current, imagesData.current, links.current, {
        type: newLayout,
        gridOptions: {
          cols: 3,
          spacing: { x: 3, y: 2, z: 3 },
        },
        randomOptions: {
          bounds: {
            x: [-10, 10],
            y: [-10, 10],
            z: [-10, 10],
          },
        },
        stackOptions: {
          spacing: 0.5,
        },
      });
    },
    []
  );

  useEffect(() => {
    if (!containerRef.current) return;

    scene.current = new THREE.Scene();
    scene.current.background = new THREE.Color(0x2c2c2c);

    // Setup scene
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Setup OrbitControls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.25;
    orbitControls.enableZoom = true;
    orbitControls.enableRotate = true;

    // Setup FlyControls
    const flyControls = new FlyControls(camera, renderer.domElement);
    flyControls.movementSpeed = 0.5;
    flyControls.rollSpeed = Math.PI / 48;
    flyControls.autoForward = false;
    flyControls.dragToLook = true;

    // Load images and apply initial layout
    loadImagesAndBoxes(scene.current, renderer).then((images) => {
      imagesData.current = images;
      handleLayoutChange(currentLayout);
    });

    // Function to determine opacity based on distance
    const calculateOpacity = (
      distance: number,
      minDistance: number,
      maxDistance: number
    ) => {
      return Math.min(
        1,
        Math.max(0, (distance - minDistance) / (maxDistance - minDistance))
      );
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update opacity based on distance
      imagesData.current.forEach((image) => {
        const distance = camera.position.distanceTo(image.group.position);
        const opacity = calculateOpacity(distance, 1, 1.4);

        const imageMaterial = image.group.userData
          .imageMaterial as THREE.MeshBasicMaterial;
        imageMaterial.opacity = opacity;
      });

      orbitControls.update();
      flyControls.update(0.1);
      renderer.render(scene.current!, camera);
    };

    // Handle mouse move
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(
        scene.current!.children,
        true
      );

      // Reset all borders
      imagesData.current.forEach((image) => {
        const borderMaterial = image.group.userData
          .borderMaterial as THREE.MeshBasicMaterial;
        borderMaterial.opacity = 0; // Hide border by default
      });

      // Show border for hovered group
      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const group = intersectedObject.parent;
        if (group && group.userData.id) {
          const borderMaterial = group.userData
            .borderMaterial as THREE.MeshBasicMaterial;
          borderMaterial.opacity = 1; // Full opacity on hover
          console.log(`Hovering over image: ${group.userData.id}`);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [handleLayoutChange, currentLayout]);

  return (
    <>
      <div ref={containerRef} className="w-full h-screen" />
      <LayoutSwitcher
        currentLayout={currentLayout}
        onLayoutChange={handleLayoutChange}
      />
    </>
  );
};

export default ImageGalleryV2;

// Create plane geometry with a slightly larger border plane
const createPlaneWithBorder = (
  texture: THREE.Texture,
  index: number,
  id: string,
  renderer: THREE.WebGLRenderer
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
  group.userData.borderMaterial = borderMaterial;
  group.userData.imageMaterial = imageMaterial;

  return group;
};

const createRandomBoxesForImage = (
  imageGroup: THREE.Group,
  imageId: string,
  count: number = 3
) => {
  const boxesForImage: ImageBox[] = [];
  const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

  for (let i = 0; i < count; i++) {
    // Random box dimensions
    const width = 0.2 + Math.random() * 0.5;
    const height = 0.2 + Math.random() * 0.5;

    // Random position within image bounds (assuming image is 3x2)
    const x = (Math.random() - 0.5) * 2.5;
    const y = (Math.random() - 0.5) * 1.5;

    const points = [];
    points.push(new THREE.Vector3(x - width / 2, y - height / 2, 0.01));
    points.push(new THREE.Vector3(x + width / 2, y - height / 2, 0.01));
    points.push(new THREE.Vector3(x + width / 2, y + height / 2, 0.01));
    points.push(new THREE.Vector3(x - width / 2, y + height / 2, 0.01));
    points.push(new THREE.Vector3(x - width / 2, y - height / 2, 0.01));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const box = new THREE.Line(geometry, material);
    imageGroup.add(box);

    boxesForImage.push({
      id: uuidv4(),
      imageId,
      position: new THREE.Vector3(x, y, 0),
      width,
      height,
    });
  }

  return boxesForImage;
};

const getRandomColor = () => {
  const colors = [0xffff00, 0x00ffff, 0xff00ff, 0xff8800, 0x00ff88, 0x8800ff];
  return colors[Math.floor(Math.random() * colors.length)];
};

const createRandomLinks = (
  scene: THREE.Scene,
  images: ImageData[],
  links: (THREE.Mesh | THREE.Line)[]
) => {
  const allBoxes = images.flatMap((img) => img.boxes);

  allBoxes.forEach((box1, i) => {
    const linkCount = 1 + Math.floor(Math.random() * 2);
    for (let j = 0; j < linkCount; j++) {
      const targetIndex = Math.floor(Math.random() * allBoxes.length);
      if (targetIndex !== i) {
        const box2 = allBoxes[targetIndex];
        const sourceImage = images.find((img) => img.id === box1.imageId);
        const targetImage = images.find((img) => img.id === box2.imageId);

        if (sourceImage && targetImage) {
          // Get world positions
          const sourcePos = new THREE.Vector3(
            box1.position.x,
            box1.position.y,
            0.01
          ).applyMatrix4(sourceImage.group.matrixWorld);
          const targetPos = new THREE.Vector3(
            box2.position.x,
            box2.position.y,
            0.01
          ).applyMatrix4(targetImage.group.matrixWorld);

          // Create curved path for tube
          const curve = new THREE.CatmullRomCurve3([
            sourcePos,
            new THREE.Vector3(
              (sourcePos.x + targetPos.x) / 2,
              (sourcePos.y + targetPos.y) / 2,
              (sourcePos.z + targetPos.z) / 2 + 0.5 // Add slight curve upward
            ),
            targetPos,
          ]);

          const color = getRandomColor();

          // Create tube geometry for connection
          const tubeGeometry = new THREE.TubeGeometry(
            curve,
            32, // tubularSegments
            0.02, // radius
            8, // radialSegments
            false // closed
          );

          const tubeMaterial = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.5,
            depthTest: false,
          });

          const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
          scene.add(tube);
          links.push(tube);

          // Create box outlines with same color
          const sourceCorners = createBoxOutline(box1, sourceImage.group);
          const targetCorners = createBoxOutline(box2, targetImage.group);

          const sourceGeometry = new THREE.BufferGeometry().setFromPoints(
            sourceCorners
          );
          const targetGeometry = new THREE.BufferGeometry().setFromPoints(
            targetCorners
          );

          const outlineMaterial = new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: 0.5,
            depthTest: false,
          });

          const sourceOutline = new THREE.Line(sourceGeometry, outlineMaterial);
          const targetOutline = new THREE.Line(targetGeometry, outlineMaterial);

          scene.add(sourceOutline);
          scene.add(targetOutline);
          links.push(sourceOutline, targetOutline);
        }
      }
    }
  });
};

const createBoxOutline = (box: ImageBox, imageGroup: THREE.Group) => {
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
