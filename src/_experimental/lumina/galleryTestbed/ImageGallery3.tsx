import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CameraHelper } from "../../../core/webgl/CameraHelper";
import { calculateOpacity, loadImages } from "../../../core/webgl/webglHelpers";
import { images } from "../images";

const ImageGallery3: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const rectangles = useRef<THREE.Group[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  let cameraHelper: CameraHelper;

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
    cameraRef.current = camera;

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

    // This needs to be fixed with CameraHelper.
    // Setup FlyControls
    // const flyControls = new FlyControls(camera, renderer.domElement);
    // flyControls.movementSpeed = 0.5;
    // flyControls.rollSpeed = Math.PI / 48;
    // flyControls.autoForward = false;
    // flyControls.dragToLook = true;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    cameraHelper = new CameraHelper(camera, scene, orbitControls);

    // Load images
    const planeGroups = loadImages(images, scene, renderer);
    rectangles.current = planeGroups;

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
      // flyControls.update(0.1);
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

    // Handle mouse click
    const handleMouseClick = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(
        scene.children,
        true
      );

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const group = intersectedObject.parent;
        if (group && group.userData.id) {
          cameraHelper.centerOnObject(group);
          console.log(`Clicked on image: ${group.userData.id}`);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleMouseClick);

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
      window.removeEventListener("click", handleMouseClick);
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-screen" />;
};

export default ImageGallery3;
