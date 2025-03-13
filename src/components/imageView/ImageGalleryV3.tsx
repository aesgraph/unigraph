import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { renderLinksBetweenImageBoxes } from "../../core/layouts/imageBoxUtils";
import { applyImageLayout } from "../../core/layouts/imageLayoutEngine";
import {
  ImageBox,
  ImageData,
  loadImageBoxesFromSceneGraph,
  loadImagesFromSceneGraph,
} from "../../core/layouts/renderImageBox";
import { SceneGraph } from "../../core/model/SceneGraph";
import { ImageBoxData } from "../../core/types/ImageBoxData";
import AnnotationsList, { Annotation } from "../lumina/AnnotationsList";
import ImageBoxList from "../lumina/ImageBoxList";
import ImageBoxWizard from "../lumina/ImageBoxWizard"; // Import ImageBoxWizard
import LayoutSwitcher from "../lumina/LayoutSwitcher";
import ImageOptionsPanel from "./ImageOptionsPanel";

interface ImageGalleryV3Props {
  sceneGraph: SceneGraph;
  addRandomImageBoxes?: boolean;
  defaultLinksEnabled?: boolean;
  defaultImageBoxRenderSettings?: ImageBoxRenderSettings;
}

type ImageBoxRenderSettings = {
  color: string;
  opacity: number;
};

