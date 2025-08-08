import React, { useMemo } from "react";
import { RenderingManager } from "../../controllers/RenderingManager";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import { DisplayConfigManager } from "../../store/TagManager";
import { setNodeKeyData } from "../../store/activeLegendConfigStore";
import { getLegendMode } from "../../store/appConfigStore";
import MultiSelectDropdown from "./MultiSelectDropdown";

interface EntityTagsSelectorDropdownProps {
  sceneGraph: SceneGraph;
  nodeId: string | null;
  values: { value: string; label: string; color: string }[];
  setValues: (tags: { value: string; label: string; color: string }[]) => void;
  isDarkMode: boolean;
}

const EntityTagsSelectorDropdown: React.FC<EntityTagsSelectorDropdownProps> = ({
  sceneGraph,
  nodeId,
  values,
  setValues,
  isDarkMode,
}) => {
  const availableTags = useMemo(
    () =>
      Array.from(
        sceneGraph.getGraph().getNodes().getTags() as Iterable<string>
      ).map((tag: string) => ({
        value: tag,
        label: tag,
        color: RenderingManager.getColorByKeySimple(
          tag,
          sceneGraph.getDisplayConfig().nodeConfig.tags
        ),
      })),
    [sceneGraph]
  );

  return (
    <MultiSelectDropdown
      options={availableTags}
      values={values}
      onChange={setValues}
      placeholder="Select or add tags..."
      isDarkMode={isDarkMode}
      allowNewItems={true}
      showColorPicker={true}
      onAddNewItem={(_newTag) => {
        DisplayConfigManager.addKeyToDisplayConfig(
          _newTag.label,
          { color: _newTag.color, isVisible: true },
          "tag",
          "Node",
          sceneGraph
        );
        if (nodeId) {
          console.log("tags", sceneGraph.getNodeById(nodeId as NodeId));
          console.log(
            "scenegraph nodes are ",
            sceneGraph.getGraph().getNodes()
          );
          sceneGraph.getNodeById(nodeId as NodeId)?.addTag(_newTag.label);
        }
        if (getLegendMode() === "tag") {
          setNodeKeyData(_newTag.label as NodeId, {
            color: _newTag.color,
            isVisible: true,
          });
        }
        sceneGraph.notifyGraphChanged();
      }}
    />
  );
};

export default EntityTagsSelectorDropdown;
