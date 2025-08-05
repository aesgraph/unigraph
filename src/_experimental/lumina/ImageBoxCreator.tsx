import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import React, { useCallback, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ObjectOf } from "../../App";
import { SceneGraph } from "../../core/model/SceneGraph";
import { ImageBoxData } from "../../core/types/ImageBoxData";
import { reconstructImageSource } from "../../core/utils/imageProcessing";
import { onSubmitImage } from "../../data/graphs/Gallery_Demos/demo_SceneGraph_ArtCollection"; // Add this import at the top
import CanvasSelection from "./CanvasSelection";
import ImageBoxList from "./ImageBoxList";
import SegmentationPanel from "./SegmentationPanel";
import SelectionWizard from "./SelectionWizard";
import {
  createImageBoxesFromSegments,
  findColorIslands,
} from "./imageSegmentation";
import { demo_SceneGraph_ArtCollection_Images } from "./images"; // Add this import at the top

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;
const MIN_SELECTION_SIZE = 1; // Minimum size in pixels for selections

interface Point {
  x: number;
  y: number;
}

interface Color {
  r: number;
  g: number;
  b: number;
}

interface _ConnectedComponent {
  points: Point[];
  color: Color;
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

interface ImageBoxCreatorProps {
  sceneGraph: SceneGraph;
}

const ImageBoxCreator: React.FC<ImageBoxCreatorProps> = ({ sceneGraph }) => {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | undefined>(
    undefined
  );
  const [sourceImageUrl, setSourceImageUrl] = useState<string>("");
  const [showWizard, setShowWizard] = useState(false);
  const [selectionImage, setSelectionImage] = useState<ImageData | null>(null);
  const [selectedArea, setSelectedArea] = useState<{
    topLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  } | null>(null);

  const [idsToImageBoxes, setIdsToImageBoxes] = useState<
    ObjectOf<ImageBoxData>
  >({});
  const [hoveredImageBoxId, setHoveredImageBoxId] = useState<string | null>(
    null
  );
  const [minSegmentSize, setMinSegmentSize] = useState(10);
  const [colorSensitivity, setColorSensitivity] = useState(10); // Add new state
  const highlightHandlerRef = useRef<
    | ((
        areas: { x: number; y: number; width: number; height: number }[] | null
      ) => void)
    | null
  >(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageBoxToDelete, setImageBoxToDelete] = useState<ImageBoxData | null>(
    null
  );
  const [editingImageBox, setEditingImageBox] = useState<
    ImageBoxData | undefined
  >(undefined);

  const handleSegmentByIslands = () => {
    if (!sourceImage) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to source image size
    canvas.width = sourceImage.width;
    canvas.height = sourceImage.height;

    // Draw the image
    ctx.drawImage(sourceImage, 0, 0);

    // Find color islands
    const components = findColorIslands(
      ctx,
      canvas.width,
      canvas.height,
      minSegmentSize,
      colorSensitivity // Pass the color sensitivity parameter
    );

    // Create image boxes from components
    const boxes = createImageBoxesFromSegments(
      components,
      canvas.width,
      canvas.height,
      sourceImage,
      sourceImageUrl // Pass the URL to the segmentation function
    );

    // Add boxes to state
    boxes.forEach((box) => {
      setIdsToImageBoxes((prev) => ({
        ...prev,
        [box.id]: box,
      }));
    });
  };

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;
        img.onload = () => {
          setSourceImage(img);
          setSourceImageUrl(url); // Store the original file URL
        };
      }
    },
    []
  );

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedImage = e.target.value;
      if (selectedImage) {
        const img = new Image();
        img.src = demo_SceneGraph_ArtCollection_Images[selectedImage];
        img.onload = () => {
          setSourceImage(img);
          setSourceImageUrl(selectedImage); // Store the original image URL
        };
      }
    },
    []
  );

  const handleCaptureSelection = (
    imageData: ImageData,
    selectionArea: { x: number; y: number; width: number; height: number }
  ) => {
    // Add size validation
    if (
      selectionArea.width < MIN_SELECTION_SIZE ||
      selectionArea.height < MIN_SELECTION_SIZE
    ) {
      console.warn(
        "Selection area too small, minimum size is ${MIN_SELECTION_SIZE}px"
      );
      return;
    }

    const topLeft = {
      x: selectionArea.x,
      y: selectionArea.y,
    };
    const bottomRight = {
      x: selectionArea.x + selectionArea.width,
      y: selectionArea.y + selectionArea.height,
    };

    setSelectedArea({ topLeft, bottomRight });
    setSelectionImage(imageData);
    setShowWizard(true);
  };

  const handleWizardSubmit = useCallback(
    (data: { name: string; description: string; imageData: ImageData }) => {
      if (editingImageBox) {
        // Update existing image box
        const updatedImageBox = {
          ...editingImageBox,
          label: data.name,
          description: data.description,
          imageSource: data.imageData,
        };
        setIdsToImageBoxes((prev) => ({
          ...prev,
          [editingImageBox.id]: updatedImageBox,
        }));
        setEditingImageBox(undefined);
      } else if (selectedArea) {
        // Create new image box
        const newImageBox: ImageBoxData = {
          id: uuidv4(),
          label: data.name,
          type: "ImageBox",
          description: data.description,
          imageUrl: sourceImageUrl,
          topLeft: selectedArea.topLeft,
          bottomRight: selectedArea.bottomRight,
          imageSource: data.imageData,
        };
        setIdsToImageBoxes((prev) => ({
          ...prev,
          [newImageBox.id]: newImageBox,
        }));
      }
      setShowWizard(false);
      setSelectionImage(null);
      setSelectedArea(null);
    },
    [editingImageBox, selectedArea, sourceImageUrl]
  );

  const handleBoxHover = useCallback(
    (box: ImageBoxData) => {
      console.log("hovered box is ", box);
      setHoveredImageBoxId(box.id);
      if (highlightHandlerRef.current) {
        highlightHandlerRef.current([
          {
            x: box.topLeft.x,
            y: box.topLeft.y,
            width: box.bottomRight.x - box.topLeft.x,
            height: box.bottomRight.y - box.topLeft.y,
          },
        ]);
      }
    },
    [] // No dependencies needed now
  );

  const handleBoxUnhover = useCallback(() => {
    setHoveredImageBoxId(null);
    if (highlightHandlerRef.current) {
      highlightHandlerRef.current(null);
    }
  }, []); // No dependencies needed now

  const handleHighlightAll = useCallback(() => {
    if (!highlightHandlerRef.current) return;

    // Create an array of all boxes
    const boxes = Object.values(idsToImageBoxes).map((box) => ({
      x: box.topLeft.x,
      y: box.topLeft.y,
      width: box.bottomRight.x - box.topLeft.x,
      height: box.bottomRight.y - box.topLeft.y,
    }));

    // Pass the array to the highlight handler
    highlightHandlerRef.current(boxes);
  }, [idsToImageBoxes]);

  const handleDeleteBox = (box: ImageBoxData) => {
    setImageBoxToDelete(box);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteBox = () => {
    if (imageBoxToDelete) {
      setIdsToImageBoxes((prev) => {
        const newBoxes = { ...prev };
        delete newBoxes[imageBoxToDelete.id];
        return newBoxes;
      });
      setDeleteDialogOpen(false);
      setImageBoxToDelete(null);
    }
  };

  const cancelDeleteBox = () => {
    setDeleteDialogOpen(false);
    setImageBoxToDelete(null);
  };

  const handleEditImageBox = useCallback(
    (imageBox: ImageBoxData) => {
      setEditingImageBox(imageBox);
      setShowWizard(true);

      reconstructImageSource(imageBox.imageUrl, imageBox, sourceImage).then(
        (imageData) => {
          setSelectionImage(imageData);
        }
      );
    },
    [sourceImage]
  );

  const handleExportImageBoxes = useCallback(() => {
    const boxes = Object.values(idsToImageBoxes).map(
      // eslint-disable-next-line unused-imports/no-unused-vars
      ({ imageSource, ...rest }) => ({
        ...rest,
        imageUrl: sourceImageUrl, // Use the stored original image URL
      })
    );
    const json = JSON.stringify(boxes, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "imageBoxes.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [idsToImageBoxes, sourceImageUrl]);

  const handleImportImageBoxes = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        try {
          const imageBoxes: ImageBoxData[] = JSON.parse(text);
          console.log("Loaded ", imageBoxes);

          // Process each box sequentially
          for (const box of imageBoxes) {
            try {
              // Add the box without reconstructing the image source
              setIdsToImageBoxes((prev) => ({
                ...prev,
                [box.id]: box,
              }));
            } catch (error) {
              console.error(`Failed to add box ${box.id}:`, error);
            }
          }
        } catch (error) {
          console.error("Error importing image boxes:", error);
        }
      };
      reader.readAsText(file);
    },
    []
  );

  const handleSaveToImageGraph = useCallback(() => {
    Object.values(idsToImageBoxes).forEach((box) => {
      onSubmitImage(sceneGraph, box);
    });
  }, [sceneGraph, idsToImageBoxes]);

  const renderImportExportButtons = () => (
    <div
      style={{
        display: "flex",
        gap: "8px",
        marginBottom: "16px",
        width: "100%",
      }}
    >
      <input
        type="file"
        id="import-boxes-input"
        accept="application/json"
        onChange={handleImportImageBoxes}
        style={{ display: "none" }}
      />
      <Button
        variant="contained"
        onClick={() => document.getElementById("import-boxes-input")?.click()}
        fullWidth
        size="small"
      >
        Import Boxes
      </Button>
      <Button
        variant="contained"
        onClick={handleExportImageBoxes}
        disabled={Object.keys(idsToImageBoxes).length === 0}
        fullWidth
        size="small"
      >
        Export Boxes
      </Button>
      <Button
        variant="contained"
        onClick={handleSaveToImageGraph}
        disabled={Object.keys(idsToImageBoxes).length === 0}
        fullWidth
        size="small"
        color="secondary"
      >
        Save to Image Graph
      </Button>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-gray-100">
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: `${DEFAULT_WIDTH}px`,
          height: `${DEFAULT_HEIGHT}px`,
          backgroundColor: "white",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex gap-2">
          <input
            type="file"
            id="load-image-input"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <select
            onChange={handleImageSelect}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue=""
          >
            <option value="" disabled>
              Select an image...
            </option>
            {Object.keys(demo_SceneGraph_ArtCollection_Images).map(
              (imageName) => (
                <option key={imageName} value={imageName}>
                  {imageName}
                </option>
              )
            )}
          </select>
          <label
            htmlFor="load-image-input"
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition-colors"
          >
            Load Image
          </label>
        </div>
        <CanvasSelection
          sourceImage={sourceImage}
          width={DEFAULT_WIDTH}
          height={DEFAULT_HEIGHT}
          onCaptureSelection={handleCaptureSelection}
          onHighlightArea={(handler) => {
            highlightHandlerRef.current = handler;
          }}
        />
      </div>
      <ImageBoxList
        imageBoxes={Object.values(idsToImageBoxes)}
        hoveredBoxId={hoveredImageBoxId}
        onBoxHover={(boxId) => {
          const box = idsToImageBoxes[boxId];
          if (box) handleBoxHover(box);
        }}
        onBoxUnhover={handleBoxUnhover}
        onEditImageBox={handleEditImageBox}
        onDeleteImageBox={handleDeleteBox}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          right: "20px",
          zIndex: 1000,
          backgroundColor: "white",
          padding: "12px",
          height: "70vh",
          width: "22rem",
          overflow: "hidden",
          overflowY: "auto",
          scrollbarColor: "#ccc #f9f9f9",
          scrollbarWidth: "thin",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          pointerEvents: "auto",
        }}
      >
        {renderImportExportButtons()}
        <SegmentationPanel
          minSegmentSize={minSegmentSize}
          colorSensitivity={colorSensitivity}
          onMinSegmentSizeChange={setMinSegmentSize}
          onColorSensitivityChange={setColorSensitivity}
          onSegmentByIslands={handleSegmentByIslands}
          onHighlightAll={handleHighlightAll}
          sourceImage={sourceImage}
          hasImageBoxes={Object.keys(idsToImageBoxes).length > 0}
        />
      </div>
      {showWizard && selectionImage && (
        <SelectionWizard
          selectionImage={selectionImage}
          defaultData={editingImageBox} // Pass editingImageBox as defaultData
          onSubmit={handleWizardSubmit}
          onCancel={() => {
            setShowWizard(false);
            setEditingImageBox(undefined); // Clear editing state on cancel
          }}
        />
      )}
      <Dialog open={deleteDialogOpen} onClose={cancelDeleteBox}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this image box?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteBox} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteBox} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <div
        style={{
          position: "fixed", // Changed from absolute to fixed
          bottom: "20px",
          left: "20px",
          //   backgroundColor: "white", // Added background
          //   padding: "8px 12px", // Added padding
          borderRadius: "6px", // Added rounded corners
          //   boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Added shadow
          color: "#666", // Changed color
          fontSize: "14px",
          //   zIndex: 2000, // Increased z-index
          fontWeight: "500", // Made text slightly bolder
        }}
      >
        Total Image Boxes: {Object.values(idsToImageBoxes).length}
      </div>
    </div>
  );
};

export default ImageBoxCreator;
