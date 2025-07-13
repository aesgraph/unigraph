/**
 * SceneGraphController handles modifications to the scene graph based on commands
 * received from various sources including the LLM Studio service.
 */

import { NodeId } from "../../../../core/model/Node";
import { getCurrentSceneGraph } from "../../../../store/appConfigStore";

export interface SceneGraphCommand {
  action: string;
  target?: string;
  parameters?: Record<string, any>;
}

export interface CommandDefinition {
  name: string;
  description: string;
  examples: string[];
  keywords: string[];
  apiFormat: string;
}

export class SceneGraphController {
  // API command prefix for explicit command identification
  private readonly COMMAND_PREFIX = "/graph";

  // Command registry for easy extension
  private commandRegistry: CommandDefinition[] = [
    {
      name: "addNode",
      description: "Add a new node to the scene graph",
      examples: [
        "/graph addNode type=TextBox label=Hello",
        "/graph addNode type=Image position=(100,200) label=Picture",
      ],
      keywords: ["addnode"],
      apiFormat:
        "/graph addNode type=<nodeType> [label=<labelText>] [position=(<x>,<y>)]",
    },
    {
      name: "removeNode",
      description: "Remove a node from the scene graph",
      examples: [
        "/graph removeNode id=node1",
        "/graph removeNode label=TextBox1",
      ],
      keywords: ["removenode"],
      apiFormat: "/graph removeNode {id=<nodeId> | label=<nodeLabel>}",
    },
    {
      name: "createEdge",
      description: "Connect two nodes in the scene graph with an edge",
      examples: ["/graph createEdge source=node1 target=node2"],
      keywords: ["createedge"],
      apiFormat: "/graph createEdge source=<sourceId> target=<targetId>",
    },
    // listNodes command is disabled as requested
  ];

  /**
   * Get all available commands with their descriptions
   */
  getAvailableCommands(): CommandDefinition[] {
    return this.commandRegistry;
  }

  /**
   * Get a formatted string of available commands for the LLM context
   */
  getCommandsDescription(): string {
    return this.commandRegistry
      .map(
        (cmd) =>
          `Command: ${cmd.name}\nDescription: ${cmd.description}\nFormat: ${cmd.apiFormat}\nExamples: ${cmd.examples.join(", ")}`
      )
      .join("\n\n");
  }

  /**
   * Register a new command
   * @param command The command definition to add
   */
  registerCommand(command: CommandDefinition): void {
    this.commandRegistry.push(command);
  }

  /**
   * Check if a message contains any graph commands using the API format
   * This is much stricter and won't trigger on normal conversation
   */
  containsCommandKeywords(message: string): boolean {
    if (!message) return false;

    // Extract actual command lines from the message (could be embedded in markdown or text)
    const lines = message.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip markdown code markers
      if (trimmedLine === "```" || trimmedLine.startsWith("```")) continue;

      // Check if line starts with command prefix
      if (trimmedLine.startsWith(this.COMMAND_PREFIX)) {
        console.log("Found command prefix in line:", trimmedLine);

        // Extract the command name after the prefix
        const commandParts = trimmedLine
          .substring(this.COMMAND_PREFIX.length)
          .trim()
          .split(/\s+/);
        if (commandParts.length === 0) continue;

        const commandName = commandParts[0].toLowerCase();

        // Check if command name exists in registry
        const commandExists = this.commandRegistry.some(
          (cmd) =>
            cmd.name.toLowerCase() === commandName ||
            cmd.keywords.includes(commandName)
        );

        if (commandExists) {
          console.log(`Command "${commandName}" exists: ${commandExists}`);
          return true;
        }
      }
    }

