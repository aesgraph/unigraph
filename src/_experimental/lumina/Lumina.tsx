/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable unused-imports/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox";
import { ObjectOf } from "../../App";
import { WINDOW_ASPECT_RATIO } from "../../core/geometry/convertCoordinates";
import { SceneGraph } from "../../core/model/SceneGraph";
import { fromSelectionArea, ImageBoxData } from "../../core/types/ImageBoxData";
import {
  createSelectionArea,
  extractSelectionBoxGroups,
  GetTopLeft,
  SelectionBoxGroup,
} from "../../core/webgl/selectionArea";
import {
  convertScreenToWorldCoordinates,
  extractIntersection,
  extractIntersections,
  getCenter,
  getIntersections,
  getScreenCoordinates,
  getTopLeftBottomRightPoints,
  loadImage,
} from "../../core/webgl/webglHelpers";
import {
  demo_SceneGraph_ArtCollection,
  onSubmitImage,
} from "../../data/graphs/Gallery_Demos/demo_SceneGraph_ArtCollection";
import { CoordinatesDisplay } from "../exampleCode/CoordinatesDisplay";
import ImageBoxCard from "./ImageBoxCard";
import ImageBoxWizard from "./ImageBoxWizard"; // Import the ImageBoxWizard component
import { images } from "./images";
import "./Lumina.css"; // Import the CSS file
import Magnifier from "./Magnifier"; // Import the Magnifier component

export type LuminaScene = {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  raycaster: THREE.Raycaster;
};

const default_image = "./assets/image0.png";

export const initializeLuminaScene = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0); // Light grey background

  const camera = new THREE.OrthographicCamera(
    -WINDOW_ASPECT_RATIO() * 1.2,
    WINDOW_ASPECT_RATIO() * 1.2,
    1.2,
    -1.2,
    0.1,
    50
  );
  camera.position.z = 50;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = true;
  controls.enableZoom = true;
  controls.enableRotate = false;
  controls.mouseButtons = {
    // LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN,
  };

  const raycaster = new THREE.Raycaster();

  loadImage(default_image, images[default_image], scene, renderer);

  return {
    scene,
    camera,
    renderer,
    controls,
    raycaster,
  };
};

type LuminaProps = {
  sceneGraph: SceneGraph;
};

