import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { applyParticleEffects } from "../../../core/webgl/simulations/applyParticleEffects";
import practiceSvg2 from "../../assets/svgs/practice2.svg";

const SampleParticleEffect: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (containerRef.current && svgRef.current) {
      svgRef.current.innerHTML = practiceSvg2;
      const svgElements = Array.from(
        svgRef.current.querySelectorAll("line, circle, path")
      ) as SVGElement[];
      console.log("elements are ", svgElements);

      // Setup renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setClearColor(0x000000, 0); // Set background to transparent
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (containerRef.current) {
        containerRef.current.appendChild(renderer.domElement);
      }

      // // Load SVG directly into the scene
      const scene = new THREE.Scene();
      const loader = new SVGLoader();
      const svgData = loader.parse(practiceSvg2);
      const svgGroup = new THREE.Group();

      svgData.paths.forEach((path) => {
        console.log(path.color);
        const material = new THREE.MeshBasicMaterial({
          color: path.color,
          side: THREE.DoubleSide,
          depthWrite: false,
        });

        path.toShapes(true).forEach((shape) => {
          const geometry = new THREE.ShapeGeometry(shape);
          const mesh = new THREE.Mesh(geometry, material);
          svgGroup.add(mesh);
        });
      });

      scene.add(svgGroup);

      // Apply particle effects
      applyParticleEffects(svgElements, containerRef.current, renderer, scene);

      // Animation loop
      // const animate = () => {
      //   requestAnimationFrame(animate);
      //   renderer.render(scene, new THREE.PerspectiveCamera());
      // };

      // animate();
    }
  }, []);

  return (
    <div className="w-full h-96 bg-gray-100" style={{ position: "relative" }}>
      <div ref={containerRef} className="w-full h-96" />
      <svg
        ref={svgRef}
        width="0"
        height="0"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Stick figure SVG */}
        <circle
          cx="50"
          cy="20"
          r="10"
          stroke="black"
          strokeWidth="2"
          fill="none"
        />
        <line x1="50" y1="30" x2="50" y2="70" stroke="white" strokeWidth="2" />
        <line x1="50" y1="40" x2="30" y2="50" stroke="white" strokeWidth="2" />
        <line x1="50" y1="40" x2="70" y2="50" stroke="white" strokeWidth="2" />
        <line x1="50" y1="70" x2="40" y2="90" stroke="white" strokeWidth="2" />
        <line x1="50" y1="70" x2="60" y2="90" stroke="white" strokeWidth="2" />
        <line x1="0" y1="1.2" x2="1" y2="2" stroke="white" strokeWidth="2" />
      </svg>
      <div>HIHIHI</div>
    </div>
  );
};

export default SampleParticleEffect;
