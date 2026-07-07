import { ToolDefinition } from "../types/tools";
import * as fileTools from "./fileTools";
import * as workspaceTools from "./workspaceTools";
import * as gitTerminalTools from "./gitTerminalTools";

const ALL_TOOLS: ToolDefinition[] = [
  fileTools.readFileTool,
  fileTools.writeFileTool,
  fileTools.editFileTool,
  fileTools.replaceTextTool,
  fileTools.appendTextTool,
  fileTools.createFileTool,
  fileTools.deleteFileTool,
  fileTools.renameFileTool,
  fileTools.moveFileTool,
  fileTools.createFolderTool,
  fileTools.deleteFolderTool,
  fileTools.listDirectoryTool,
  fileTools.searchFilesTool,
  fileTools.searchTextTool,
  workspaceTools.workspaceSearchTool,
  workspaceTools.currentFileTool,
  workspaceTools.selectedTextTool,
  workspaceTools.cursorPositionTool,
  workspaceTools.recentlyOpenedFilesTool,
  workspaceTools.projectTreeTool,
  workspaceTools.openFileTool,
  workspaceTools.showDiagnosticsTool,
  workspaceTools.entireWorkspaceContextTool,
  gitTerminalTools.runTerminalCommandTool,
  gitTerminalTools.gitStatusTool,
  gitTerminalTools.gitDiffTool,
  gitTerminalTools.gitLogTool,
];

/**
 * Central place the agent loop and provider-facing tool schemas pull from.
 * TODO(extension-point): tools sourced from an MCP server would be merged in
 * here (same ToolDefinition shape), without touching callers.
 */
export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  constructor(tools: ToolDefinition[] = ALL_TOOLS) {
    for (const tool of tools) this.tools.set(tool.name, tool);
  }

  list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  toProviderDefinitions() {
    return this.list()
      .filter((t) => t.available)
      .map((t) => ({ name: t.name, description: t.description, parameters: t.parameters }));
  }
}

export const toolRegistry = new ToolRegistry();
