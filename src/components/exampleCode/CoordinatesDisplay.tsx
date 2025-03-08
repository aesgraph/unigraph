import * as THREE from "three";
import React, { useEffect, useState } from "react";

interface CoordinatesDisplayProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  camera: THREE.Camera | null;
}

export const CoordinatesDisplay: React.FC<CoordinatesDisplayProps> = ({
  containerRef,
  camera,
}) => {
  const [webGLCoords, setWebGLCoords] = useState<THREE.Vector3 | null>(null);
  const [canvasCoords, setCanvasCoords] = useState<THREE.Vector2 | null>(null);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!camera || !containerRef.current) return;

      const webGLPoint = new THREE.Vector3(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0
      );
      webGLPoint.unproject(camera);
      setWebGLCoords(webGLPoint);

      const canvasPoint = new THREE.Vector2(event.clientX, event.clientY);
      setCanvasCoords(canvasPoint);
    };

    const container = containerRef.current;
    container?.addEventListener("pointermove", handlePointerMove);

    return () => {
      container?.removeEventListener("pointermove", handlePointerMove);
    };
  }, [camera, containerRef]);

  return (
    <div style={{ position: "fixed", bottom: 60, left: 50, color: "black" }}>
      <p>
        WebGL Coordinates:{" "}
        {webGLCoords
          ? `${webGLCoords.x.toFixed(2)}, ${webGLCoords.y.toFixed(2)}, ${webGLCoords.z.toFixed(2)}`
          : "N/A"}
      </p>
      <p>
        Canvas Coordinates:{" "}
        {canvasCoords
          ? `${canvasCoords.x.toFixed(2)}, ${canvasCoords.y.toFixed(2)}`
          : "N/A"}
      </p>
    </div>
  );
};
