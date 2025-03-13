import { GraphEntityType } from "../components/common/GraphSearch";
import { Tag } from "../core/model/entity/abstractEntity";
import { SceneGraph } from "../core/model/SceneGraph";

export class SceneGraphCache {
  private sceneGraph: SceneGraph;
  private allTags: Map<GraphEntityType | string, Set<Tag>>;
  private allTypes: Map<GraphEntityType | string, Set<string>>;

  public constructor(sceneGraph: SceneGraph) {
    this.sceneGraph = sceneGraph;
    this.allTags = new Map();
    this.allTypes = new Map();
    this.rebuildCache();
  }

  public rebuildCache(): void {
    this.allTags.clear();
    this.allTypes.clear();
    this.allTags.set("Node", new Set());
    this.allTags.set("Edge", new Set());
    this.allTypes.set("Node", new Set());
    this.allTypes.set("Edge", new Set());

    for (const node of this.sceneGraph.getGraph().getNodes()) {
      node.getTags().forEach((tag) => {
        this.allTags.get("Node")!.add(tag);
      });
      this.allTypes.get("Node")!.add(node.getType());
    }
    for (const edge of this.sceneGraph.getGraph().getEdges()) {
      edge.getTags().forEach((tag) => {
        this.allTags.get("Edge")!.add(tag);
      });
      this.allTypes.get("Edge")!.add(edge.getType());
    }
  }

  public getTags(entityType: GraphEntityType): Set<Tag> {
    return this.allTags.get(entityType) ?? new Set();
  }

  public getTypes(entityType: GraphEntityType): Set<string> {
    return this.allTypes.get(entityType) ?? new Set();
  }
}
