import React from "react";

interface SegmentationPanelProps {
  minSegmentSize: number;
  colorSensitivity: number; // Add new prop
  onMinSegmentSizeChange: (value: number) => void;
  onColorSensitivityChange: (value: number) => void; // Add new handler
  onSegmentByIslands: () => void;
  onHighlightAll: () => void;
  sourceImage: HTMLImageElement | undefined;
  hasImageBoxes: boolean;
}

const SegmentationPanel: React.FC<SegmentationPanelProps> = ({
  minSegmentSize,
  colorSensitivity,
  onMinSegmentSizeChange,
  onColorSensitivityChange,
  onSegmentByIslands,
  onHighlightAll,
  sourceImage,
  hasImageBoxes,
}) => {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 w-64 bg-white p-4 shadow-lg rounded-l-lg">
      <h3 className="text-lg font-semibold mb-4">Image Analysis</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Segment Size
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="100"
              value={minSegmentSize}
              onChange={(e) => onMinSegmentSizeChange(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-gray-600 w-8">{minSegmentSize}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color Sensitivity
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="50"
              value={colorSensitivity}
              onChange={(e) => onColorSensitivityChange(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-gray-600 w-8">
              {colorSensitivity}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Lower values create more precise color regions
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onSegmentByIslands}
            disabled={!sourceImage}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Segment by Islands
          </button>
          <button
            onClick={onHighlightAll}
            disabled={!hasImageBoxes}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Highlight All Boxes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SegmentationPanel;
