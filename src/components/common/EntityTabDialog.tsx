import { Close } from "@mui/icons-material";
import { IconButton, Tab, Tabs } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import React, { useCallback, useMemo, useState } from "react";
import { Entity } from "../../core/model/entity/abstractEntity";
import { EntitiesContainer } from "../../core/model/entity/entitiesContainer";
import { EntityCache } from "../../core/model/entity/entityCache";
import { EdgesContainer, NodesContainer } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";
import EntityTable from "./EntityTable";

interface EntityTabDialogProps {
  nodes: NodesContainer;
  edges: EdgesContainer;
  entityCache: EntityCache;
  onClose: () => void;
  onNodeClick: (nodeId: string) => void;
  isDarkMode: boolean;
  sceneGraph: SceneGraph;
}

interface TabInfo {
  label: string;
  count: number;
  container: EntitiesContainer<any, any>;
}

const EntityTabDialog: React.FC<EntityTabDialogProps> = ({
  nodes,
  edges,
  entityCache,
  onClose,
  onNodeClick,
  isDarkMode,
  sceneGraph,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = useMemo((): TabInfo[] => {
    const result: TabInfo[] = [
      { label: "Nodes", count: nodes.size(), container: nodes },
      { label: "Edges", count: edges.size(), container: edges },
    ];

    // Add tabs for each entity type in the cache
    const entityTypes = entityCache.getTypes();
    entityTypes.forEach((type) => {
      const entities = entityCache.getEntitiesOfType(type);
      if (Object.keys(entities).length > 0) {
        result.push({
          label: type,
          count: entities.size(),
          container: entities,
        });
      }
    });

    return result;
  }, [nodes, edges, entityCache]);

  // Memoize the node click handler to prevent recreation on every render
  const handleNodeClick = useCallback(
    (node: Entity) => {
      onNodeClick(node.getId());
    },
    [onNodeClick]
  );

  // Render only the active tab to prevent mounting hidden tables
  const activeTabContent = useMemo(() => {
    if (!tabs[activeTab]) return null;

    const tab = tabs[activeTab];
    return (
      <EntityTable
        container={tab.container}
        sceneGraph={sceneGraph}
        onEntityClick={tab.label === "Nodes" ? handleNodeClick : undefined}
        maxHeight="70vh"
      />
    );
  }, [activeTab, tabs, sceneGraph, handleNodeClick]);

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: isDarkMode ? "#333" : "#fff",
          color: isDarkMode ? "#fff" : "#000",
        },
      }}
      TransitionProps={{
        // Disable dialog animation for instant open/close
        timeout: 0,
      }}
    >
      <DialogTitle>
        Entity Explorer
        <IconButton
          onClick={onClose}
          style={{
            position: "absolute",
            right: 8,
            top: 8,
            color: isDarkMode ? "#fff" : "#000",
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            color: isDarkMode ? "#fff" : "#000",
            minWidth: "auto",
            padding: "12px 16px",
            transition: "none", // Remove tab transition animation
          },
          "& .Mui-selected": {
            color: isDarkMode ? "#90caf9" : "#1976d2",
          },
          "& .MuiTabs-indicator": {
            transition: "none", // Remove indicator transition animation
          },
        }}
      >
        {tabs.map((tab, _index) => (
          <Tab
            key={tab.label}
            label={`${tab.label} (${tab.count})`}
            disableRipple // Remove ripple effect
          />
        ))}
      </Tabs>
      <DialogContent>{activeTabContent}</DialogContent>
    </Dialog>
  );
};

export default EntityTabDialog;
