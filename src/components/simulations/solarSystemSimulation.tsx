import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { createPlanetSystem } from "../../core/webgl/simulations/solarSystemHelpers";

const SolarSystem = () => {
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
    camera.position.z = 50;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Create star (sun)
    const starGeometry = new THREE.SphereGeometry(5, 32, 32);
    const starMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      opacity: 0.8,
    });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(star);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    // Add point light at star position
    const light = new THREE.PointLight(0xffffff, 1, 100);
    star.add(light);

    // Create multiple planet systems
    const planetSystems = [
      createPlanetSystem(scene, 15, 1, 0xff6b6b, 1, -2, -1), // Red planet with 1 moon
      createPlanetSystem(scene, 25, 2, 0x4ecdc4, 2, Math.PI / 2, 0.2), // Cyan planet with 2 moons
      createPlanetSystem(scene, 35, 1.5, 0xa8e6cf, 3, Math.PI / 3, 0.3), // Green planet with 3 moons
    ];

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Update planet systems
      planetSystems.forEach((system) => {
        system.pivot.rotation.y += system.speed;
        system.moons.forEach((moon) => {
          moon.pivot.rotation.y += moon.speed;
        });
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
        //eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
};

export default SolarSystem;