    // Check for commands in code blocks too
    const codeBlockRegex = /```[\s\S]*?```|`[^`]+`/g;
    let match;

    while ((match = codeBlockRegex.exec(message)) !== null) {
      const codeBlock = match[0].replace(/```/g, "").trim();
      if (codeBlock.includes(this.COMMAND_PREFIX)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Process a message that might contain multiple commands
   * @param message Message that might contain one or more commands
   * @returns Results from executing all commands found in the message
   */
  async processMultipleCommands(message: string): Promise<string> {
    const results: string[] = [];
    let processedAny = false;

    // Step 1: Extract all command lines from the message
    const commandLines: string[] = [];

    // Check for commands in plain text lines
    const lines = message.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith(this.COMMAND_PREFIX)) {
        commandLines.push(trimmedLine);
      }
    }

    // Check for commands in code blocks
    const codeBlockRegex = /```(?:[\w]*)\n?([\s\S]*?)```|`([^`]+)`/g;
    let codeMatch;
    while ((codeMatch = codeBlockRegex.exec(message)) !== null) {
      const codeBlock = (codeMatch[1] || codeMatch[2] || "").trim();
      const codeLines = codeBlock.split("\n");

      for (const codeLine of codeLines) {
        const trimmedCodeLine = codeLine.trim();
        if (trimmedCodeLine.startsWith(this.COMMAND_PREFIX)) {
          commandLines.push(trimmedCodeLine);
        }
      }
    }

    // If we haven't found any commands yet, try a more aggressive regex approach
    if (commandLines.length === 0) {
      const commandRegex = new RegExp(
        `${this.COMMAND_PREFIX}\\s+\\w+[^\\n]*`,
        "g"
      );
      let commandMatch;
      while ((commandMatch = commandRegex.exec(message)) !== null) {
        commandLines.push(commandMatch[0].trim());
      }
    }

    console.log(
      `Found ${commandLines.length} command(s) in message:`,
      commandLines
    );

    // Step 2: Execute each command and collect results
    if (commandLines.length > 0) {
      for (const commandLine of commandLines) {
        try {
          const commandResult = await this.executeCommand(commandLine);
          results.push(`Command: ${commandLine}\nResult: ${commandResult}`);
          processedAny = true;
        } catch (error) {
          results.push(
            `Command: ${commandLine}\nError: ${error instanceof Error ? error.message : String(error)}`
          );
          processedAny = true;
        }
      }
    }

    // Return results
    if (!processedAny) {
      return "No valid graph commands found in message.";
    }

    return results.join("\n\n");
  }

  /**
   * Parse a command string into a structured SceneGraphCommand using API format
   */
  parseCommand(commandString: string): SceneGraphCommand {
    // Extract actual command lines from potentially multi-line input
    const lines = commandString.split("\n");
    let commandLine = "";

    // Find the first line that contains our command prefix
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith(this.COMMAND_PREFIX)) {
        commandLine = trimmedLine;
        break;
      }
    }

    if (!commandLine) {
      return {
        action: "unknown",
        parameters: { originalCommand: commandString },
      };
    }

    console.log("Found command line:", commandLine);

    // Extract command parts: prefix, command name, and parameters
    const withoutPrefix = commandLine
      .substring(this.COMMAND_PREFIX.length)
      .trim();
    const firstSpace = withoutPrefix.indexOf(" ");

    const commandName =
      firstSpace > 0
        ? withoutPrefix.substring(0, firstSpace).toLowerCase()
        : withoutPrefix.toLowerCase();

    console.log("Parsing command:", commandName);

    // Get parameters string and parse into key-value pairs
    const paramsString =
      firstSpace > 0 ? withoutPrefix.substring(firstSpace).trim() : "";

    const params = this.parseParameters(paramsString);
    console.log("Parsed parameters:", params);

    switch (commandName) {
      case "addnode":
        return {
          action: "addNode",
          parameters: {
            type: params.type || "default",
            label: params.label || "",
            position: this.parsePositionParam(params.position),
          },
        };

      case "removenode":
        return {
          action: "removeNode",
          target: params.id || params.label || "",
          parameters: params,
        };

      case "createedge":
        return {
          action: "createEdge",
          parameters: {
            source: params.source || "",
            target: params.target || "",
          },
        };

      // Keep the case for "listnodes" but it won't be triggered since it's
      // no longer in the command registry
      case "listnodes":
        return {
          action: "listNodes",
          parameters: params,
        };

      default:
        return {
          action: "unknown",
          parameters: {
            originalCommand: commandString,
            parsedCommand: commandName,
          },
        };
    }
  }

  /**
   * Parse a parameters string into key-value pairs
   * Supports format: key1=value1 key2="value with spaces" key3=(10,20)
   */
  private parseParameters(paramsString: string): Record<string, string> {
    const result: Record<string, string> = {};

    if (!paramsString) return result;

    // Match key=value patterns, handling quoted values and parentheses
    const paramRegex = /(\w+)=(["']([^"']+)["']|\([^)]+\)|[^\s]+)/g;
    let match;

    while ((match = paramRegex.exec(paramsString)) !== null) {
      const key = match[1].toLowerCase();
      let value = match[2];

      // Remove surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.substring(1, value.length - 1);
      }

      result[key] = value;
    }

    return result;
  }

  /**
   * Parse a position parameter string like "(100,200)" into {x,y} object
   */
  private parsePositionParam(positionStr: string | undefined): {
    x: number;
    y: number;
  } {
    if (!positionStr) {
      return {
        x: Math.floor(Math.random() * 500),
        y: Math.floor(Math.random() * 500),
      };
    }

    // Remove parentheses and split by comma
    const cleanPos = positionStr.replace(/[()]/g, "");
    const [xStr, yStr] = cleanPos.split(",");

    const x = parseInt(xStr, 10) || 0;
    const y = parseInt(yStr, 10) || 0;

    return { x, y };
  }

  /**
   * Execute a graph command based on a natural language input
   */
  async executeCommand(commandString: string): Promise<string> {
    try {
      // Check if the command is enclosed in backticks or has explanatory text
      console.log("Executing command:", commandString);

      const parsedCommand = this.parseCommand(commandString);
      console.log("Parsed command:", parsedCommand);

      if (parsedCommand.action === "unknown") {
        // If we couldn't parse a command directly, look for it in code blocks
        const codeBlockRegex = /`{1,3}([^`]+)`{1,3}/g;
        let match;

        while ((match = codeBlockRegex.exec(commandString)) !== null) {
          const potentialCommand = match[1].trim();
          if (potentialCommand.startsWith(this.COMMAND_PREFIX)) {
            console.log("Found command in code block:", potentialCommand);
            // Try parsing the code block content
            const codeCommand = this.parseCommand(potentialCommand);
            if (codeCommand.action !== "unknown") {
              return this.executeAction(codeCommand);
            }
          }
        }

        return `Unrecognized command: ${commandString}. Available commands:\n${this.getCommandsDescription()}`;
      }

      return this.executeAction(parsedCommand);
    } catch (error) {
      console.error("Error executing graph command:", error);
      throw new Error(
        `Failed to execute graph command: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Execute a parsed command
   */
  private executeAction(parsedCommand: SceneGraphCommand): string {
    switch (parsedCommand.action) {
      case "addNode":
        return this.addNode(parsedCommand.parameters);
      case "removeNode":
        return this.removeNode(parsedCommand.target!, parsedCommand.parameters);
      case "createEdge":
        return this.createEdge(parsedCommand.parameters);
      case "listNodes":
        return "The listNodes command is disabled.";
      default:
        return `Unrecognized graph command. Available commands:\n${this.getCommandsDescription()}`;
    }
  }

  // Graph modification methods
  private addNode(params: any): string {
    try {
      // Generate random position if not provided
      if (
        !params.position ||
        (params.position.x === 0 && params.position.y === 0)
      ) {
        params.position = {
          x: Math.floor(Math.random() * 500),
          y: Math.floor(Math.random() * 500),
        };
      }

      // Ensure we have a type
      const nodeType = params.type || "default";
      const nodeLabel = params.label || nodeType;

      console.log(
        `Adding node of type ${nodeType} with label ${nodeLabel} at position (${params.position.x}, ${params.position.y})`
      );

      // Create the node in the scene graph
      const _newNode = getCurrentSceneGraph()
        .getGraph()
        .createNodeIfMissing(nodeLabel, {
          label: nodeLabel,
          type: nodeType,
          position: params.position,
        });

      getCurrentSceneGraph().refreshDisplayConfig();
      getCurrentSceneGraph().notifyGraphChanged();

      return `Added new ${nodeType} node with label "${nodeLabel}" to the graph at position (${params.position.x}, ${params.position.y})`;
    } catch (error) {
      console.error("Error adding node:", error);
      return `Failed to add node: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  private removeNode(nodeId: string, params: any): string {
    try {
      console.log(`Removing node with ID/label: ${nodeId || params.label}`);

      // Find the node by ID or by label
      const graph = getCurrentSceneGraph().getGraph();
      const nodeToRemove = nodeId || params.label;

      if (!nodeToRemove) {
        return "Please specify either id or label to remove a node";
      }

      const nodeById = graph.getNode(nodeToRemove);

      if (nodeById) {
        graph.removeNode(nodeToRemove);
        getCurrentSceneGraph().notifyGraphChanged();
        return `Removed node with ID ${nodeToRemove} from the graph`;
      }

      // If we didn't find by ID, try to find by label
      const allNodes = graph.getNodes();
      const nodeByLabel = allNodes
        .toArray()
        .find(
          (node) =>
            node.getLabel()?.toLowerCase() === nodeToRemove.toLowerCase()
        );

      if (nodeByLabel) {
        graph.removeNode(nodeByLabel.getId());
        getCurrentSceneGraph().notifyGraphChanged();
        return `Removed node with label "${nodeToRemove}" from the graph`;
      }

      return `Could not find node with ID or label "${nodeToRemove}"`;
    } catch (error) {
      console.error("Error removing node:", error);
      return `Failed to remove node: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  private createEdge(params: any): string {
    try {
      const sourceId = params.source;
      const targetId = params.target;

      console.log(`Creating edge using params:`, params);

      if (!sourceId) {
        return "Please specify source";
      }

      if (!targetId) {
        return "Please specify target";
      }

      const graph = getCurrentSceneGraph().getGraph();

      // Helper function to find node by ID
      const findNode = (id: string) => {
        const nodeById = graph.getNode(id as NodeId);
        if (nodeById) return nodeById.getId();
        return undefined;
      };

      const source = findNode(sourceId);
      const target = findNode(targetId);

      if (!source) {
        return `Source node ${sourceId} not found`;
      }

      if (!target) {
        return `Target node ${targetId} not found`;
      }

      // Create the edge
      graph.createEdge(source, target);

      getCurrentSceneGraph().refreshDisplayConfig();
      getCurrentSceneGraph().notifyGraphChanged();

      return `Created edge from node "${sourceId}" to node "${targetId}"`;
    } catch (error) {
      console.error("Error creating edge:", error);
      return `Failed to create edge: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  private _listNodes(): string {
    try {
      const graph = getCurrentSceneGraph().getGraph();
      const nodes = graph.getNodes();

      if (nodes.size() === 0) {
        return "The graph currently has no nodes.";
      }

      const nodeList = nodes
        .map(
          (node) =>
            `- ID: ${node.getId()}, Type: ${node.getType() || "default"}, Label: ${node.getLabel() || "unnamed"}`
        )
        .join("\n");

      return `Current nodes in the graph:\n${nodeList}`;
    } catch (error) {
      console.error("Error listing nodes:", error);
      return `Failed to list nodes: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}

// Export a singleton instance
export const sceneGraphController = new SceneGraphController();
