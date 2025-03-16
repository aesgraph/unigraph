import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const StickFigure3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Materials
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });

    // Create stick figure geometry
    interface LimbPoints {
      start: [number, number, number];
      end: [number, number, number];
    }

    const createLimb = (
      start: LimbPoints["start"],
      end: LimbPoints["end"]
    ): THREE.BufferGeometry => {
      const points: THREE.Vector3[] = [];
      points.push(new THREE.Vector3(...start));
      points.push(new THREE.Vector3(...end));
      return new THREE.BufferGeometry().setFromPoints(points);
    };

    // Body parts
    const body = new THREE.Line(createLimb([0, 0, 0], [0, 2, 0]), material);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    );
    head.position.set(0, 2.3, 0);

    // Arms
    const leftArm = new THREE.Line(
      createLimb([-0.2, 1.5, 0], [-1, 1, 0]),
      material
    );
    const rightArm = new THREE.Line(
      createLimb([0.2, 1.5, 0], [1, 1, 0]),
      material
    );

    // Legs
    const leftLeg = new THREE.Line(
      createLimb([-0.2, 0, 0], [-0.5, -1.5, 0]),
      material
    );
    const rightLeg = new THREE.Line(
      createLimb([0.2, 0, 0], [0.5, -1.5, 0]),
      material
    );

    // Add all parts to scene
    scene.add(body);
    scene.add(head);
    scene.add(leftArm);
    scene.add(rightArm);
    scene.add(leftLeg);
    scene.add(rightLeg);

    // Position camera
    camera.position.z = 5;

    // Animation setup
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate the entire figure
      body.rotation.y += 0.01;
      head.rotation.y += 0.01;
      leftArm.rotation.y += 0.01;
      rightArm.rotation.y += 0.01;
      leftLeg.rotation.y += 0.01;
      rightLeg.rotation.y += 0.01;

      // Add some subtle movement
      const time = Date.now() * 0.001;
      head.position.y = 2.3 + Math.sin(time) * 0.05;
      leftArm.rotation.x = Math.sin(time) * 0.2;
      rightArm.rotation.x = Math.sin(time + Math.PI) * 0.2;
      leftLeg.rotation.x = Math.sin(time + Math.PI) * 0.1;
      rightLeg.rotation.x = Math.sin(time) * 0.1;

      renderer.render(scene, camera);
    };

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
      window.removeEventListener("resize", handleResize);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      containerRef.current?.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
    };
  }, []);

  return <div ref={containerRef} className="h-screen w-full" />;
};

export default StickFigure3D;
