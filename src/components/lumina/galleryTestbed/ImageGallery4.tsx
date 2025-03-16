/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CameraHelper } from "../../../core/webgl/CameraHelper";

const ImageGallery4: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentlyAnimating = false;
  let camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer;
  let orbitControls: OrbitControls;
  let flyControls: FlyControls;
  let cameraHelper: CameraHelper;

  useEffect(() => {
    if (!containerRef.current) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const init = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x222222);
      containerRef.current!.appendChild(renderer.domElement);

      // Add lights
      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // Create various geometric objects
      const objects = [
        new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshPhongMaterial({ color: 0xff0000 })
        ),
        new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 32, 32),
          new THREE.MeshPhongMaterial({ color: 0x00ff00 })
        ),
        new THREE.Mesh(
          new THREE.ConeGeometry(0.5, 1, 32),
          new THREE.MeshPhongMaterial({ color: 0x0000ff })
        ),
        new THREE.Mesh(
          new THREE.TorusGeometry(0.3, 0.2, 16, 32),
          new THREE.MeshPhongMaterial({ color: 0xffff00 })
        ),
      ];

      // Position objects in different locations
      objects[0].position.set(-2, 0, 0);
      objects[1].position.set(2, 0, 0);
      objects[2].position.set(0, 2, 0);
      objects[3].position.set(0, -2, 0);

      objects.forEach((obj) => {
        scene.add(obj);
        obj.userData.isClickable = true;
      });

      // Setup OrbitControls
      orbitControls = new OrbitControls(camera, renderer.domElement);
      orbitControls.enableDamping = true;
      orbitControls.dampingFactor = 0.25;
      orbitControls.enableZoom = true;
      orbitControls.enableRotate = true;
      cameraHelper = new CameraHelper(camera, scene, orbitControls);

      // Setup FlyControls
      flyControls = new FlyControls(camera, renderer.domElement);
      flyControls.movementSpeed = 0.5;
      flyControls.rollSpeed = Math.PI / 48;
      flyControls.autoForward = false;
      flyControls.dragToLook = true;

      const animate = () => {
        requestAnimationFrame(animate);

        // Gentle rotation of all objects
        scene.traverse((object) => {
          if (object.userData.isClickable) {
            object.rotation.x += 0.01;
            object.rotation.y += 0.01;
          }
        });

        // orbitControls.update();
        // flyControls.update(0.1);
        renderer.render(scene, camera);
      };

      animate();

      // Handle window resize
      window.addEventListener("resize", onWindowResize, false);
    };

    const zoomToObject = (object: THREE.Object3D) => {
      cameraHelper.centerOnObject(object);
    };

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseClick = (event: MouseEvent) => {
      if (currentlyAnimating) return;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.isClickable) {
          zoomToObject(object);
        }
      }
    };

    init();

    window.addEventListener("click", handleMouseClick);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("click", handleMouseClick);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100vw", height: "100vh" }}>
      <div
        id="info"
        style={{
          position: "absolute",
          top: 10,
          width: "100%",
          textAlign: "center",
          color: "white",
          fontFamily: "Arial, sans-serif",
          pointerEvents: "none",
          textShadow: "1px 1px 1px black",
        }}
      >
        Click on objects to zoom to them
      </div>
    </div>
  );
};

export default ImageGallery4;
