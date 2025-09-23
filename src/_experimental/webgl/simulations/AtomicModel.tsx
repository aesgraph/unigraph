import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const AtomicModel = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 15;
    camera.position.y = 5;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Setup OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Create nucleus
    const nucleusGeometry = new THREE.SphereGeometry(1, 32, 32);
    const nucleusMaterial = new THREE.MeshStandardMaterial({
      color: 0x4477ff,
      metalness: 0.3,
      roughness: 0.7,
      emissive: 0x4477ff,
      emissiveIntensity: 0.2,
    });
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    scene.add(nucleus);

    // Function to create an electron orbital system
    interface Orbital {
      group: THREE.Group;
      pivot: THREE.Object3D;
      speed: number;
      offset: number;
    }

    const createOrbital = (
      radius: number,
      tiltX: number,
      tiltZ: number,
      electronColor: number
    ): Orbital => {
      const orbitalGroup = new THREE.Group();

      // Create orbital path
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitPoints: number[] = [];
      const segments = 64;

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        orbitPoints.push(radius * Math.cos(theta), 0, radius * Math.sin(theta));
      }

      orbitGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(orbitPoints, 3)
      );

      const orbitMaterial = new THREE.LineBasicMaterial({
        color: electronColor,
        transparent: true,
        opacity: 0.3,
      });

      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);

      // Create electron
      const electronGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const electronMaterial = new THREE.MeshStandardMaterial({
        color: electronColor,
        emissive: electronColor,
        emissiveIntensity: 0.5,
      });
      const electron = new THREE.Mesh(electronGeometry, electronMaterial);
      electron.position.x = radius * Math.cos(Math.random() * Math.PI * 2);
      electron.position.z = radius * Math.sin(Math.random() * Math.PI * 2);

      // Create pivot for electron
      const pivot = new THREE.Object3D();
      pivot.add(electron);

      // Add orbit and pivot to group
      orbitalGroup.add(orbit);
      orbitalGroup.add(pivot);

      // Apply tilts
      orbitalGroup.rotation.x = tiltX;
      orbitalGroup.rotation.z = tiltZ;

      scene.add(orbitalGroup);

      return {
        group: orbitalGroup,
        pivot: pivot,
        speed: 0.01, // Uniform speed for all electrons
        offset: Math.random() * Math.PI * 2, // Random offset for staggered rotation
      };
    };

    const generateOrbitals = (count: number) => {
      const orbitals: Orbital[] = [];
      const colors = [
        0x1e3a8a, 0x3b82f6, 0x60a5fa, 0x93c5fd, 0xbfdbfe, 0xdbf4ff,
      ];
      for (let i = 0; i < count; i++) {
        const radius = Math.random() * 5;
        const tiltX = Math.random() * Math.PI;
        const tiltZ = Math.random() * Math.PI;
        const electronColor = colors[Math.floor(Math.random() * colors.length)];
        orbitals.push(createOrbital(radius, tiltX, tiltZ, electronColor));
      }
      return orbitals;
    };

    // Generate a large number of orbitals
    const orbitals = generateOrbitals(100);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate nucleus slightly
      nucleus.rotation.y += 0.01;

      // Update electron positions
      orbitals.forEach((orbital) => {
        orbital.pivot.rotation.y += orbital.speed;
        // Add slight wobble to orbital planes
        orbital.group.rotation.x +=
          Math.sin(Date.now() * 0.001 + orbital.offset) * 0.0005;
        orbital.group.rotation.z +=
          Math.cos(Date.now() * 0.001 + orbital.offset) * 0.0005;
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100vh",
        backgroundColor: "#000",
      }}
    />
  );
};

export default AtomicModel;
