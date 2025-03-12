import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import { getRandomColor } from "../../utils/colorUtils";
import { NodeId } from "../model/Node";
import { SceneGraph } from "../model/SceneGraph";
import { createBoxOutline, ImageBox, ImageData } from "./renderImageBox";

export const createRandomBoxesForImage = (
  imageGroup: THREE.Group,
  imageId: string,
  count: number = 3
) => {
  const boxesForImage: ImageBox[] = [];
  const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

  for (let i = 0; i < count; i++) {
    // Random box dimensions
    const width = 0.2 + Math.random() * 0.5;
    const height = 0.2 + Math.random() * 0.5;

    // Random position within image bounds (assuming image is 3x2)
    const x = (Math.random() - 0.5) * 2.5;
    const y = (Math.random() - 0.5) * 1.5;

    const points = [];
    points.push(new THREE.Vector3(x - width / 2, y - height / 2, 0.01));
    points.push(new THREE.Vector3(x + width / 2, y - height / 2, 0.01));
    points.push(new THREE.Vector3(x + width / 2, y + height / 2, 0.01));
    points.push(new THREE.Vector3(x - width / 2, y + height / 2, 0.01));
    points.push(new THREE.Vector3(x - width / 2, y - height / 2, 0.01));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const box = new THREE.Line(geometry, material);
    imageGroup.add(box);

    boxesForImage.push({
      id: uuidv4(),
      imageId,
      position: new THREE.Vector3(x, y, 0),
      width,
      height,
    });
  }

  return boxesForImage;
};

const createRandomLinks = (
  scene: THREE.Scene,
  images: ImageData[],
  links: (THREE.Mesh | THREE.Line)[]
) => {
  const allBoxes = images.flatMap((img) => img.boxes);

  allBoxes.forEach((box1, i) => {
    const linkCount = 1 + Math.floor(Math.random() * 2);
    for (let j = 0; j < linkCount; j++) {
      const targetIndex = Math.floor(Math.random() * allBoxes.length);
      if (targetIndex !== i) {
        const box2 = allBoxes[targetIndex];
        const sourceImage = images.find((img) => img.id === box1.imageId);
        const targetImage = images.find((img) => img.id === box2.imageId);

        if (sourceImage && targetImage) {
          // Get world positions
          const sourcePos = new THREE.Vector3(
            box1.position.x,
            box1.position.y,
            0.01
          ).applyMatrix4(sourceImage.group.matrixWorld);
          const targetPos = new THREE.Vector3(
            box2.position.x,
            box2.position.y,
            0.01
          ).applyMatrix4(targetImage.group.matrixWorld);

          // Create curved path for tube
          const curve = new THREE.CatmullRomCurve3([
            sourcePos,
            new THREE.Vector3(
              (sourcePos.x + targetPos.x) / 2,
              (sourcePos.y + targetPos.y) / 2,
              (sourcePos.z + targetPos.z) / 2 + 0.5 // Add slight curve upward
            ),
            targetPos,
          ]);

          const color = getRandomColor();

          // Create tube geometry for connection
          const tubeGeometry = new THREE.TubeGeometry(
            curve,
            32, // tubularSegments
            0.02, // radius
            8, // radialSegments
            false // closed
          );

          const tubeMaterial = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.5,
            depthTest: false,
          });

          const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
          scene.add(tube);
          links.push(tube);

          // Create box outlines with same color
          const sourceCorners = createBoxOutline(box1, sourceImage.group);
          const targetCorners = createBoxOutline(box2, targetImage.group);

          const sourceGeometry = new THREE.BufferGeometry().setFromPoints(
            sourceCorners
          );
          const targetGeometry = new THREE.BufferGeometry().setFromPoints(
            targetCorners
          );

          const outlineMaterial = new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: 0.5,
            depthTest: false,
          });

          const sourceOutline = new THREE.Line(sourceGeometry, outlineMaterial);
          const targetOutline = new THREE.Line(targetGeometry, outlineMaterial);

          scene.add(sourceOutline);
          scene.add(targetOutline);
          links.push(sourceOutline, targetOutline);
        }
      }
    }
  });
};

