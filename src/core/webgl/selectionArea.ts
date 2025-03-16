import * as THREE from "three";
import {
  convertWorldToScreenCoordinates,
  getTopLeftBottomRightPoints,
  ScreenCoordinates,
} from "./webglHelpers";

export interface SelectionBoxGroup extends THREE.Group {
  userData: {
    anchorPoint: THREE.Vector3;
    box: THREE.Mesh;
    closeButton: THREE.Mesh;
    resizeButton: THREE.Mesh;
    anchor: THREE.Mesh;
    id: "SelectionBoxGroup";
    uuid: string;
  };
}

export const createSelectionArea = (
  startPoint: THREE.Vector3,
  endPoint: THREE.Vector3,
  camera: THREE.OrthographicCamera,
  scene: THREE.Scene,
  idOverride?: string
): SelectionBoxGroup => {
  const { topLeft, bottomRight } = getTopLeftBottomRightPoints(
    startPoint,
    endPoint
  );
  startPoint = topLeft;
  endPoint = bottomRight;

  // Create group to hold box, delete, and resize button
  const group = new THREE.Group();

  // Create box
  const width = Math.abs(endPoint.x - startPoint.x);
  const height = Math.abs(endPoint.y - startPoint.y);
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({
    color: "white",
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.2,
  });

  const box = new THREE.Mesh(geometry, material);

  box.lookAt(camera.position);
  box.position.set(
    startPoint.x + width / 2,
    startPoint.y - height / 2,
    startPoint.z + 0.1
  );

  box.userData.isSelectionArea = true;
  box.userData.onHover = () => {
    box.material.opacity = 0.5;
  };
  box.userData.onUnhover = () => {
    box.material.opacity = 0.2;
  };
  box.userData.id = "selectionBox";
  group.userData.box = box;
  group.add(box);

  //Highlight panel
  const borderGeometry = new THREE.BoxGeometry(
    width + 0.02,
    height + 0.02,
    height
  );
  const edges = new THREE.EdgesGeometry(borderGeometry);
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: "white",
    transparent: true,
    opacity: 1,
    linewidth: 20,
  });
  const line = new THREE.LineSegments(edges, edgeMaterial);
  line.userData.type = "highlightPanel";

  line.userData.toggleHighlight = (on: boolean) => {
    line.material.opacity = on ? 1 : 0;
  };

  line.position.copy(box.position);
  line.position.setZ(box.position.z);
  group.add(line);

  // Delete button
  const buttonGeometry = new THREE.PlaneGeometry(0.05, 0.05);
  const buttonMaterial = new THREE.MeshBasicMaterial({
    color: "orange",
    transparent: true,
    opacity: 0.5,
  });
  const deleteButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
  deleteButton.position.set(topLeft.x + width, topLeft.y, bottomRight.z);

  // Add event listener for delete button
  deleteButton.userData.onClick = () => {
    scene.remove(group);
  };
  deleteButton.userData.isDeleteButton = true;
  deleteButton.userData.id = "deleteButton";
  // Add delete button to group
  group.add(deleteButton);

  // Resize button
  const resizeButtonGeometry = new THREE.PlaneGeometry(0.05, 0.05);
  const resizeButtonMaterial = new THREE.MeshBasicMaterial({
    color: "grey",
    transparent: true,
    opacity: 0.5,
  });
  const resizeButton = new THREE.Mesh(
    resizeButtonGeometry,
    resizeButtonMaterial
  );
  resizeButton.position.set(bottomRight.x, bottomRight.y, bottomRight.z);
  resizeButton.userData.isResizeButton = true;
  resizeButton.userData.id = "resizeButton";
  group.userData.resizeButton = resizeButton;
  group.add(resizeButton);

  // Anchor
  const anchorGeometry = new THREE.PlaneGeometry(0.05, 0.05);
  const anchorMaterial = new THREE.MeshBasicMaterial({
    color: "blue",
    transparent: true,
    opacity: 0.5,
  });
  const anchor = new THREE.Mesh(anchorGeometry, anchorMaterial);
  anchor.position.set(startPoint.x, startPoint.y, startPoint.z);
  group.add(anchor);

  group.userData = {
    ...group.userData,
    box,
    closeButton: deleteButton,
    resizeButton,
    anchor: anchor,
    id: "SelectionBoxGroup",
    uuid: idOverride ?? Math.random().toString(36).substring(7),
  };

  return group as SelectionBoxGroup;
};

export const GetTopLeft = (group: SelectionBoxGroup) => {
  const box = group.userData.box;
  const center = box.position;
  return new THREE.Vector3(
    center.x - (box.geometry as THREE.PlaneGeometry).parameters.width / 2,
    center.y + (box.geometry as THREE.PlaneGeometry).parameters.height / 2,
    center.z
  );
};

export const GetBottomRight = (group: SelectionBoxGroup) => {
  const box = group.userData.box;
  const center = box.position;
  return new THREE.Vector3(
    center.x + (box.geometry as THREE.PlaneGeometry).parameters.width / 2,
    center.y - (box.geometry as THREE.PlaneGeometry).parameters.height / 2,
    center.z
  );
};

export const GetDimensions = (group: SelectionBoxGroup) => {
  const box = group.userData.box;
  const center = box.position;
  return {
    width: (box.geometry as THREE.PlaneGeometry).parameters.width,
    height: (box.geometry as THREE.PlaneGeometry).parameters.height,
    center,
  };
};

export const GetScreenCoordinates = (
  group: SelectionBoxGroup,
  camera: THREE.Camera,
  innerWidth: number,
  innerHeight: number
): ScreenCoordinates => {
  const topLeft = GetTopLeft(group);
  const bottomRight = GetBottomRight(group);

  const topLeftScreen = convertWorldToScreenCoordinates(
    topLeft.x,
    topLeft.y,
    camera,
    innerWidth,
    innerHeight
  );

  const bottomRightScreen = convertWorldToScreenCoordinates(
    bottomRight.x,
    bottomRight.y,
    camera,
    innerWidth,
    innerHeight
  );

  const width = Math.abs(bottomRightScreen.x - topLeftScreen.x);
  const height = Math.abs(bottomRightScreen.y - topLeftScreen.y);

  return { topLeftScreen, bottomRightScreen, width, height };
};

export function extractSelectionBoxGroups(
  intersects: THREE.Intersection[]
): SelectionBoxGroup[] {
  const ret: SelectionBoxGroup[] = [];
  for (const intersect of intersects) {
    if (
      intersect.object &&
      intersect.object?.parent?.userData?.id === "SelectionBoxGroup"
    ) {
      ret.push(intersect.object.parent as SelectionBoxGroup);
    }
  }
  return ret;
}
