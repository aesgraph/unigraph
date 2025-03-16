import * as THREE from "three";
import { ImageData } from "./renderImageBox";

interface ImageLayoutOptions {
  type: "grid2d" | "random3d" | "stack";
  gridOptions?: {
    cols: number;
    spacing: {
      x: number;
      y: number;
      z: number;
    };
  };
  randomOptions?: {
    bounds: {
      x: [number, number];
      y: [number, number];
      z: [number, number];
    };
  };
  stackOptions?: {
    spacing: number;
  };
}

export const applyImageLayout = (
  scene: THREE.Scene,
  images: ImageData[],
  links: (THREE.Mesh | THREE.Line)[],
  options: ImageLayoutOptions = {
    type: "grid2d",
    gridOptions: {
      cols: 3,
      spacing: { x: 3, y: 2, z: 3 },
    },
    randomOptions: {
      bounds: {
        x: [-10, 10],
        y: [-10, 10],
        z: [-10, 10],
      },
    },
    stackOptions: {
      spacing: 0.5,
    },
  },
  _drawLinks: boolean = true
) => {
  // Clear existing links
  links.forEach((link) => scene.remove(link));
  links.length = 0;

  if (options.type === "grid2d") {
    const { cols, spacing } = options.gridOptions!;
    images.forEach((image, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      image.group.position.set(col * spacing.x, row * spacing.y, 0);
      image.group.updateMatrixWorld(true);
    });
  } else if (options.type === "random3d") {
    const { bounds } = options.randomOptions!;
    images.forEach((image) => {
      const x = bounds.x[0] + Math.random() * (bounds.x[1] - bounds.x[0]);
      const y = bounds.y[0] + Math.random() * (bounds.y[1] - bounds.y[0]);
      const z = bounds.z[0] + Math.random() * (bounds.z[1] - bounds.z[0]);
      image.group.position.set(x, y, z);
      image.group.updateMatrixWorld(true);
    });
  } else if (options.type === "stack") {
    const spacing = options.stackOptions?.spacing || 0.5;
    images.forEach((image, index) => {
      image.group.position.set(0, 0, -index * spacing);
      image.group.rotation.set(0, 0, 0);

      // Make later images slightly transparent
      const opacity = Math.max(0.3, 1 - index * 0.15);
      image.group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshBasicMaterial;
          if (material.map) {
            material.transparent = true;
            material.opacity = opacity;
          }
        }
      });

      image.group.updateMatrixWorld(true);
    });
  }
};
