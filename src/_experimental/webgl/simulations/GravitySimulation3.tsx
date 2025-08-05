import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const GravitySimulation3 = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    camera.position.z = 200;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Parameters for the simulation
    const PARTICLE_COUNT = 5000;
    const BOUNDS = 50;
    const G = 0.1; // Gravitational constant (scaled for visualization)
    const TIME_STEP = 0.1;
    const MAX_SPEED = 4.0; // Maximum speed to prevent particles from flying off the screen
    const CONTAINMENT_RADIUS = 150; // Radius of the sphere containing the particles
    const CENTER_MASS = 1000; // Mass of the central mass
    const MIN_ORBIT_RADIUS_1 = 100; // Minimum distance from the central mass for the first set of particles
    const MIN_ORBIT_RADIUS_2 = 15; // Minimum distance from the central mass for the second set of particles
    const MIN_ORBIT_RADIUS_3 = 60; // Minimum distance from the central mass for the third set of particles
    const MIN_ORBIT_RADIUS_4 = 20; // Minimum distance from the central mass for the fourth set of particles
    const MIN_ORBIT_RADIUS_5 = 30; // Minimum distance from the central mass for the fifth set of particles

    // Function to initialize particles
    const initializeParticles = (particleCount: number, bounds: number) => {
      const positions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      const masses = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Random position in a sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = bounds * Math.cbrt(Math.random()); // Cube root for uniform distribution

        positions[i3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = r * Math.cos(phi);

        // Initial orbital velocity (perpendicular to radius)
        const speed = Math.sqrt((G * CENTER_MASS) / r) * 0.5;
        velocities[i3] = speed * Math.sin(theta);
        velocities[i3 + 1] = -speed * Math.cos(theta);
        velocities[i3 + 2] = speed * 0.1 * (Math.random() - 0.5);

        // Random mass between 0.1 and 1
        masses[i] = 0.1 + Math.random() * 0.9;
      }

      return { positions, velocities, masses };
    };

    // Initialize particles
    const particles1 = initializeParticles(PARTICLE_COUNT, BOUNDS);
    const particles2 = initializeParticles(PARTICLE_COUNT, BOUNDS);
    const particles3 = initializeParticles(PARTICLE_COUNT, BOUNDS);
    const particles4 = initializeParticles(PARTICLE_COUNT, BOUNDS);
    const particles5 = initializeParticles(PARTICLE_COUNT, BOUNDS);

    // Create particle systems
    const createParticleSystem = (
      positions: Float32Array,
      masses: Float32Array
    ) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      // Create point material with custom colors and sizes
      const material = new THREE.PointsMaterial({
        size: 0.5,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
      });

      // Add colors based on mass
      const colors = new Float32Array(PARTICLE_COUNT * 3);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const mass = masses[i];

        // Color gradient from blue (light) to red (heavy)
        colors[i3] = Math.min(1, mass * 0.5); // R
        colors[i3 + 1] = Math.min(1, mass * 0.2); // G
        colors[i3 + 2] = Math.max(0, 1 - mass * 0.5); // B
      }
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      return new THREE.Points(geometry, material);
    };

    const particlesSystem1 = createParticleSystem(
      particles1.positions,
      particles1.masses
    );
    const particlesSystem2 = createParticleSystem(
      particles2.positions,
      particles2.masses
    );
    const particlesSystem3 = createParticleSystem(
      particles3.positions,
      particles3.masses
    );
    const particlesSystem4 = createParticleSystem(
      particles4.positions,
      particles4.masses
    );
    const particlesSystem5 = createParticleSystem(
      particles5.positions,
      particles5.masses
    );

    scene.add(particlesSystem1);
    scene.add(particlesSystem2);
    scene.add(particlesSystem3);
    scene.add(particlesSystem4);
    scene.add(particlesSystem5);

    // Create central mass
    const centralGeometry = new THREE.SphereGeometry(2, 32, 32);
    const centralMaterial = new THREE.MeshBasicMaterial({
      color: "white",
      transparent: true,
      opacity: 0.5,
    });
    const centralMass = new THREE.Mesh(centralGeometry, centralMaterial);
    scene.add(centralMass);

    // Physics update function
    const updateParticles = (
      positions: Float32Array,
      velocities: Float32Array,
      masses: Float32Array,
      minOrbitRadius: number
    ) => {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        // Calculate gravitational force from the central mass
        const dx = -positions[i3];
        const dy = -positions[i3 + 1];
        const dz = -positions[i3 + 2];

        const distSq = dx * dx + dy * dy + dz * dz;
        const dist = Math.sqrt(distSq);

        if (dist > minOrbitRadius) {
          // Avoid division by zero and prevent particles from getting too close
          const force = (G * CENTER_MASS * masses[i]) / distSq;

          // Update velocities
          velocities[i3] += (((force * dx) / dist) * TIME_STEP) / masses[i];
          velocities[i3 + 1] += (((force * dy) / dist) * TIME_STEP) / masses[i];
          velocities[i3 + 2] += (((force * dz) / dist) * TIME_STEP) / masses[i];
        }

        // Contain particles within a sphere
        const particlePosition = new THREE.Vector3(
          positions[i3],
          positions[i3 + 1],
          positions[i3 + 2]
        );
        if (particlePosition.length() > CONTAINMENT_RADIUS) {
          const containmentForce =
            (particlePosition.length() - CONTAINMENT_RADIUS) * 0.1;
          const containmentVelocity = particlePosition
            .clone()
            .normalize()
            .multiplyScalar(containmentForce);
          velocities[i3] -= containmentVelocity.x * TIME_STEP;
          velocities[i3 + 1] -= containmentVelocity.y * TIME_STEP;
          velocities[i3 + 2] -= containmentVelocity.z * TIME_STEP;
        }

        // Limit the speed of the particles
        const particleSpeed = Math.sqrt(
          velocities[i3] * velocities[i3] +
            velocities[i3 + 1] * velocities[i3 + 1] +
            velocities[i3 + 2] * velocities[i3 + 2]
        );
        if (particleSpeed > MAX_SPEED) {
          const scale = MAX_SPEED / particleSpeed;
          velocities[i3] *= scale;
          velocities[i3 + 1] *= scale;
          velocities[i3 + 2] *= scale;
        }

        // Update positions
        positions[i3] += velocities[i3] * TIME_STEP;
        positions[i3 + 1] += velocities[i3 + 1] * TIME_STEP;
        positions[i3 + 2] += velocities[i3 + 2] * TIME_STEP;
      }
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      updateParticles(
        particles1.positions,
        particles1.velocities,
        particles1.masses,
        MIN_ORBIT_RADIUS_1
      );
      updateParticles(
        particles2.positions,
        particles2.velocities,
        particles2.masses,
        MIN_ORBIT_RADIUS_2
      );
      updateParticles(
        particles3.positions,
        particles3.velocities,
        particles3.masses,
        MIN_ORBIT_RADIUS_3
      );
      updateParticles(
        particles4.positions,
        particles4.velocities,
        particles4.masses,
        MIN_ORBIT_RADIUS_4
      );
      updateParticles(
        particles5.positions,
        particles5.velocities,
        particles5.masses,
        MIN_ORBIT_RADIUS_5
      );

      particlesSystem1.geometry.attributes.position.needsUpdate = true;
      particlesSystem2.geometry.attributes.position.needsUpdate = true;
      particlesSystem3.geometry.attributes.position.needsUpdate = true;
      particlesSystem4.geometry.attributes.position.needsUpdate = true;
      particlesSystem5.geometry.attributes.position.needsUpdate = true;

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

export default GravitySimulation3;
