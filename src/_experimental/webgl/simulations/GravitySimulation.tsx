import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const GravitySimulation = () => {
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
    const PARTICLE_COUNT = 3000;
    const BOUNDS = 50;
    const G = 0.4; // Gravitational constant (scaled for visualization)
    const CENTER_MASS = 100;
    const TIME_STEP = 0.1;
    const MAX_SPEED = 0.5; // Lower maximum speed
    const MIN_DISTANCE = 20; // Minimum distance between centers of mass
    const CONTAINMENT_RADIUS = 150; // Radius of the sphere containing the centers of mass and particles

    // Function to initialize particles
    const initializeParticles = () => {
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const velocities = new Float32Array(PARTICLE_COUNT * 3);
      const masses = new Float32Array(PARTICLE_COUNT);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        // Random position in a sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = BOUNDS * Math.cbrt(Math.random()); // Cube root for uniform distribution

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
    const { positions, velocities, masses } = initializeParticles();

    // Create particle system
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Create point material with custom colors and sizes
    const material = new THREE.PointsMaterial({
      size: 0.5,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    // Add colors based on velocity
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const updateColors = () => {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const speed = Math.sqrt(
          velocities[i3] * velocities[i3] +
            velocities[i3 + 1] * velocities[i3 + 1] +
            velocities[i3 + 2] * velocities[i3 + 2]
        );

        // Color gradient from blue (slow) to red (fast)
        colors[i3] = Math.min(1, speed * 0.5); // R
        colors[i3 + 1] = Math.min(1, speed * 0.2); // G
        colors[i3 + 2] = Math.max(0, 1 - speed * 0.5); // B
      }
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    };
    updateColors();

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Create central masses
    const centers: {
      position: THREE.Vector3;
      velocity: THREE.Vector3;
      mesh?: THREE.Mesh;
    }[] = [
      { position: new THREE.Vector3(-75, 0, 0), velocity: new THREE.Vector3() },
      { position: new THREE.Vector3(75, 0, 0), velocity: new THREE.Vector3() },
      { position: new THREE.Vector3(0, 75, 0), velocity: new THREE.Vector3() },
      { position: new THREE.Vector3(0, -75, 0), velocity: new THREE.Vector3() },
      { position: new THREE.Vector3(0, 0, 75), velocity: new THREE.Vector3() },
    ];

    centers.forEach((center) => {
      const centralGeometry = new THREE.SphereGeometry(2, 32, 32);
      const centralMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.8,
      });
      const centralMass = new THREE.Mesh(centralGeometry, centralMaterial);
      centralMass.position.copy(center.position);
      scene.add(centralMass);
      center.mesh = centralMass;
    });

    // Physics update function
    const updateParticles = () => {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        // Calculate gravitational force from all central masses
        centers.forEach((center) => {
          const dx = positions[i3] - center.position.x;
          const dy = positions[i3 + 1] - center.position.y;
          const dz = positions[i3 + 2] - center.position.z;

          const distSq = dx * dx + dy * dy + dz * dz;
          const dist = Math.sqrt(distSq);

          if (dist > 0.1) {
            // Avoid division by zero
            const force = (G * CENTER_MASS * masses[i]) / distSq;

            // Update velocities
            velocities[i3] -= (((force * dx) / dist) * TIME_STEP) / masses[i];
            velocities[i3 + 1] -=
              (((force * dy) / dist) * TIME_STEP) / masses[i];
            velocities[i3 + 2] -=
              (((force * dz) / dist) * TIME_STEP) / masses[i];
          }
        });

        // Add some random perturbation
        if (Math.random() < 0.01) {
          velocities[i3] += (Math.random() - 0.5) * 0.1;
          velocities[i3 + 1] += (Math.random() - 0.5) * 0.1;
          velocities[i3 + 2] += (Math.random() - 0.5) * 0.1;
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

      geometry.attributes.position.needsUpdate = true;
      updateColors();
    };

    // Update central masses
    const updateCenters = () => {
      centers.forEach((center, i) => {
        centers.forEach((otherCenter, j) => {
          if (i !== j) {
            const dx = center.position.x - otherCenter.position.x;
            const dy = center.position.y - otherCenter.position.y;
            const dz = center.position.z - otherCenter.position.z;

            const distSq = dx * dx + dy * dy + dz * dz;
            const dist = Math.sqrt(distSq);

            if (dist > 0.1) {
              // Avoid division by zero
              const force = (G * CENTER_MASS * CENTER_MASS) / distSq;

              // Update velocities
              center.velocity.x -=
                (((force * dx) / dist) * TIME_STEP) / CENTER_MASS;
              center.velocity.y -=
                (((force * dy) / dist) * TIME_STEP) / CENTER_MASS;
              center.velocity.z -=
                (((force * dz) / dist) * TIME_STEP) / CENTER_MASS;
            }

            // Prevent centers from getting too close to each other
            if (dist < MIN_DISTANCE) {
              const repelForce = (MIN_DISTANCE - dist) * 0.1;
              center.velocity.add(
                new THREE.Vector3(dx, dy, dz)
                  .normalize()
                  .multiplyScalar(repelForce)
              );
            }
          }
        });

        // Contain centers within a sphere
        if (center.position.length() > CONTAINMENT_RADIUS) {
          const containmentForce =
            (center.position.length() - CONTAINMENT_RADIUS) * 0.1;
          center.velocity.sub(
            center.position.clone().normalize().multiplyScalar(containmentForce)
          );
        }

        // Limit the speed of the centers
        if (center.velocity.length() > MAX_SPEED) {
          center.velocity.setLength(MAX_SPEED);
        }

        // Update positions
        center.position.add(center.velocity);
        if (center.mesh) {
          center.mesh.position.copy(center.position);
        }
      });
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      updateParticles();
      updateCenters();

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

export default GravitySimulation;
