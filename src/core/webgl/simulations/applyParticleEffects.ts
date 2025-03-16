import * as THREE from "three";

const scalePointsToBox = (
  points: THREE.Vector3[],
  boxSize: number
): THREE.Vector3[] => {
  const boundingBox = new THREE.Box3().setFromPoints(points);
  const size = boundingBox.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = boxSize / maxDim;

  return points.map((point) => point.multiplyScalar(scale));
};

const adjustCameraToFitParticles = (
  camera: THREE.PerspectiveCamera,
  particles: { position: THREE.Vector3 }[]
) => {
  const boundingBox = new THREE.Box3();
  particles.forEach((particle) => {
    boundingBox.expandByPoint(particle.position);
  });

  const _center = boundingBox.getCenter(new THREE.Vector3());
  const size = boundingBox.getSize(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

  cameraZ *= 3; // Add some padding

  camera.position.z = cameraZ;

  const minZ = boundingBox.min.z;
  const cameraToFarEdge = minZ < 0 ? -minZ + cameraZ : cameraZ - minZ;

  camera.far = cameraToFarEdge * 3;
  camera.updateProjectionMatrix();

  console.log("camera z is ", camera.position.z);
};

export function applyParticleEffects(
  svgElements: SVGElement[],
  container: HTMLDivElement,
  renderer: THREE.WebGLRenderer,
  scene?: THREE.Scene,
  camera?: THREE.PerspectiveCamera
) {
  // Setup scene
  if (scene == null) {
    scene = new THREE.Scene();
  }
  if (camera == null) {
    camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 10; // Adjusted camera position
  }

  //   // Setup renderer
  //   const renderer = new THREE.WebGLRenderer({ antialias: true });
  //   renderer.setSize(container.clientWidth, container.clientHeight);
  //   container.appendChild(renderer.domElement);

  // Helper functions
  const createLinePoints = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    count: number,
    width: number
  ): THREE.Vector3[] => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      points.push(
        new THREE.Vector3(x1 + (x2 - x1) * t, -(y1 + (y2 - y1) * t), 0)
      );
      if (width > 0) {
        points.push(
          new THREE.Vector3(
            x1 + (x2 - x1) * t,
            -(y1 + (y2 - y1) * t) + width,
            0
          )
        );
        points.push(
          new THREE.Vector3(
            x1 + (x2 - x1) * t,
            -(y1 + (y2 - y1) * t) - width,
            0
          )
        );
      }
    }
    return points;
  };

  const createCirclePoints = (
    centerX: number,
    centerY: number,
    radius: number,
    count: number,
    width: number
  ): THREE.Vector3[] => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          centerX + Math.cos(angle) * radius,
          -(centerY + Math.sin(angle) * radius),
          0
        )
      );
      if (width > 0) {
        points.push(
          new THREE.Vector3(
            centerX + Math.cos(angle) * (radius + width),
            -(centerY + Math.sin(angle) * (radius + width)),
            0
          )
        );
        points.push(
          new THREE.Vector3(
            centerX + Math.cos(angle) * (radius - width),
            -(centerY + Math.sin(angle) * (radius - width)),
            0
          )
        );
      }
    }
    return points;
  };

  const createPathPoints = (
    path: SVGPathElement,
    count: number,
    width: number
  ): THREE.Vector3[] => {
    const length = path.getTotalLength();
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const point = path.getPointAtLength((i / (count - 1)) * length);
      points.push(new THREE.Vector3(point.x, -point.y, 0));
      if (width > 0) {
        points.push(new THREE.Vector3(point.x, -point.y + width, 0));
        points.push(new THREE.Vector3(point.x, -point.y - width, 0));
      }
    }
    return points;
  };

  // Parse SVG elements and create particles
  const particles: {
    position: THREE.Vector3;
    basePosition: THREE.Vector3;
    velocity: THREE.Vector3;
    life: number;
  }[] = [];

  svgElements.forEach((element) => {
    const tagName = element.tagName.toLowerCase();
    const strokeWidth = parseFloat(element.getAttribute("stroke-width") || "0");
    if (tagName === "line") {
      const x1 = parseFloat(element.getAttribute("x1") || "0");
      const y1 = parseFloat(element.getAttribute("y1") || "0");
      const x2 = parseFloat(element.getAttribute("x2") || "0");
      const y2 = parseFloat(element.getAttribute("y2") || "0");
      const linePoints = createLinePoints(x1, y1, x2, y2, 100, strokeWidth);
      linePoints.forEach((point) => {
        particles.push({
          position: point.clone(),
          basePosition: point.clone(),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
          ),
          life: Math.random() * 100 + 100,
        });
      });
    } else if (tagName === "circle") {
      const cx = parseFloat(element.getAttribute("cx") || "0");
      const cy = parseFloat(element.getAttribute("cy") || "0");
      const r = parseFloat(element.getAttribute("r") || "0");
      const circlePoints = createCirclePoints(cx, cy, r, 100, strokeWidth);
      circlePoints.forEach((point) => {
        particles.push({
          position: point.clone(),
          basePosition: point.clone(),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
          ),
          life: Math.random() * 100 + 100,
        });
      });
    } else if (tagName === "path") {
      const pathPoints = createPathPoints(
        element as SVGPathElement,
        5000,
        strokeWidth
      );
      pathPoints.forEach((point) => {
        particles.push({
          position: point.clone(),
          basePosition: point.clone(),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
          ),
          life: Math.random() * 100 + 100,
        });
      });
    }
  });

  // Collect all particle positions
  const allPositions = particles.map((particle) => particle.position);

  // Scale particle positions to fit within a fixed box
  const boxSize = 10;
  const scaledPositions = scalePointsToBox(allPositions, boxSize);

  // Update particles with scaled positions
  particles.forEach((particle, index) => {
    particle.position.copy(scaledPositions[index]);
    particle.basePosition.copy(scaledPositions[index]);
  });

  // Adjust camera to fit particles
  adjustCameraToFitParticles(camera, particles);

  // Setup particle system
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particles.length * 3);
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  console.log("positions are ", positions);

  const material = new THREE.PointsMaterial({
    color: 0x4299e1,
    size: 0.05,
    sizeAttenuation: true,
    transparent: true,
    opacity: 1.0,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Animation function
  const updateParticles = () => {
    const positions = geometry.attributes.position.array as Float32Array;

    particles.forEach((particle, i) => {
      // Add random upward movement to simulate evaporation
      particle.velocity.add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.001,
          (Math.random() - 0.5) * 0.001 + 0.002, // Upward movement
          (Math.random() - 0.5) * 0.001
        )
      );

      // Apply velocity
      particle.position.add(particle.velocity);

      // Decrease life
      particle.life -= 1;

      // Reset particle if life is over
      if (particle.life <= 0) {
        particle.position.copy(particle.basePosition);
        particle.velocity.set(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        );
        particle.life = Math.random() * 100 + 100;
      }

      // Update position in buffer geometry
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;

      // Update opacity based on life
      material.opacity = Math.max(1, particle.life / 200);
    });

    geometry.attributes.position.needsUpdate = true;
  };

  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate);
    updateParticles();
    renderer.render(scene, camera);
    console.log("animating", positions.length);
  };

  animate();

  // Handle window resize
  const handleResize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  window.addEventListener("resize", handleResize);

  // Cleanup
  return () => {
    window.removeEventListener("resize", handleResize);
    container.removeChild(renderer.domElement);
  };
}
