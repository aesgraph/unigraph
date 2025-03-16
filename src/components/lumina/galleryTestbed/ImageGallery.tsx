import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { v4 as uuidv4 } from "uuid";
import { images } from "../images";

interface ImageBox {
  id: string;
  imageId: string;
  position: THREE.Vector3;
  width: number;
  height: number;
}

const ImageGallery: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const rectangles = useRef<THREE.Group[]>([]);
  const boxes = useRef<ImageBox[]>([]);
  const links = useRef<THREE.Line[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2c2c2c); // Dark grey background
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

    // Create plane geometry with a slightly larger border plane
    const createPlaneWithBorder = (
      texture: THREE.Texture,
      index: number,
      id: string
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

      boxes.current.push(...boxesForImage);
    };

    const getRandomColor = () => {
      const colors = [
        0xffff00, 0x00ffff, 0xff00ff, 0xff8800, 0x00ff88, 0x8800ff,
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const createRandomLinks = (scene: THREE.Scene) => {
      // Clear existing links
      links.current.forEach((link) => scene.remove(link));
      links.current = [];

      boxes.current.forEach((box1, i) => {
        // Create 1-2 random links for each box
        const linkCount = 1 + Math.floor(Math.random() * 2);
        for (let j = 0; j < linkCount; j++) {
          const targetIndex = Math.floor(Math.random() * boxes.current.length);
          if (targetIndex !== i) {
            const box2 = boxes.current[targetIndex];
            const sourceImage = rectangles.current.find(
              (r) => r.userData.id === box1.imageId
            );
            const targetImage = rectangles.current.find(
              (r) => r.userData.id === box2.imageId
            );

            if (sourceImage && targetImage) {
              // Create box outline points with correct world positions
              const sourcePos = new THREE.Vector3(
                box1.position.x,
                box1.position.y,
                0.01
              ).applyMatrix4(sourceImage.matrixWorld);
              const targetPos = new THREE.Vector3(
                box2.position.x,
                box2.position.y,
                0.01
              ).applyMatrix4(targetImage.matrixWorld);

              // Create line between boxes
              const points = [sourcePos, targetPos];
              const lineGeometry = new THREE.BufferGeometry().setFromPoints(
                points
              );
              const color = getRandomColor();
              const linkMaterial = new THREE.LineBasicMaterial({
                color,
                transparent: true,
                opacity: 0.5,
                linewidth: 10,
                depthTest: false,
              });

              const line = new THREE.Line(lineGeometry, linkMaterial);
              scene.add(line);
              links.current.push(line);

              // Create box outlines
              const sourceCorners = createBoxOutline(box1, sourceImage);
              const targetCorners = createBoxOutline(box2, targetImage);

              const sourceGeometry = new THREE.BufferGeometry().setFromPoints(
                sourceCorners
              );
              const targetGeometry = new THREE.BufferGeometry().setFromPoints(
                targetCorners
              );

              const sourceOutline = new THREE.Line(
                sourceGeometry,
                linkMaterial
              );
              const targetOutline = new THREE.Line(
                targetGeometry,
                linkMaterial
              );

              scene.add(sourceOutline);
              scene.add(targetOutline);
              links.current.push(sourceOutline, targetOutline);
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

    // Load images
    const loader = new THREE.TextureLoader();
    Object.entries(images).forEach(([id, url], index) => {
      loader.load(url, (texture) => {
        const planeGroup = createPlaneWithBorder(texture, index, id);
        rectangles.current.push(planeGroup);
        scene.add(planeGroup);

        // Add random boxes for this image
        createRandomBoxesForImage(planeGroup, id);

        // Create links after all images and boxes are loaded
        if (rectangles.current.length === Object.keys(images).length) {
          createRandomLinks(scene);
        }
      });
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
      rectangles.current.forEach((group) => {
        const distance = camera.position.distanceTo(group.position);
        const opacity = calculateOpacity(distance, 1, 1.4);

        const imageMaterial = group.userData
          .imageMaterial as THREE.MeshBasicMaterial;
        imageMaterial.opacity = opacity;
      });

      orbitControls.update();
      flyControls.update(0.1);
      renderer.render(scene, camera);
    };

    // Handle mouse move
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(
        scene.children,
        true
      );

      // Reset all borders
      rectangles.current.forEach((group) => {
        const borderMaterial = group.userData
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
  }, []);

  return <div ref={containerRef} className="w-full h-screen" />;
};

export default ImageGallery;
