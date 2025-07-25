import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { NodeId } from "../core/model/Node";
import { Entity } from "../core/model/entity/abstractEntity";
import { EntityIds } from "../core/model/entity/entityIds";
import {
  clearSelections,
  getSelectedNodeIds,
  setSelectedNodeId,
  setSelectedNodeIds,
} from "../store/graphInteractionStore";
import { getMouseControlMode } from "../store/mouseControlsStore";
import { setRightActiveSection } from "../store/workspaceConfigStore";

// Context menu state type
export interface ContextMenuState {
  x: number;
  y: number;
  nodeIds?: NodeId[];
}

// App context type
export interface AppContextType {
  // Context menu state
  contextMenu: ContextMenuState | null;
  setContextMenu: (menu: ContextMenuState | null) => void;

  // Event handlers for graph views
  handleNodesRightClick: (
    event: MouseEvent | React.MouseEvent,
    nodeIds: EntityIds<NodeId>
  ) => void;
  handleBackgroundRightClick: (event: MouseEvent | React.MouseEvent) => void;
  handleNodeClick: (nodeId: NodeId, event?: MouseEvent) => void;
  handleBackgroundClick: (event?: MouseEvent) => void;

  // Entity editing (for compatibility with existing components)
  editingEntity: Entity | null;
  jsonEditEntity: Entity | null;
  setEditingEntity: (entity: Entity | null) => void;
  setJsonEditEntity: (entity: Entity | null) => void;

  // Utility methods
  closeContextMenu: () => void;
  isContextMenuOpen: boolean;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [jsonEditEntity, setJsonEditEntity] = useState<Entity | null>(null);

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Handle nodes right-click for context menu
  const handleNodesRightClick = useCallback(
    (event: MouseEvent | React.MouseEvent, nodeIds: EntityIds<NodeId>) => {
      event.preventDefault();
      event.stopPropagation();

      if (nodeIds.size === 0) return;

      // If the clicked node is not in current selection, select it
      const clickedNodeId = nodeIds.toArray()[0]; // Get the first clicked node
      const currentSelectedIds = new EntityIds(nodeIds.toArray());

      if (!currentSelectedIds.has(clickedNodeId)) {
        setSelectedNodeId(clickedNodeId);
      }

      // Show context menu with all selected nodes
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeIds: nodeIds.toArray(),
      });
    },
    []
  );

  // Handle background right-click for context menu
  const handleBackgroundRightClick = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      setContextMenu({
        x: event.clientX,
        y: event.clientY,
      });
    },
    []
  );

  // Handle node click for selection
  const handleNodeClick = useCallback(
    (nodeId: NodeId, event?: MouseEvent) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Get current mouse control mode
      const controlMode = getMouseControlMode();
      const currentSelectedIds = getSelectedNodeIds();

      if (
        controlMode === "multiselection" &&
        event &&
        (event.ctrlKey || event.metaKey)
      ) {
        // Multi-select mode with Ctrl/Cmd key
        if (currentSelectedIds.has(nodeId)) {
          // Remove from selection
          const newSelection = currentSelectedIds
            .toArray()
            .filter((id: NodeId) => id !== nodeId);
          setSelectedNodeIds(newSelection);
        } else {
          // Add to selection
          const newSelection = [...currentSelectedIds.toArray(), nodeId];
          setSelectedNodeIds(newSelection);
        }
      } else {
        // Regular click behavior (clear selection and select only this node)
        setSelectedNodeId(nodeId);
      }

      // Close context menu if open
      closeContextMenu();
    },
    [closeContextMenu]
  );

  // Handle background click to clear selection
  const handleBackgroundClick = useCallback(
    (event?: MouseEvent) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Clear all selections
      clearSelections();

      // Close context menu if open
      closeContextMenu();

      // Close the node details panel if it's open
      setRightActiveSection(null);
    },
    [closeContextMenu]
  );

  // Context value
  const contextValue: AppContextType = {
    contextMenu,
    setContextMenu,
    handleNodesRightClick,
    handleBackgroundRightClick,
    handleNodeClick,
    handleBackgroundClick,
    editingEntity,
    jsonEditEntity,
    setEditingEntity,
    setJsonEditEntity,
    closeContextMenu,
    isContextMenuOpen: contextMenu !== null,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// Hook to use the app context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

// Export the context for direct access if needed
export { AppContext };
