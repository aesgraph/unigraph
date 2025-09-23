import { DEFAULT_APP_CONFIG } from "../../../AppConfig";
import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";

export const demo_scenegraph_service_mesh_1 = () => {
  const graph = new Graph();

  const functionalUnit = graph.createNode({
    id: "functional-unit",
    type: "functionalUnit",
    label: "Functional Unit",
    userData: {
      name: "Functional Unit",
      description:
        "A unit that represents a functional component in the service mesh.",
    },
  });

  const serviceCount = 5;
  for (let i = 0; i < serviceCount; i++) {
    const serviceNode = graph.createNode({
      id: `service-${i}`,
      type: "service",
      label: `Service ${i + 1}`,
      userData: {
        name: `Service ${i + 1}`,
        description: `Description for Service ${i + 1}`,
      },
    });

    graph.createEdge(functionalUnit.getId(), serviceNode.getId(), {
      type: "functionalUnitToService",
      label: `Functional Unit to Service ${i + 1}`,
      userData: {
        description: `Edge connecting Functional Unit to Service ${i + 1}`,
      },
    });

    const accessControlNode = graph.createNode({
      id: `service-${i}-access-control-gateway`,
      type: "accessControlGateway",
      label: `Access Control Gateway ${i + 1}`,
      userData: {
        name: `Access Control Gateway ${i + 1}`,
        description: `Gateway for Service ${i + 1}`,
      },
    });

    const endUsersNode = graph.createNode({
      id: `service-${i}-end-users`,
      type: "endUsers",
      label: `End Users for Service ${i + 1}`,
      userData: {
        name: `End Users for Service ${i + 1}`,
        description: `End users interacting with Service ${i + 1}`,
      },
    });

    graph.createEdge(serviceNode.getId(), accessControlNode.getId(), {
      type: "accessControl",
      label: `Access Control for Service ${i + 1}`,
      userData: {
        description: `Edge connecting Service ${i + 1} to its Access Control Gateway`,
      },
    });

    graph.createEdge(accessControlNode.getId(), endUsersNode.getId(), {
      type: "endUsers",
      label: `End Users for Service ${i + 1}`,
      userData: {
        description: `Edge connecting Access Control Gateway ${i + 1} to its End Users`,
      },
    });
  }

  return new SceneGraph({
    graph,
    metadata: {
      name: "Service Mesh",
      description: "A visualization of a service mesh topology.",
    },
    defaultAppConfig: {
      ...DEFAULT_APP_CONFIG(),
      activeView: "ForceGraph3d",
      forceGraph3dOptions: {
        layout: "Physics",
      },
    },
  });
};

export const demo_scenegraph_service_mesh_2 = () => {
  const graph = new Graph();

  const n = 8; // number of services
  const m = 3; // average number of connections per service (m < n)

  // Create service nodes
  const serviceNodes = [];
  for (let i = 0; i < n; i++) {
    const node = graph.createNode({
      id: `service-${i}`,
      type: "service",
      label: `Service ${i + 1}`,
      userData: {
        name: `Service ${i + 1}`,
        description: `Description for Service ${i + 1}`,
      },
    });
    serviceNodes.push(node);
  }

  // Create random connections between services
  for (let i = 0; i < n; i++) {
    // Use a Set to avoid duplicate connections
    const targets = new Set<number>();
    while (targets.size < m) {
      const targetIdx = Math.floor(Math.random() * n);
      // Avoid self-loop and duplicate edge
      if (targetIdx !== i && !targets.has(targetIdx)) {
        targets.add(targetIdx);
        graph.createEdge(
          serviceNodes[i].getId(),
          serviceNodes[targetIdx].getId(),
          {
            type: `serviceToService ${i}-${targetIdx}`,
            label: `Service ${i + 1} → Service ${targetIdx + 1}`,
            userData: {
              description: `Connection from Service ${i + 1} to Service ${targetIdx + 1}`,
            },
          }
        );
      }
    }
  }

  return new SceneGraph({
    graph,
    metadata: {
      name: "Simple Service Mesh",
      description:
        "A simplified visualization of a service mesh topology with random inter-service connections.",
    },
  });
};

// Add service mesh 3: n services connected to a single "Unigraph Intermediate Representation Language" node
export const demo_scenegraph_service_mesh_3 = () => {
  const graph = new Graph();

  const n = 8; // number of services

  // Create the central node
  const unigraphIRNode = graph.createNode({
    id: "unigraph-ir",
    type: "unigraphIR",
    label: "Unigraph Intermediate Representation Language",
    userData: {
      name: "Unigraph Intermediate Representation Language",
      description: "Central node representing Unigraph IR Language.",
    },
  });

  // Create service nodes and connect each to the central node
  for (let i = 0; i < n; i++) {
    const serviceNode = graph.createNode({
      id: `service-${i}`,
      type: "service",
      label: `Service ${i + 1}`,
      userData: {
        name: `Service ${i + 1}`,
        description: `Description for Service ${i + 1}`,
      },
    });

    graph.createEdge(serviceNode.getId(), unigraphIRNode.getId(), {
      type: "serviceToUnigraphLib",
      label: `Service ${i + 1} → Unigraph Lib`,
      userData: {
        description: `Connection from Service ${i + 1} to Unigraph Lib`,
      },
    });
  }

  return new SceneGraph({
    graph,
    metadata: {
      name: "Service Mesh with Unigraph IR",
      description:
        "A service mesh where all services connect to Unigraph Intermediate Representation Language.",
    },
  });
};