const Lumina: React.FC<LuminaProps> = ({ sceneGraph }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageName, setImageName] = useState<string>(default_image);
  const [idsToImageBoxes, setIdsToImageBoxes] = useState<
    ObjectOf<ImageBoxData>
  >({});
  let isResizingNode: boolean = false;
  let isMovingNode: boolean = false;
  let selectedNode: SelectionBoxGroup | null = null;
  let moveStartPoint: THREE.Vector3 | null;
  const [hoveredSelectionBox, setHoveredSelectionBox] =
    useState<SelectionBoxGroup | null>(null);
  const [hoveredImageBoxId, setHoveredImageBoxId] = useState<string | null>(
    null
  );
  const [isWizardOpen, setIsWizardOpen] = useState(false); // State to control the wizard visibility
  const [wizardImageData, setWizardImageData] = useState<ImageBoxData | null>(
    null
  );
  const [luminaScene, setLuminaScene] = useState<LuminaScene | null>(
    initializeLuminaScene()
  );

  const getSelectionAreas = (): SelectionBoxGroup[] => {
    if (!luminaScene) {
      return [];
    }
    return luminaScene.scene.children.filter(
      (child) =>
        (child as SelectionBoxGroup).userData.id === "SelectionBoxGroup"
    ) as SelectionBoxGroup[];
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedImage = event.target.value;
    setImageName(selectedImage);
    // if (luminaScene) {
    //   loadImage(
    //     selectedImage,
    //     images[selectedImage],
    //     luminaScene.scene,
    //     luminaScene.renderer
    //   );
    // }
  };

  const highlightSelectionArea = (id: string) => {
    const selectionAreas = getSelectionAreas();
    const area = selectionAreas.find((area) => area.userData.uuid === id);
    if (area) {
      area.userData.box.userData.onHover();
      // area.userData.box.userData.onUnhover = () => {};
      // setHoveredSelectionBox(area);
    }
  };

  const unhighlightSelectionAreas = () => {
    getSelectionAreas().forEach((area) =>
      area.userData.box.userData.onUnhover()
    );
  };

  useEffect(() => {
    if (hoveredImageBoxId) {
      highlightSelectionArea(hoveredImageBoxId);
    } else {
      unhighlightSelectionAreas();
    }
  }, [hoveredImageBoxId]);

  const handleExportSelectionAreas = React.useCallback(() => {
    const areas = getSelectionAreas().map((area) => {
      return idsToImageBoxes[area.userData.uuid];
    });

    const json = JSON.stringify(areas, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selectionAreas.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [idsToImageBoxes, imageName]);

  const handleImportSelectionAreas = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !luminaScene) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const imageBoxDatas: ImageBoxData[] = JSON.parse(text);
      loadImageBoxesIntoScene(imageBoxDatas, luminaScene.camera);
    };
    reader.readAsText(file);
  };

  const loadImageBoxesIntoScene = React.useCallback(
    (imageBoxes: ImageBoxData[], camera: THREE.OrthographicCamera) => {
      if (!luminaScene) return;
      imageBoxes.forEach((imageBox) => {
        const selectionArea = createSelectionArea(
          new THREE.Vector3(imageBox.topLeft.x, imageBox.topLeft.y, 0.1),
          new THREE.Vector3(
            imageBox.bottomRight.x,
            imageBox.bottomRight.y,
            0.1
          ),
          camera,
          luminaScene.scene,
          imageBox.id
        );

        // Ensure the plane is always perpendicular to the camera
        selectionArea.lookAt(camera.position);

        luminaScene.scene.add(selectionArea);
        setIdsToImageBoxes((prev) => ({
          ...prev,
          [imageBox.id]: imageBox,
        }));
        onSubmitImage(sceneGraph, imageBox);
      });
    },
    [luminaScene]
  );

  const handleImportButtonClick = () => {
    document.getElementById("import-file-input")?.click();
  };

  useEffect(() => {
    if (!luminaScene) {
      throw new Error("Lumina scene not initialized");
    }

    const init = () => {
      containerRef.current!.appendChild(luminaScene.renderer.domElement);

      // loadImage(
      //   imageName,
      //   images[imageName],
      //   luminaScene.scene,
      //   luminaScene.renderer
      // );

      const imageBoxes = demo_SceneGraph_ArtCollection()
        .getGraph()
        .getNodes()
        .filter((node) => node.getType() === "ImageBox")
        .map((node) => node.getUserData("imageBoxData") as ImageBoxData);
      loadImageBoxesIntoScene(imageBoxes, luminaScene.camera);

      const animate = () => {
        requestAnimationFrame(animate);
        luminaScene.controls.update();
        luminaScene.renderer.render(luminaScene.scene, luminaScene.camera);
      };

      animate();
    };

    init();

    const selectionBox = new SelectionBox(
      luminaScene.camera,
      luminaScene.scene
    );

    const pointerDownHandler = (event: PointerEvent) => {
      if (event.button !== 0) return; // Only proceed if left mouse button is pressed

      const startPoint = convertScreenToWorldCoordinates(
        event.clientX,
        event.clientY,
        luminaScene.camera,
        window.innerWidth,
        window.innerHeight
      );
      selectionBox.startPoint.copy(startPoint);

      const intersections = getIntersections(
        luminaScene.camera,
        luminaScene.scene,
        event.clientX,
        event.clientY,
        window.innerWidth,
        window.innerHeight,
        luminaScene.raycaster
      );

      const resizeButton = extractIntersection<THREE.Intersection>(
        intersections,
        "resizeButton"
      );
      const selectionBoxMesh = extractIntersection<THREE.Intersection>(
        intersections,
        "selectionBox"
      );
      const deleteButtonMesh = extractIntersection<THREE.Intersection>(
        intersections,
        "deleteButton"
      );
      if (resizeButton) {
        onStartResizingSelectionArea(
          resizeButton.object.parent as SelectionBoxGroup
        );
      } else if (selectionBoxMesh) {
        onStartMovingSelectionArea(
          selectionBoxMesh.object.parent as SelectionBoxGroup,
          startPoint
        );
      } else if (deleteButtonMesh) {
        deleteButtonMesh.object.userData.onClick();
      }
    };

    const onStartMovingSelectionArea = (
      selectionArea: SelectionBoxGroup,
      startPoint: THREE.Vector3 | null = null
    ) => {
      if (isMovingNode) {
        return;
      }
      isMovingNode = true;
      selectedNode = selectionArea;
      moveStartPoint = startPoint;
    };

    const onStopMovingSelectionArea = () => {
      isMovingNode = false;
      selectedNode = null;
      moveStartPoint = null;
    };

    const onStartResizingSelectionArea = (selectionArea: SelectionBoxGroup) => {
      if (isResizingNode) {
        return;
      }
      if (!selectionArea.userData.box.position) {
        throw Error("Position required");
      }
      isResizingNode = true;
      selectedNode = selectionArea;
    };

    const moveSelectionArea = (event: MouseEvent) => {
      if (!selectedNode || !moveStartPoint) return;
      const mousePoint = convertScreenToWorldCoordinates(
        event.clientX,
        event.clientY,
        luminaScene.camera,
        window.innerWidth,
        window.innerHeight
      );
      const offset = new THREE.Vector3().copy(mousePoint).sub(moveStartPoint);
      // selectedNode.position.setX(selectedNode.position.x + offset.x);
      // selectedNode.position.setY(selectedNode.position.y + offset.y);
      selectedNode.translateX(offset.x);
      selectedNode.translateY(offset.y);
      moveStartPoint = mousePoint;
    };

    const resizeSelectionAreaDrawUpdate = (event: MouseEvent) => {
      if (!selectedNode) return;
      const startPoint = GetTopLeft(selectedNode);
      const endPoint = convertScreenToWorldCoordinates(
        event.clientX,
        event.clientY,
        luminaScene.camera,
        window.innerWidth,
        window.innerHeight
      );
      const { topLeft, bottomRight } = getTopLeftBottomRightPoints(
        startPoint,
        endPoint
      );
      const width = Math.abs(topLeft.x - bottomRight.x);
      const height = Math.abs(topLeft.y - bottomRight.y);
      if (width === 0 || height === 0) return;

      const anchor = selectedNode.userData.anchor;
      if (anchor) {
        anchor.position.set(topLeft.x, topLeft.y, 0);
      }

      const closeButton = selectedNode.userData.closeButton;
      if (closeButton) {
        closeButton.position.set(topLeft.x + width, topLeft.y, 0);
      }

      const newGeometry = new THREE.PlaneGeometry(width, height);
      selectedNode.userData.box.geometry.dispose();
      selectedNode.userData.box.geometry = newGeometry;
      const center = getCenter([topLeft, bottomRight]);

      selectedNode.userData.box.position.copy(center);

      // Update resize button position
      const resizeButton = selectedNode.userData.resizeButton;
      if (resizeButton) {
        resizeButton.position.set(bottomRight.x, bottomRight.y, 0);
      }
    };

    const onStopResizingSelectionArea = () => {
      isResizingNode = false;
      selectedNode = null;
    };

    const pointerMoveHandler = (event: PointerEvent) => {
      applyHoverHighlighting(event);
      if (event.button !== 0) {
        return;
      }
      const endPoint = convertScreenToWorldCoordinates(
        event.clientX,
        event.clientY,
        luminaScene.camera,
        window.innerWidth,
        window.innerHeight
      );
      selectionBox.endPoint.copy(endPoint);
      if (isResizingNode) {
        resizeSelectionAreaDrawUpdate(event);
      } else if (isMovingNode) {
        moveSelectionArea(event);
      }
    };

    const pointerUpHandler = (event: PointerEvent) => {
      console.log("lumina scene", luminaScene);
      if (event.button !== 0 || !luminaScene) return;
      if (isMovingNode) {
        onStopMovingSelectionArea();
      } else if (isResizingNode) {
        onStopResizingSelectionArea();
      } else {
        const endPoint = convertScreenToWorldCoordinates(
          event.clientX,
          event.clientY,
          luminaScene.camera,
          window.innerWidth,
          window.innerHeight
        );
        selectionBox.endPoint.copy(endPoint);
        const startPoint = selectionBox.startPoint;

        const screenCoordinates = getScreenCoordinates(
          startPoint,
          endPoint,
          luminaScene.camera,
          window.innerWidth,
          window.innerHeight
        );

        if (screenCoordinates.width < 80 && screenCoordinates.height < 80) {
          return;
        }

        if (endPoint.x === startPoint.x || endPoint.y === startPoint.y) return;
        const selectionArea = createSelectionArea(
          startPoint,
          endPoint,
          luminaScene?.camera,
          luminaScene.scene
        );
        luminaScene.scene.add(selectionArea);

        const newImageBox = fromSelectionArea(selectionArea, imageName, "");
        setIsWizardOpen(true);
        setWizardImageData(newImageBox);
      }
    };

    const addEventListeners = () => {
      document.addEventListener("pointerdown", pointerDownHandler);
      document.addEventListener("pointermove", pointerMoveHandler);
      document.addEventListener("pointerup", pointerUpHandler);
    };

    const removeEventListeners = () => {
      document.removeEventListener("pointerdown", pointerDownHandler);
      document.removeEventListener("pointermove", pointerMoveHandler);
      document.removeEventListener("pointerup", pointerUpHandler);
    };

    if (!isWizardOpen) {
      addEventListeners();
    } else {
      removeEventListeners();
    }

    return () => {
      removeEventListeners();
      if (containerRef.current) {
        containerRef.current.removeChild(luminaScene.renderer.domElement);
      }
    };
  }, [imageName, isWizardOpen]);

  const applyHoverHighlighting = (event: MouseEvent) => {
    if (!luminaScene) {
      return;
    }
    const intersects = getIntersections(
      luminaScene.camera,
      luminaScene.scene,
      event.clientX,
      event.clientY,
      window.innerWidth,
      window.innerHeight,
      luminaScene.raycaster
    );

    const hoveredBoxes = extractIntersections<THREE.Intersection>(
      intersects,
      "selectionBox"
    );

    getSelectionAreas().forEach((area) => {
      area.userData.box.userData.onUnhover();
    });

    if (hoveredBoxes.length > 0) {
      hoveredBoxes.forEach((box) => {
        box.object.userData.onHover();
      });
      setHoveredSelectionBox(extractSelectionBoxGroups(hoveredBoxes)[0]);
    } else {
      setHoveredSelectionBox(null);
    }
    if (hoveredImageBoxId) {
      highlightSelectionArea(hoveredImageBoxId);
    }
  };

  const handleImageBoxSubmit = (sceneGraph: SceneGraph, data: ImageBoxData) => {
    onSubmitImage(sceneGraph, data);
    setIdsToImageBoxes((prev) => ({
      ...prev,
      [data.id]: data,
    }));
    setIsWizardOpen(false);
  };

  const renderImageSelectionActions = React.useCallback(() => {
    return (
      <div className="button-container">
        <select onChange={handleImageSelect}>
          {Object.keys(images).map((imageName) => (
            <option key={imageName} value={imageName}>
              {imageName}
            </option>
          ))}
        </select>
        <button onClick={handleExportSelectionAreas}>
          Export Selection Areas
        </button>
        <button onClick={handleImportButtonClick}>
          Import Selection Areas
        </button>
        <input
          id="import-file-input"
          type="file"
          accept="application/json"
          onChange={handleImportSelectionAreas}
          style={{ display: "none" }}
        />
      </div>
    );
  }, [imageName, idsToImageBoxes, luminaScene]);

  const renderImageBoxCard = () => {
    if (!luminaScene || hoveredSelectionBox == null) {
      return;
    }
    const imageBox = idsToImageBoxes[hoveredSelectionBox?.userData.uuid];
    if (!imageBox) {
      return;
    }
    return (
      <div
        style={{
          position: "fixed",
          top: `40%`,
          left: `40px`,
        }}
      >
        <div>Nothing selected</div>;
        <ImageBoxCard
          data={imageBox!}
          onSubmit={(imageBoxData: ImageBoxData) =>
            handleImageBoxSubmit(sceneGraph, imageBoxData)
          }
          camera={luminaScene.camera!}
          canvasHeight={window.innerHeight}
          canvasWidth={window.innerWidth}
        />
      </div>
    );
  };

  const renderImageBoxList = () => {
    if (!luminaScene) {
      return;
    }
    return (
      <div
        style={{ position: "fixed", top: 180, left: 40, width: "400px" }}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "0px",
            zIndex: 1000,
          }}
        >
          {/* <button
            className="create-button"
            onClick={() => setIsWizardOpen(true)}
            style={{
              fontSize: "24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              cursor: "pointer",
            }}
          >
            <FaPlus size={24} />
          </button> */}
        </div>
        <div
          style={{
            backgroundColor: "white",
            padding: "12px",
            height: "50vh",
            width: "10rem",
            overflow: "hidden",
            overflowY: "auto",
            scrollbarColor: "#ccc #f9f9f9",
            scrollbarWidth: "thin",
            borderRadius: "16px",
            pointerEvents: "auto", // Ensure the list captures pointer events
          }}
          onPointerDown={(e) => e.stopPropagation()} // Prevent event propagation to the WebGL scene
        >
          {Object.values(idsToImageBoxes).length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#888",
                fontStyle: "italic",
                marginTop: "20px",
              }}
            >
              Image Boxes will be listed here
            </div>
          ) : (
            Object.values(idsToImageBoxes).map((box) => (
              <div
                key={box.id}
                className={`image-box-list-item ${
                  hoveredImageBoxId === box.id ? "hovered" : ""
                }`}
                style={{ marginBottom: "8px" }}
                onMouseEnter={() => {
                  setHoveredImageBoxId(box.id);
                }}
                onMouseLeave={() => setHoveredImageBoxId(null)}
              >
                <ImageBoxCard
                  data={box}
                  onSubmit={(imageBoxData: ImageBoxData) =>
                    handleImageBoxSubmit(sceneGraph, imageBoxData)
                  }
                  style={{
                    backgroundColor:
                      hoveredImageBoxId === box.id ? "#f0f0f0" : "white",
                  }}
                  canvasHeight={window.innerHeight}
                  canvasWidth={window.innerWidth}
                  camera={luminaScene.camera}
                />
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderMagnifier = React.useCallback(() => {
    if (!luminaScene) {
      console.log("nope");
      return null;
    }
    return (
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          zIndex: 1000,
        }}
      >
        <Magnifier
          scene={luminaScene.scene}
          camera={luminaScene.camera}
          renderer={luminaScene.renderer}
          zoom={1.2}
          size={50}
        />
      </div>
    );
  }, [luminaScene]);

  const render = () => {
    if (!luminaScene) {
      return;
    }

    return (
      <div ref={containerRef} style={{ width: "100vw", height: "100vh" }}>
        {renderImageSelectionActions()}
        <CoordinatesDisplay
          containerRef={containerRef}
          camera={luminaScene.camera}
        />
        {/* {renderImageBoxCard()} */}
        {renderImageBoxList()}
        {isWizardOpen && wizardImageData && (
          <div className="wizard-overlay">
            <ImageBoxWizard
              imageBoxData={wizardImageData}
              onSubmit={(imageBoxData: ImageBoxData) =>
                handleImageBoxSubmit(sceneGraph, imageBoxData)
              }
              onCancel={() => setIsWizardOpen(false)}
              // camera={luminaScene.camera}
              // rendererOverride={luminaScene.renderer}
            />
          </div>
        )}
        {renderMagnifier()}
        {/* Add the Magnifier component */}
        {/* {Object.values(idsToImageBoxes).map((box) => {
        const selectionArea = getSelectionAreas().filter(
          (area) => area.userData.uuid === box.id
        )[0];
        if (!selectionArea) {
          return null;
        }

        const screenCoordinates = GetScreenCoordinates(
          selectionArea,
          cameraRef!,
          window.innerWidth,
          window.innerHeight
        );
        return (
          <div
            style={{
              position: "fixed",
              top: `${screenCoordinates.topLeftScreen.y}px`,
              left: `${screenCoordinates.topLeftScreen.x}px`,
              width: `${screenCoordinates.width}px`,
              height: `${screenCoordinates.height}px`,
              overflow: "hidden",
              overflowY: "auto",
              scrollbarColor: "#ccc #f9f9f9",
              scrollbarWidth: "thin",
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <ImageBox data={box} onSubmit={handleImageBoxSubmit} />
          </div>
        );
      })} */}
      </div>
    );
  };

  return render();
};

export default Lumina;
