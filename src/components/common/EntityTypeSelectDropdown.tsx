import React, { useMemo } from "react";
import { RenderingManager } from "../../controllers/RenderingManager";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import { DisplayConfigManager } from "../../store/TagManager";
import { setNodeKeyData } from "../../store/activeLegendConfigStore";
import { getLegendMode } from "../../store/appConfigStore";
import { getRandomColorFromPalette } from "../../utils/colorUtils";
import SelectDropdown from "./SelectDropdown";

interface EntityTypeSelectDropdownProps {
  sceneGraph: SceneGraph;
  nodeId: NodeId | null;
  value: string;
  setValue: (type: string) => void;
  isDarkMode?: boolean;
}

const EntityTypeSelectDropdown: React.FC<EntityTypeSelectDropdownProps> = ({
  sceneGraph,
  nodeId,
  value,
  setValue,
  isDarkMode = false,
}) => {
  const availableTypes = useMemo(
    () =>
      Array.from(
        new Set(
          sceneGraph
            .getGraph()
            .getNodes()
            .map((n) => n.getType())
        )
      ).map((type) => ({
        value: type,
        label: type,
        color: RenderingManager.getColorByKeySimple(
          type,
          sceneGraph.getDisplayConfig().nodeConfig.types
        ),
      })),
    [sceneGraph]
  );

  return (
    <SelectDropdown
      options={availableTypes}
      allowNewItems={true}
      showColorPicker={true}
      value={{
        value,
        label: value,
        color: RenderingManager.getColorByKeySimple(
          value,
          sceneGraph.getDisplayConfig().nodeConfig.types
        ),
      }}
      onChange={(option) => setValue(option?.value || "")}
      placeholder="Search types..."
      isDarkMode={isDarkMode}
      onAddNewItem={(_newType) => {
        const randomColor = getRandomColorFromPalette();
        DisplayConfigManager.addKeyToDisplayConfig(
          _newType.label,
          {
            color: _newType.color ?? randomColor,
            isVisible: true,
          },
          "type",
          "Node",
          sceneGraph
        );
        if (getLegendMode() === "type") {
          setNodeKeyData(_newType.label as NodeId, {
            color: _newType.color ?? randomColor,
            isVisible: true,
          });
        }
        if (nodeId) {
          sceneGraph.getNodeById(nodeId)?.setType(_newType.label);
        }
        setValue(_newType.label);
        sceneGraph.notifyGraphChanged();
      }}
    />
  );
};

export default EntityTypeSelectDropdown;
