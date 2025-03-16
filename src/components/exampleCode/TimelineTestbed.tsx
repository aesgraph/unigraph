import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer";
import { Annotation } from "../lumina/AnnotationsList";

interface TimelineTestbedProps {
  annotations?: Annotation[];
}

const TimelineTestbed: React.FC<TimelineTestbedProps> = ({
  annotations = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add CSS2D renderer for labels
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    containerRef.current.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    // Initialize controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Filter annotations to only those with dates
    const datedAnnotations = annotations
      .filter((a) => a.date)
      .sort(
        (a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime()
      );

    if (datedAnnotations.length === 0) {
      console.warn("No annotations with dates found");
      return;
    }

    // Create timeline axis
    const axisGeometry = new THREE.BufferGeometry();
    const axisPoints = [
      new THREE.Vector3(-4, 0, 0),
      new THREE.Vector3(4, 0, 0),
    ];
    axisGeometry.setFromPoints(axisPoints);
    const axisMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const axisLine = new THREE.Line(axisGeometry, axisMaterial);
    scene.add(axisLine);

    // Add time markers
    const timeRange = [
      new Date(datedAnnotations[0].date!).getTime(),
      new Date(datedAnnotations[datedAnnotations.length - 1].date!).getTime(),
    ];

    datedAnnotations.forEach((annotation) => {
      const date = new Date(annotation.date!);

      // Map date to position
      const position = THREE.MathUtils.mapLinear(
        date.getTime(),
        timeRange[0],
        timeRange[1],
        -4,
        4
      );

      // Create event marker
      const markerGeometry = new THREE.SphereGeometry(0.05);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(position, 0, 0);
      scene.add(marker);

      // Add hover interaction
      marker.userData.annotation = annotation;
      marker.userData.date = date.toLocaleDateString();

      // Add label
      const labelDiv = document.createElement("div");
      labelDiv.className = "timeline-label";
      labelDiv.style.position = "absolute";
      labelDiv.style.fontSize = "12px";
      labelDiv.style.color = "white";
      labelDiv.style.backgroundColor = "rgba(0,0,0,0.7)";
      labelDiv.style.padding = "4px 8px";
      labelDiv.style.borderRadius = "4px";
      labelDiv.style.pointerEvents = "none";
      labelDiv.style.transform = "translate(-50%, -100%)";
      labelDiv.style.opacity = "0";
      labelDiv.innerHTML = `
        <div>${annotation.label}</div>
        <div style="font-size: 10px; color: #aaa;">${date.toLocaleDateString()}</div>
      `;
      containerRef.current?.appendChild(labelDiv);

      // Position label based on marker position
      const updateLabelPosition = () => {
        const vector = marker.position.clone();
        vector.project(camera);
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
        labelDiv.style.left = `${x}px`;
        labelDiv.style.top = `${y}px`;
      };

      // Add hover effects
      marker.userData.onMouseEnter = () => {
        markerMaterial.color.setHex(0xff00ff);
        labelDiv.style.opacity = "1";
        marker.scale.set(1.5, 1.5, 1.5);
      };

      marker.userData.onMouseLeave = () => {
        markerMaterial.color.setHex(0x00ffff);
        labelDiv.style.opacity = "0";
        marker.scale.set(1, 1, 1);
      };

      // Store update function for animation loop
      marker.userData.updateLabel = updateLabelPosition;
    });

    // Add timestamp markers and labels
    const addTimeMarker = (date: Date, position: number) => {
      // Create marker line
      const markerGeometry = new THREE.BufferGeometry();
      const markerPoints = [
        new THREE.Vector3(position, -0.1, 0),
        new THREE.Vector3(position, 0.1, 0),
      ];
      markerGeometry.setFromPoints(markerPoints);
      const markerLine = new THREE.Line(
        markerGeometry,
        new THREE.LineBasicMaterial({ color: 0x666666 })
      );
      scene.add(markerLine);

      // Create timestamp label
      const labelDiv = document.createElement("div");
      labelDiv.className = "timeline-timestamp";
      labelDiv.textContent = date.getFullYear().toString();
      labelDiv.style.color = "#ffffff";
      labelDiv.style.fontSize = "10px";
      labelDiv.style.fontFamily = "monospace";
      labelDiv.style.padding = "2px";

      const label = new CSS2DObject(labelDiv);
      label.position.set(position, -0.2, 0);
      scene.add(label);
    };

    // Add timestamp markers at regular intervals
    const yearRange = [
      new Date(timeRange[0]).getFullYear(),
      new Date(timeRange[1]).getFullYear(),
    ];

    // Calculate appropriate interval for timestamps
    const totalYears = yearRange[1] - yearRange[0];
    const interval = Math.ceil(totalYears / 10); // Show max 10 timestamps

    for (let year = yearRange[0]; year <= yearRange[1]; year += interval) {
      const position = THREE.MathUtils.mapLinear(
        new Date(year, 0).getTime(),
        timeRange[0],
        timeRange[1],
        -4,
        4
      );
      addTimeMarker(new Date(year, 0), position);
    }

    // Create image box labels map
    const imageBoxLabels = new Map<
      string,
      { label: string; position: number }
    >();

    datedAnnotations.forEach((annotation) => {
      if (!imageBoxLabels.has(annotation.imageBoxId)) {
        const date = new Date(annotation.date!);
        const position = THREE.MathUtils.mapLinear(
          date.getTime(),
          timeRange[0],
          timeRange[1],
          -4,
          4
        );
        imageBoxLabels.set(annotation.imageBoxId, {
          label: annotation.label.split(" ")[0], // Get first word of label
          position: position,
        });
      }
    });

    // Add image box labels perpendicular to timeline
    imageBoxLabels.forEach((data, _imageBoxId) => {
      // Create vertical line
      const lineGeometry = new THREE.BufferGeometry();
      const linePoints = [
        new THREE.Vector3(data.position, 0, 0),
        new THREE.Vector3(data.position, 1.5, 0), // Extend up by 1.5 units
      ];
      lineGeometry.setFromPoints(linePoints);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x666666,
        opacity: 0.5,
        transparent: true,
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);

      // Add image box label at the top of the line
      const labelDiv = document.createElement("div");
      labelDiv.className = "image-box-label";
      labelDiv.style.color = "#ffffff";
      labelDiv.style.fontSize = "14px";
      labelDiv.style.fontFamily = "Arial";
      labelDiv.style.padding = "4px 8px";
      labelDiv.style.backgroundColor = "rgba(0,0,0,0.7)";
      labelDiv.style.borderRadius = "4px";
      labelDiv.style.whiteSpace = "nowrap";
      labelDiv.textContent = data.label;

      const label = new CSS2DObject(labelDiv);
      label.position.set(data.position, 1.7, 0); // Slightly above the line
      scene.add(label);
    });

    // Initialize mouse and raycaster
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    // Update mouse interaction to handle hover
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children);
      let hoveredMarker = false;

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.userData.annotation) {
          if (intersects[0]?.object === object) {
            object.userData.onMouseEnter();
            hoveredMarker = true;
          } else if (!hoveredMarker) {
            object.userData.onMouseLeave();
          }
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      // Update all labels
      scene.traverse((object) => {
        if (object.userData.updateLabel) {
          object.userData.updateLabel();
        }
      });

      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      containerRef.current?.removeChild(labelRenderer.domElement);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        }
      });
    };
  }, [annotations]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    />
  );
};

export default TimelineTestbed;