/**
 * Renders edges between image boxes based on the scene graph structure
 * @param scene The THREE.js scene to add links to
 * @param images Array of image data with their image boxes
 * @param links Array to store the created link objects
 * @param sceneGraph Scene graph containing the edge information
 */
export const renderLinksBetweenImageBoxes = (
  scene: THREE.Scene,
  images: ImageData[],
  links: (THREE.Mesh | THREE.Line)[],
  sceneGraph: SceneGraph
): void => {
  // Clear any existing links from the array
  while (links.length > 0) {
    const link = links.pop();
    if (link) scene.remove(link);
  }

  console.log(
    `Rendering links between image boxes for ${images.length} images`
  );

  // Get all image boxes
  const allBoxes = images.flatMap((img) => img.boxes);
  const boxIdToBox = new Map<string, ImageBox>();
  allBoxes.forEach((box) => boxIdToBox.set(box.id, box));

  // Get all edges from the scene graph that connect image boxes
  const imageBoxNodes = sceneGraph.getGraph().getNodesByType("imageBox");
  const imageBoxIds = new Set(imageBoxNodes.getIds().toArray());

  const edges = sceneGraph.getGraph().getEdges().toArray();
  const imageBoxEdges = edges.filter(
    (edge) =>
      imageBoxIds.has(edge.getSource() as NodeId) &&
      imageBoxIds.has(edge.getTarget() as NodeId)
  );

  console.log(`Found ${imageBoxEdges.length} edges between image boxes`);

  // Create visual links for each edge
  imageBoxEdges.forEach((edge) => {
    const sourceId = edge.getSource() as string;
    const targetId = edge.getTarget() as string;

    const sourceBox = boxIdToBox.get(sourceId);
    const targetBox = boxIdToBox.get(targetId);

    if (!sourceBox || !targetBox) return;

    const sourceImage = images.find((img) => img.id === sourceBox.imageId);
    const targetImage = images.find((img) => img.id === targetBox.imageId);

    if (!sourceImage || !targetImage) return;

    // Get world positions
    const sourcePos = new THREE.Vector3(
      sourceBox.position.x,
      sourceBox.position.y,
      0.01
    ).applyMatrix4(sourceImage.group.matrixWorld);

    const targetPos = new THREE.Vector3(
      targetBox.position.x,
      targetBox.position.y,
      0.01
    ).applyMatrix4(targetImage.group.matrixWorld);

    // Determine color from edge type or data
    const color = edge.getData()?.userData?.color || getRandomColor();

    // Create curved path for tube
    const curve = new THREE.CatmullRomCurve3([
      sourcePos,
      new THREE.Vector3(
        (sourcePos.x + targetPos.x) / 2,
        (sourcePos.y + targetPos.y) / 2,
        (sourcePos.z + targetPos.z) / 2 + 0.5 // Add slight curve upward
      ),
      targetPos,
    ]);

    // Create tube geometry for connection
    const tubeGeometry = new THREE.TubeGeometry(
      curve,
      32, // tubularSegments
      0.02, // radius
      8, // radialSegments
      false // closed
    );

    const tubeMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.6,
      depthTest: false,
    });

    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    scene.add(tube);
    links.push(tube);

    // Optional: Create box outlines with the same color
    const sourceCorners = createBoxOutline(sourceBox, sourceImage.group);
    const targetCorners = createBoxOutline(targetBox, targetImage.group);

    const sourceGeometry = new THREE.BufferGeometry().setFromPoints(
      sourceCorners
    );
    const targetGeometry = new THREE.BufferGeometry().setFromPoints(
      targetCorners
    );

    const outlineMaterial = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      depthTest: false,
    });

    const sourceOutline = new THREE.Line(sourceGeometry, outlineMaterial);
    const targetOutline = new THREE.Line(targetGeometry, outlineMaterial);

    scene.add(sourceOutline);
    scene.add(targetOutline);
    links.push(sourceOutline, targetOutline);
  });

  console.log(`Created ${links.length} visual link objects`);
};
