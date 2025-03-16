import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const ParticleStickFigure: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // Helper functions
    const createLinePoints = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      count: number
    ): THREE.Vector3[] => {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        points.push(
          new THREE.Vector3(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, 0)
        );
      }
      return points;
    };

    const createCirclePoints = (
      centerX: number,
      centerY: number,
      radius: number,
      count: number
    ): THREE.Vector3[] => {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        points.push(
          new THREE.Vector3(
            centerX + Math.cos(angle) * radius,
            centerY + Math.sin(angle) * radius,
            0
          )
        );
      }
      return points;
    };

    // Define stick figure segments
    const segments = [
      // Head (circle approximated with points)
      ...createCirclePoints(0, 1.5, 0.3, 1000),
      // Body
      ...createLinePoints(0, 1.2, 0, 0, 1000),
      // Arms
      ...createLinePoints(-1, 0.5, 1, 0.5, 1000),
      // Left leg
      ...createLinePoints(0, 0, -0.8, -1.2, 1000),
      // Right leg
      ...createLinePoints(0, 0, 0.8, -1.2, 1000),
    ];

    // Create particles
    const particles = segments.map((position) => ({
      position: position.clone(),
      basePosition: position.clone(),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ),
      life: Math.random() * 100 + 100, // Particle life
    }));

    // Setup particle system
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particles.length * 3);
    const opacities = new Float32Array(1);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));

    const material = new THREE.PointsMaterial({
      color: 0x4299e1,
      size: 0.05,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1.0,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const max_life = 100;

    // Animation function
    const updateParticles = () => {
      const positions = geometry.attributes.position.array as Float32Array;
      const opacities = geometry.attributes.opacity.array as Float32Array;

      particles.forEach((particle, i) => {
        // Add random upward movement to simulate evaporation
        particle.velocity.add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.001,
            Math.min(0.1, (Math.random() - 0.5) * 0.0001 + 0.0001), // Upward movement
            (Math.random() - 0.5) * 0.001
          )
        );

        // Apply velocity
        particle.position.add(particle.velocity);

        // Decrease life
        particle.life -= Math.random();

        // Reset particle if life is over
        if (particle.life <= 0) {
          particle.position.copy(particle.basePosition);
          particle.velocity.set(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
          );
          particle.life = Math.random() * max_life;
        }

        // Update position in buffer geometry
        positions[i * 3] = particle.position.x;
        positions[i * 3 + 1] = particle.position.y;
        positions[i * 3 + 2] = particle.position.z;

        opacities[i] = Math.max(0.1, Math.min(0.3, particle.life / max_life));
        // console.log(particle.life, opacities[i]);

        // Update opacity based on life
        // console.log(particle.life);
        // material.opacity = Math.max(0.2, particle.life / 1000);
      });

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.opacity.needsUpdate = true;
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      updateParticles();
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

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

  return <div ref={containerRef} className="w-full h-96 bg-gray-100" />;
};

export default ParticleStickFigure;
