import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  EditorConfig,
  TextNode,
} from "lexical";
import { useEffect } from "react";
import { EdgeId } from "../../../../core/model/Edge";
import { EntityId } from "../../../../core/model/entity/abstractEntity";
import { NodeId } from "../../../../core/model/Node";
import { getCurrentSceneGraph } from "../../../../store/appConfigStore";

// Match [entity id] with support for spaces in the entity id - more strict pattern
const ENTITY_REFERENCE_REGEX = /\[([^[\]]+?)\]/g;

class EntityReferenceNode extends TextNode {
  static getType(): string {
    return "entity-reference";
  }

  static clone(node: EntityReferenceNode): EntityReferenceNode {
    return new EntityReferenceNode(node.__text, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);

    // Extract the entity ID from the text (remove brackets)
    const entityId = this.__text.substring(1, this.__text.length - 1);
    console.log("entity id is ", entityId);

    // Check if this is a valid entity in the current scene graph
    const sceneGraph = getCurrentSceneGraph();
    const node = sceneGraph.getGraph().maybeGetNode(entityId as NodeId);
    const edge = node
      ? null
      : sceneGraph.getGraph().maybeGetEdge(entityId as EdgeId);
    const entity = sceneGraph
      .getEntityCache()
      .maybeGetEntityById(entityId as EntityId);

    // Style based on entity type
    if (node) {
      dom.style.color = "#7c3aed"; // Purple for nodes
      dom.style.backgroundColor = "rgba(124, 58, 237, 0.1)";
      dom.title = `Node: ${node.getLabel() || entityId}`;
    } else if (edge) {
      dom.style.color = "#2563eb"; // Blue for edges
      dom.style.backgroundColor = "rgba(37, 99, 235, 0.1)";
      dom.title = `Edge: ${edge.getType() || entityId}`;
    } else if (entity) {
      dom.style.color = "#059669"; // Green for entities
      dom.style.backgroundColor = "rgba(5, 150, 105, 0.1)";
      dom.title = `Entity: ${entityId}`;
    } else {
      // Unknown entity
      dom.style.color = "#6b7280"; // Gray for unknown
      dom.style.backgroundColor = "rgba(107, 114, 128, 0.1)";
      dom.title = `Unknown: ${entityId}`;
    }

    dom.style.padding = "2px 4px";
    dom.style.borderRadius = "4px";
    dom.style.fontWeight = "500";
    dom.style.cursor = "pointer";
    dom.dataset.entityId = entityId;
    dom.classList.add("entity-reference");

    return dom;
  }

  updateDOM(): boolean {
    return false;
  }
}

export function EntityReferencePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([EntityReferenceNode])) {
      throw new Error(
        "EntityReferencePlugin: EntityReferenceNode not registered on editor"
      );
    }

    const transformEntityReferences = () => {
      editor.update(() => {
        const nodesToTransform: Array<{
          node: TextNode;
          matches: RegExpMatchArray[];
        }> = [];

        // Find text nodes that contain potential entity references
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          selection.getNodes().forEach((node) => {
            if (
              node instanceof TextNode &&
              !(node instanceof EntityReferenceNode)
            ) {
              const matches = Array.from(
                node.getTextContent().matchAll(ENTITY_REFERENCE_REGEX)
              );
              if (matches.length > 0) {
                nodesToTransform.push({ node, matches });
              }
            }
          });
        });

        // Process each node with matches
        nodesToTransform.forEach(({ node, matches }) => {
          matches.reverse().forEach((match) => {
            const startOffset = match.index!;
            const endOffset = startOffset + match[0].length;

            // Ensure the node is a TextNode and has valid text content
            if (
              !(node instanceof TextNode) ||
              typeof node.getTextContent !== "function"
            ) {
              console.error("Invalid node or missing text content:", node);
              return;
            }

            const textContent = node.getTextContent();
            if (startOffset >= textContent.length) {
              console.error("Invalid start offset:", startOffset);
              return;
            }

            try {
              // Split the text node at the match boundaries
              const [_beforeNode, matchAndAfterNode] =
                node.splitText(startOffset);
              const [matchNode, _afterNode] = matchAndAfterNode.splitText(
                endOffset - startOffset
              );

              // Replace the match node with an entity reference node
              const entityReferenceNode = new EntityReferenceNode(match[0]);
              matchNode.replace(entityReferenceNode);
            } catch (error) {
              console.error("Error transforming entity reference:", error);
            }
          });
        });
      });
    };

    // Register listeners for text content changes
    const removeContentListener = editor.registerTextContentListener(() => {
      transformEntityReferences();
    });

    // Initial transformation to catch existing references
    transformEntityReferences();

    return () => {
      removeContentListener();
    };
  }, [editor]);

  return null;
}

export { EntityReferenceNode };