const ImageGalleryV3: React.FC<ImageGalleryV3Props> = ({
  sceneGraph: initialSceneGraph,
  addRandomImageBoxes = false,
  defaultLinksEnabled = true,
  defaultImageBoxRenderSettings = {
    color: "#ff0000",
    opacity: 1,
  },
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const imagesData = useRef<ImageData[]>([]);
  const links = useRef<(THREE.Mesh | THREE.Line)[]>([]);
  const scene = useRef<THREE.Scene>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [hoveredImageBoxId, setHoveredImageBoxId] = useState<string | null>(
    null
  );
  const [selectedImageBoxId, setSelectedImageBoxId] = useState<string | null>(
    null
  );

  const [currentLayout, setCurrentLayout] = useState<
    "grid2d" | "random3d" | "stack"
  >("stack");
  const [linksEnabled, setLinksEnabled] = useState(defaultLinksEnabled);
  const [allImageBoxes, setAllImageBoxes] = useState<ImageBoxData[]>([]);
  const connectionLine = useRef<THREE.Line | null>(null);
  const cameraRef = useRef<
    THREE.PerspectiveCamera | THREE.OrthographicCamera | null
  >(null);
  const imageBoxMap = useRef<Map<string, ImageBox>>(new Map());
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const flyControlsRef = useRef<FlyControls | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [filteredAnnotations, setFilteredAnnotations] = useState<Annotation[]>(
    []
  );
  const annotationConnectionLines = useRef<THREE.Line[]>([]);
  const [temporaryFilterBoxId, setTemporaryFilterBoxId] = useState<
    string | null
  >(null);
  const [showOptions, setShowOptions] = useState(false);
  const [imageBoxRenderSettings, setImageBoxRenderSettings] =
    useState<ImageBoxRenderSettings>(defaultImageBoxRenderSettings);
  const [currentSceneGraph, setCurrentSceneGraph] = useState(initialSceneGraph);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingImageBox, setEditingImageBox] = useState<ImageBoxData | null>(
    null
  );

  const handleLayoutChange = useCallback(
    (newLayout: "grid2d" | "random3d" | "stack") => {
      if (!scene.current || !imagesData.current) return;

      setCurrentLayout(newLayout);
      applyImageLayout(
        scene.current,
        imagesData.current,
        links.current,
        {
          type: newLayout,
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
        linksEnabled && newLayout !== "stack"
      );

      // After applying layout, render the links between image boxes
      if (linksEnabled && newLayout !== "stack") {
        renderLinksBetweenImageBoxes(
          scene.current,
          imagesData.current,
          links.current,
          currentSceneGraph
        );
      }

      // Update camera and controls based on layout
      if (cameraRef.current && orbitControlsRef.current) {
        if (newLayout === "grid2d") {
          cameraRef.current.position.set(0, 0, 5);
          orbitControlsRef.current.enableRotate = false;
          orbitControlsRef.current.minDistance = 2;
          orbitControlsRef.current.maxDistance = 10;
        } else if (newLayout === "random3d" || newLayout === "stack") {
          cameraRef.current.position.set(0, 0, 5);
          orbitControlsRef.current.enableRotate = true;
          orbitControlsRef.current.minDistance = 2;
          orbitControlsRef.current.maxDistance = 20;
        }
        cameraRef.current.lookAt(0, 0, 0);
      }
    },
    [linksEnabled, currentSceneGraph]
  );

  const toggleLinks = () => {
    if (linksEnabled) {
      // Remove tubes from the scene
      links.current.forEach((link) => {
        if (link instanceof THREE.Mesh || link instanceof THREE.Line) {
          scene.current?.remove(link);
        }
      });
    } else {
      // Add tubes back to the scene
      links.current.forEach((link) => {
        if (link instanceof THREE.Mesh || link instanceof THREE.Line) {
          scene.current?.add(link);
        }
      });
    }
    setLinksEnabled(!linksEnabled);
  };

  const handleEditImageBox = useCallback((imageBoxData: ImageBoxData) => {
    setEditingImageBox(imageBoxData);
    setIsWizardOpen(true);
  }, []);

  const handleWizardSubmit = useCallback(
    (updatedImageBox: ImageBoxData, newAnnotations: Annotation[]) => {
      // Update the image box data
      setAllImageBoxes((prevBoxes) =>
        prevBoxes.map((box) =>
          box.id === updatedImageBox.id ? updatedImageBox : box
        )
      );

      // Update annotations
      setAnnotations((prevAnnotations) => [
        ...prevAnnotations.filter((a) => a.imageBoxId !== updatedImageBox.id),
        ...newAnnotations,
      ]);

      // Close wizard
      setIsWizardOpen(false);
      setEditingImageBox(null);
    },
    []
  );

  const handleWizardCancel = useCallback(() => {
    setIsWizardOpen(false);
    setEditingImageBox(null);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    console.log("useEffect triggered");

    scene.current = new THREE.Scene();
    scene.current.background = new THREE.Color(0x2c2c2c);

    // Setup scene
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera; // Store camera reference

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer; // Store renderer reference

    // Setup OrbitControls with updated defaults
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.25;
    orbitControls.enableZoom = true;
    orbitControls.enableRotate = currentLayout !== "grid2d"; // Set initial rotation based on layout
    orbitControls.minDistance = 2;
    orbitControls.maxDistance = currentLayout === "grid2d" ? 10 : 20;
    orbitControlsRef.current = orbitControls;

    // Setup FlyControls
    const flyControls = new FlyControls(camera, renderer.domElement);
    flyControls.movementSpeed = 0.5;
    flyControls.rollSpeed = Math.PI / 48;
    flyControls.autoForward = false;
    flyControls.dragToLook = true;
    flyControlsRef.current = flyControls; // Store fly controls reference

    // Load images from SceneGraph
    loadImagesFromSceneGraph(
      scene.current,
      currentSceneGraph,
      renderer,
      addRandomImageBoxes
    ).then((images) => {
      imagesData.current = images;
      const imageBoxes = loadImageBoxesFromSceneGraph(
        images,
        currentSceneGraph
      );

      // Apply initial render settings to all boxes
      scene.current?.traverse((child) => {
        if (child.userData?.type === "imageBox") {
          const lineMaterial = child.userData.lineMaterial;
          if (lineMaterial) {
            const color = new THREE.Color(imageBoxRenderSettings.color);
            lineMaterial.color.copy(color);
            lineMaterial.opacity = imageBoxRenderSettings.opacity;
          }
        }
      });

      // Populate the imageBoxMap
      imageBoxes.forEach((box) => {
        const imageBox = images
          .flatMap((img) => img.boxes)
          .find((b) => b.id === box.id);
        if (imageBox) {
          imageBoxMap.current.set(box.id, imageBox);
        }
      });

      setAllImageBoxes(imageBoxes);

      handleLayoutChange(currentLayout);
    });

    // Function to determine opacity based on distance
    const calculateOpacity = (
      distance: number,
      minDistance: number,
      maxDistance: number
    ) => {
      return Math.min(
        1,
        Math.max(0, (distance - minDistance) / (maxDistance - minDistance))
      );
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update opacity based on distance
      imagesData.current.forEach((image) => {
        const distance = camera.position.distanceTo(image.group.position);
        const opacity = calculateOpacity(distance, 1, 1.4);

        const imageMaterial = image.group.userData
          .imageMaterial as THREE.MeshBasicMaterial;
        imageMaterial.opacity = opacity;
      });

      orbitControls.update();
      flyControls.update(0.1);
      renderer.render(scene.current!, camera);
    };

    // Handle mouse move
    const handleMouseMoveEvent = (event: MouseEvent) => {
      handleMouseMove(
        event,
        camera,
        scene.current!,
        raycaster.current,
        mouse.current
      );
    };

    const handleMouseClickEvent = (event: MouseEvent) => {
      if (!scene.current || !cameraRef.current) return;

      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );

      raycaster.current.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.current.intersectObjects(
        scene.current.children,
        true
      );

      console.log("CLICKED!", intersects.length);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (intersectedObject.userData.type === "imageBox") {
          console.log("yep");
          handleBoxClick(intersectedObject.userData.id);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMoveEvent);
    window.addEventListener("click", handleMouseClickEvent); // Add this line

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
      window.removeEventListener("mousemove", handleMouseMoveEvent);
      window.removeEventListener("click", handleMouseClickEvent); // Add this line
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [
    handleLayoutChange,
    currentLayout,
    currentSceneGraph,
    imageBoxRenderSettings,
  ]); // Removed hoveredBoxId dependency

  // useEffect(() => {
  // Generate random annotations for the image boxes
  // const generatedAnnotations = generateRandomAnnotations(allImageBoxes);
  // setAnnotations(generatedAnnotations);
  // setAnnotations(solvay_annotations);
  // }, [allImageBoxes]);

  useEffect(() => {
    if (temporaryFilterBoxId) {
      // Temporary hover filter takes precedence
      const filtered = annotations.filter(
        (annotation) => annotation.imageBoxId === temporaryFilterBoxId
      );
      setFilteredAnnotations(filtered);
    } else if (selectedImageBoxId) {
      // Fall back to selection filter
      const filtered = annotations.filter(
        (annotation) => annotation.imageBoxId === selectedImageBoxId
      );
      setFilteredAnnotations(filtered);
    } else {
      // No filters active
      setFilteredAnnotations(annotations);
    }
  }, [selectedImageBoxId, annotations, temporaryFilterBoxId]);

  const updateConnectionLine = useCallback((boxId: string | null) => {
    // Remove existing line
    if (connectionLine.current) {
      scene.current?.remove(connectionLine.current);
      connectionLine.current = null;
    }

    if (!boxId || !scene.current || !cameraRef.current) return;

    // Get the box from the map
    const imageBox = imageBoxMap.current.get(boxId);
    if (!imageBox) return;

    // Get box center in world coordinates
    const boxWorldPos = imageBox.position.clone();

    // Get the list item position
    const listItem = document.querySelector(`[data-box-id="${boxId}"]`);
    if (!listItem) return;

    const rect = listItem.getBoundingClientRect();
    const listItemCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    // Convert screen coordinates to normalized device coordinates (NDC)
    const ndcX = (listItemCenter.x / window.innerWidth) * 2 - 1;
    const ndcY = -(listItemCenter.y / window.innerHeight) * 2 + 1;

    // Convert NDC to world coordinates
    const listItemWorldPos = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(
      cameraRef.current
    );

    // Create line geometry
    const points = [boxWorldPos, listItemWorldPos];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.8,
      linewidth: 5, // Make the line thicker
      depthTest: false,
    });

    connectionLine.current = new THREE.Line(geometry, material);
    scene.current.add(connectionLine.current);
  }, []);

  const updateAnnotationConnectionLines = useCallback(
    (boxId: string | null) => {
      // Remove existing annotation lines
      annotationConnectionLines.current.forEach((line) => {
        scene.current?.remove(line);
      });
      annotationConnectionLines.current = [];

      if (!boxId || !scene.current || !cameraRef.current) return;

      // Get the box from the map
      const imageBox = imageBoxMap.current.get(boxId);
      if (!imageBox) return;

      // Get box center in world coordinates
      const boxWorldPos = imageBox.position.clone();

      // Get the annotations for the selected box
      const boxAnnotations = annotations.filter(
        (annotation) => annotation.imageBoxId === boxId
      );

      boxAnnotations.forEach((annotation) => {
        // Draw line to annotation
        const annotationItem = document.querySelector(
          `[data-annotation-id="${annotation.id}"]`
        );
        if (annotationItem) {
          const rect = annotationItem.getBoundingClientRect();
          const annotationItemCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };

          if (!scene.current || !cameraRef.current) return;
          // Convert to NDC and world coordinates
          const ndcX = (annotationItemCenter.x / window.innerWidth) * 2 - 1;
          const ndcY = -(annotationItemCenter.y / window.innerHeight) * 2 + 1;
          const annotationItemWorldPos = new THREE.Vector3(
            ndcX,
            ndcY,
            0.5
          ).unproject(cameraRef.current);

          // Create line to annotation
          const annotationLine = createConnectionLine(
            boxWorldPos,
            annotationItemWorldPos,
            0x00ffff // Cyan color for annotation connections
          );
          scene.current.add(annotationLine);
          annotationConnectionLines.current.push(annotationLine);

          // Draw lines to referenced boxes
          annotation.references?.forEach((refBoxId) => {
            const referencedBox = imageBoxMap.current.get(refBoxId);
            if (referencedBox) {
              const refBoxWorldPos = referencedBox.position.clone();
              const referenceLine = createConnectionLine(
                annotationItemWorldPos,
                refBoxWorldPos,
                0xff00ff // Magenta color for reference connections
              );
              scene.current?.add(referenceLine);
              annotationConnectionLines.current.push(referenceLine);
            }
          });
        }
      });
    },
    [annotations]
  );

  // Add this helper function near your other helper functions
  const createConnectionLine = (
    start: THREE.Vector3,
    end: THREE.Vector3,
    color: number
  ) => {
    const points = [start, end];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      linewidth: 2,
      depthTest: false,
    });
    return new THREE.Line(geometry, material);
  };

  // Add this effect to redraw connection lines when filtered annotations change
  useEffect(() => {
    // Wait for DOM to update with filtered annotations
    requestAnimationFrame(() => {
      if (hoveredImageBoxId) {
        updateAnnotationConnectionLines(hoveredImageBoxId);
      }
    });
  }, [filteredAnnotations, hoveredImageBoxId, updateAnnotationConnectionLines]);

  const handleMouseMove = useCallback(
    (
      event: MouseEvent,
      camera: THREE.Camera,
      scene: THREE.Scene,
      raycaster: THREE.Raycaster,
      mouse: THREE.Vector2
    ) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Get only the mesh planes we care about
      const meshesToTest: THREE.Mesh[] = [];
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh &&
          object.parent?.userData?.type === "imageBox"
        ) {
          meshesToTest.push(object);
        }
      });

      console.log(`Testing ${meshesToTest.length} potential hit targets`);

      // Only test intersections with our specific meshes
      const intersects = raycaster
        .intersectObjects(meshesToTest, false)
        .sort((a, b) => a.distance - b.distance);

      // Debug intersections
      if (intersects.length > 0) {
        console.log(
          "Filtered intersections:",
          intersects.map((int) => ({
            distance: int.distance,
            point: int.point,
            objectType: int.object.type,
            parentType: int.object.parent?.userData?.type,
          }))
        );
      }

      // Reset all boxes to current outline settings
      scene.traverse((child) => {
        if (child.userData?.type === "imageBox") {
          const planeMaterial = child.userData.planeMaterial;
          const lineMaterial = child.userData.lineMaterial;
          if (planeMaterial) planeMaterial.opacity = 0.1;
          if (lineMaterial && !child.userData.isHovered) {
            // Only reset if not hovered
            lineMaterial.color.set(imageBoxRenderSettings.color);
            lineMaterial.opacity = imageBoxRenderSettings.opacity;
          }
        }
      });

      // Handle hover state
      if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        const imageBoxGroup = hitObject.parent;

        if (imageBoxGroup?.userData?.type === "imageBox") {
          imageBoxGroup.userData.isHovered = true; // Mark as hovered
          setHoveredImageBoxId(imageBoxGroup.userData.id);
          handleBoxClick(imageBoxGroup.userData.id);
          const planeMaterial = imageBoxGroup.userData.planeMaterial;
          const lineMaterial = imageBoxGroup.userData.lineMaterial;
          if (planeMaterial) planeMaterial.opacity = 0.3;
          if (lineMaterial) {
            lineMaterial.color.setStyle(imageBoxRenderSettings.color);
            lineMaterial.opacity = imageBoxRenderSettings.opacity;
          }
          updateConnectionLine(imageBoxGroup.userData.id);
          updateAnnotationConnectionLines(imageBoxGroup.userData.id);
        }
      } else {
        // Clear hover states
        scene.traverse((child) => {
          if (child.userData?.type === "imageBox") {
            child.userData.isHovered = false;
          }
        });
        setHoveredImageBoxId(null);
        updateConnectionLine(null);
        updateAnnotationConnectionLines(null);
      }
    },
    [
      updateConnectionLine,
      updateAnnotationConnectionLines,
      imageBoxRenderSettings.color,
      imageBoxRenderSettings.opacity,
    ]
  );

  const handleBoxHover = useCallback(
    (boxId: string) => {
      console.log("handling box hover", boxId);
      setHoveredImageBoxId(boxId);
      updateConnectionLine(boxId);
      setTemporaryFilterBoxId(boxId);
      // Remove immediate connection line update - will be handled by the effect
    },
    [updateConnectionLine]
  );

  const handleBoxUnhover = useCallback(() => {
    console.log("handling unhover");
    setHoveredImageBoxId(null);
    handleBoxClick(null);
    updateConnectionLine(null);
    updateAnnotationConnectionLines(null);
    setTemporaryFilterBoxId(null);

    scene.current?.traverse((child) => {
      if (child.userData?.type === "imageBox") {
        const planeMaterial = child.userData.planeMaterial;
        const lineMaterial = child.userData.lineMaterial;
        if (planeMaterial) planeMaterial.opacity = 0.1;
        if (lineMaterial) {
          const color = new THREE.Color(imageBoxRenderSettings.color);
          lineMaterial.color.copy(color);
          lineMaterial.opacity = imageBoxRenderSettings.opacity;
        }
      }
    });
  }, [
    updateConnectionLine,
    updateAnnotationConnectionLines,
    annotations,
    imageBoxRenderSettings,
  ]);

  const handleBoxClick = useCallback((boxId: string | null) => {
    console.log("handled box click", boxId);
    setSelectedImageBoxId(boxId);
  }, []);

  const handleSearchFocus = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = false;
    }
    if (flyControlsRef.current) {
      flyControlsRef.current.enabled = false;
    }
  };

  const handleSearchBlur = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
    }
    if (flyControlsRef.current) {
      flyControlsRef.current.enabled = true;
    }
  };

  const handleAnnotationClick = (annotationId: string) => {
    console.log("Annotation clicked:", annotationId);
    // Handle annotation click logic here
  };

  const updateAllBoxOutlines = useCallback((color: string, opacity: number) => {
    scene.current?.traverse((child) => {
      if (child.userData?.type === "imageBox") {
        const lineMaterial = child.userData.lineMaterial;
        if (lineMaterial) {
          lineMaterial.color.setStyle(color);
          lineMaterial.opacity = opacity;
        }
      }
    });
  }, []);

  const handleOutlineColorChange = useCallback(
    (color: string) => {
      setImageBoxRenderSettings((prev) => ({
        ...prev,
        color,
      }));
      updateAllBoxOutlines(color, imageBoxRenderSettings.opacity);
    },
    [imageBoxRenderSettings.color, updateAllBoxOutlines]
  );

  const handleOutlineOpacityChange = useCallback(
    (opacity: number) => {
      console.log("set to ", opacity);
      setImageBoxRenderSettings((prev) => ({
        ...prev,
        opacity,
      }));
      updateAllBoxOutlines(imageBoxRenderSettings.color, opacity);
    },
    [imageBoxRenderSettings.color, updateAllBoxOutlines]
  );

  const imageBoxList = useMemo(() => {
    console.log("changed to ", hoveredImageBoxId);
    return (
      <ImageBoxList
        imageBoxes={allImageBoxes}
        hoveredBoxId={hoveredImageBoxId}
        selectedBoxId={selectedImageBoxId}
        onBoxHover={handleBoxHover}
        onBoxUnhover={handleBoxUnhover}
        onBoxClick={handleBoxClick}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
        onEditImageBox={handleEditImageBox} // Pass the edit handler
      />
    );
  }, [
    hoveredImageBoxId,
    selectedImageBoxId,
    allImageBoxes,
    handleBoxHover,
    handleBoxUnhover,
    handleBoxClick,
    handleSearchFocus,
    handleSearchBlur,
    handleEditImageBox, // Add this dependency
  ]);

  // Add effect to handle scene graph changes
  useEffect(() => {
    // Clear existing scene
    if (scene.current && rendererRef.current) {
      // Remove all children from scene
      while (scene.current.children.length > 0) {
        scene.current.remove(scene.current.children[0]);
      }

      setCurrentSceneGraph(initialSceneGraph);
      // Reset local state
      setAllImageBoxes([]);
      setHoveredImageBoxId(null);
      setSelectedImageBoxId(null);
      setFilteredAnnotations([]);
      imageBoxMap.current.clear();
      imagesData.current = [];

      // Load new scene graph
      loadImagesFromSceneGraph(
        scene.current,
        initialSceneGraph,
        rendererRef.current,
        addRandomImageBoxes
      ).then((images) => {
        imagesData.current = images;
        const imageBoxes = loadImageBoxesFromSceneGraph(
          images,
          initialSceneGraph
        );

        // Apply initial render settings to all boxes
        scene.current?.traverse((child) => {
          if (child.userData?.type === "imageBox") {
            const lineMaterial = child.userData.lineMaterial;
            if (lineMaterial) {
              const color = new THREE.Color(imageBoxRenderSettings.color);
              lineMaterial.color.copy(color);
              lineMaterial.opacity = imageBoxRenderSettings.opacity;
            }
          }
        });

        // Populate the imageBoxMap
        imageBoxes.forEach((box) => {
          const imageBox = images
            .flatMap((img) => img.boxes)
            .find((b) => b.id === box.id);
          if (imageBox) {
            imageBoxMap.current.set(box.id, imageBox);
          }
        });

        setAllImageBoxes(imageBoxes);
        handleLayoutChange(currentLayout);

        // Render links between image boxes if enabled
        if (linksEnabled && scene.current) {
          renderLinksBetweenImageBoxes(
            scene.current,
            images,
            links.current,
            initialSceneGraph
          );
        }
      });
    }
  }, [initialSceneGraph, handleLayoutChange, currentLayout, linksEnabled]); // Add initialSceneGraph to dependencies

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} className="w-full h-screen" />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
        }}
      >
        {imageBoxList}
      </div>
      <LayoutSwitcher
        currentLayout={currentLayout}
        onLayoutChange={handleLayoutChange}
        style={{ top: "80px" }}
      />
      <button
        onClick={toggleLinks}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Toggle Link Visibility
      </button>
      <button
        onClick={() => setShowOptions(!showOptions)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "120px",
          zIndex: 1000,
          padding: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        {showOptions ? "Hide Options" : "Show Options"}
      </button>
      {showOptions && (
        <ImageOptionsPanel
          outlineColor={imageBoxRenderSettings.color}
          outlineOpacity={imageBoxRenderSettings.opacity}
          onOutlineColorChange={handleOutlineColorChange}
          onOutlineOpacityChange={handleOutlineOpacityChange}
        />
      )}
      <AnnotationsList
        annotations={filteredAnnotations}
        onAnnotationClick={handleAnnotationClick}
      />
      {isWizardOpen && (
        <ImageBoxWizard
          imageBoxData={editingImageBox}
          existingAnnotations={annotations.filter(
            (a) => a.imageBoxId === editingImageBox?.id
          )}
          onSubmit={handleWizardSubmit}
          onCancel={handleWizardCancel}
        />
      )}
    </div>
  );
};

export default ImageGalleryV3;
