import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  DEFAULT_REACTFLOW_CONFIG,
  ReactFlowRenderConfig,
} from "../components/views/ReactFlow/ReactFlowConfigEditor";

interface ReactFlowConfigState {
  config: ReactFlowRenderConfig;
  setConfig: (config: ReactFlowRenderConfig) => void;
  subscribeToConfigChanges: (
    callback: (config: ReactFlowRenderConfig) => void
  ) => () => void;
}

const useReactFlowConfigStore = create(
  immer<ReactFlowConfigState>((set, get) => {
    const subscribers: ((config: ReactFlowRenderConfig) => void)[] = [];

    return {
      config: DEFAULT_REACTFLOW_CONFIG,
      setConfig: (config: ReactFlowRenderConfig) => {
        set((state) => {
          state.config = { ...state.config, ...config };
        });

        // Notify all subscribers of the config change
        subscribers.forEach((callback) => callback(get().config));
      },
      subscribeToConfigChanges: (callback) => {
        subscribers.push(callback);
        return () => {
          const index = subscribers.indexOf(callback);
          if (index !== -1) {
            subscribers.splice(index, 1);
          }
        };
      },
    };
  })
);

export const applyReactFlowConfig = (config: ReactFlowRenderConfig) => {
  useReactFlowConfigStore.getState().setConfig(config);

  // You could also apply the config directly to CSS variables for global styling
  document.documentElement.style.setProperty(
    "--reactflow-node-border-radius",
    `${config.nodeBorderRadius}px`
  );
  document.documentElement.style.setProperty(
    "--reactflow-node-stroke-width",
    `${config.nodeStrokeWidth}px`
  );
  document.documentElement.style.setProperty(
    "--reactflow-node-font-size",
    `${config.nodeFontSize}px`
  );
  document.documentElement.style.setProperty(
    "--reactflow-edge-stroke-width",
    `${config.edgeStrokeWidth}px`
  );
};

export const getReactFlowConfig = (): ReactFlowRenderConfig => {
  return useReactFlowConfigStore.getState().config;
};

export const subscribeToReactFlowConfigChanges = (
  callback: (config: ReactFlowRenderConfig) => void
) => {
  return useReactFlowConfigStore.getState().subscribeToConfigChanges(callback);
};

export default useReactFlowConfigStore;
