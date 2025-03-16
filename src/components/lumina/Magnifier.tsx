import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./Magnifier.css";

interface MagnifierProps {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  zoom: number;
  size: number;
}

const Magnifier: React.FC<MagnifierProps> = ({
  // eslint-disable-next-line unused-imports/no-unused-vars
  scene,
  // eslint-disable-next-line unused-imports/no-unused-vars
  camera,
  renderer,
  zoom,
  size,
}) => {
  const magnifierRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setPosition({ x, y });
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousemove", handleMouseMove);
    return () => {
      domElement.removeEventListener("mousemove", handleMouseMove);
    };
  }, [renderer]);

  useEffect(() => {
    if (magnifierRef.current) {
      const magnifierCanvas = document.createElement("canvas");
      magnifierCanvas.width = size;
      magnifierCanvas.height = size;
      const magnifierContext = magnifierCanvas.getContext("2d");

      const renderMagnifier = () => {
        if (magnifierContext) {
          magnifierContext.clearRect(0, 0, size, size);
          magnifierContext.drawImage(
            renderer.domElement,
            position.x - size / (2 * zoom),
            position.y - size / (2 * zoom),
            size / zoom,
            size / zoom,
            0,
            0,
            size,
            size
          );
          magnifierRef.current!.style.backgroundImage = `url(${magnifierCanvas.toDataURL()})`;
        }
        requestAnimationFrame(renderMagnifier);
      };

      renderMagnifier();
    }
  }, [position, renderer, zoom, size]);

  return (
    <div
      ref={magnifierRef}
      className="magnifier"
      style={{
        width: size,
        height: size,
        left: position.x + 20,
        top: position.y + 20,
      }}
    />
  );
};

export default Magnifier;
