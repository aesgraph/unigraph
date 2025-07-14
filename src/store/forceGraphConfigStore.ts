export interface IForceGraphRenderConfig {
  nodeTextLabels: boolean;
  linkWidth: number;
  nodeSize: number;
  linkTextLabels: boolean;
  nodeOpacity: number;
  linkOpacity: number;
  chargeStrength: number;
  backgroundColor?: string;
  fontSize?: number;
  // Camera controls
  cameraPosition?: { x: number; y: number; z: number };
  cameraTarget?: { x: number; y: number; z: number };
  initialZoom?: number;
}

export const DEFAULT_FORCE_GRAPH_RENDER_CONFIG: IForceGraphRenderConfig = {
  nodeTextLabels: false,
  linkWidth: 2,
  nodeSize: 6,
  linkTextLabels: true,
  nodeOpacity: 1,
  linkOpacity: 1,
  //phyics
  chargeStrength: -30, // default.
  // color
  backgroundColor: "#1a1a1a", // default
  // camera defaults
  cameraPosition: { x: 0, y: 0, z: 500 },
  cameraTarget: { x: 0, y: 0, z: 0 },
  initialZoom: 1,
};

// type ForceGraphConfigState = {
//   forceGraphRenderConfig: IForceGraphRenderConfig;
//   setForceGraphRenderConfig: (config: IForceGraphRenderConfig) => void;
// };

// const useForceGraphConfigStore = create<ForceGraphConfigState>((set) => ({
//   forceGraphRenderConfig: DEFAULT_FORCE_GRAPH_RENDER_CONFIG,
//   setForceGraphRenderConfig: (config) =>
//     set({ forceGraphRenderConfig: config }),
// }));

// export const setForceGraphRenderConfig = (config: IForceGraphRenderConfig) => {
//   useForceGraphConfigStore.setState(() => ({
//     forceGraphRenderConfig: config,
//   }));
// };

// export const getForceGraphRenderConfig = () => {
//   return useForceGraphConfigStore.getState().forceGraphRenderConfig;
// };
