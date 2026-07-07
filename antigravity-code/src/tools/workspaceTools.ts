import { ToolDefinition } from "../types/tools";

export const currentFileTool: ToolDefinition = {
  name: "current_file",
  description: "Get the path and full content of the file currently open in the editor.",
  parameters: { type: "object", properties: {} },
  risk: "read",
  available: true,
  async execute() {
    const file = editorManager.activeFile;
    if (!file) return { ok: false, output: "No file is currently open." };
    return {
      ok: true,
      output: `${file.name} (${file.uri ?? "unsaved"})\n\n${file.session.getValue()}`,
      data: { name: file.name, uri: file.uri },
    };
  },
};

export const selectedTextTool: ToolDefinition = {
  name: "selected_text",
  description: "Get the text currently selected in the active editor, if any.",
  parameters: { type: "object", properties: {} },
  risk: "read",
  available: true,
  async execute() {
    const file = editorManager.activeFile;
    if (!file) return { ok: false, output: "No file is currently open." };
    const session: any = file.session;
    const selectionText = session?.getTextRange ? session.getTextRange(session.selection?.getRange()) : "";
    return { ok: true, output: selectionText || "(no selection)" };
  },
};

export const cursorPositionTool: ToolDefinition = {
  name: "cursor_position",
  description: "Get the current cursor row/column in the active editor.",
  parameters: { type: "object", properties: {} },
  risk: "read",
  available: true,
  async execute() {
    const file = editorManager.activeFile;
    if (!file) return { ok: false, output: "No file is currently open." };
    const cursor = file.session.selection.getCursor();
    return { ok: true, output: `row ${cursor.row}, column ${cursor.column}`, data: cursor };
  },
};

export const recentlyOpenedFilesTool: ToolDefinition = {
  name: "recently_opened_files",
  description: "List files currently open in editor tabs.",
  parameters: { type: "object", properties: {} },
  risk: "read",
  available: true,
  async execute() {
    const files = editorManager.files ?? [];
    const lines = files.map((f) => `${f.name} (${f.uri ?? "unsaved"})`);
    return { ok: true, output: lines.join("\n") || "(no open files)" };
  },
};

export const projectTreeTool: ToolDefinition = {
  name: "project_tree",
  description:
    "Get a shallow tree of the current workspace. Requires a folder URI to be provided by the caller (Acode plugins cannot enumerate the user's opened folders directly).",
  parameters: {
    type: "object",
    properties: { path: { type: "string", description: "Root folder path/URI to list" } },
    required: ["path"],
  },
  risk: "read",
  available: true,
  async execute(args) {
    const { fsAt } = await import("./fsTool");
    const path = String(args.path ?? "");
    if (!path) return { ok: false, output: 'Provide a "path" to the project root.' };

    async function render(url: string, prefix: string, depth: number): Promise<string[]> {
      if (depth > 3) return [];
      const handle = await fsAt(url);
      const entries = await handle.lsDir();
      const lines: string[] = [];
      for (const entry of entries) {
        lines.push(`${prefix}${entry.isDirectory ? "📁" : "📄"} ${entry.name}`);
        if (entry.isDirectory) lines.push(...(await render(entry.url, prefix + "  ", depth + 1)));
      }
      return lines;
    }

    const lines = await render(path, "", 0);
    return { ok: true, output: lines.join("\n") || "(empty)" };
  },
};

export const workspaceSearchTool: ToolDefinition = {
  name: "workspace_search",
  description: "Alias of search_text scoped to a workspace root path.",
  parameters: {
    type: "object",
    properties: { path: { type: "string" }, query: { type: "string" } },
    required: ["path", "query"],
  },
  risk: "read",
  available: true,
  async execute(args, ctx) {
    const { searchTextTool } = await import("./fileTools");
    return searchTextTool.execute(args, ctx);
  },
};

export const openFileTool: ToolDefinition = {
  name: "open_file",
  description: "Open a file in the editor, given its path/URI.",
  parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
  risk: "read",
  available: true,
  async execute(args) {
    const path = String(args.path ?? "");
    const commands = acode.require("commands");
    void commands;
    editorManager.emit("new-file", { uri: path });
    return { ok: true, output: `Requested open: ${path}` };
  },
};

export const showDiagnosticsTool: ToolDefinition = {
  name: "show_diagnostics",
  description: "Show linter/compiler diagnostics for the current file, if a linting plugin exposes them.",
  parameters: { type: "object", properties: {} },
  risk: "read",
  get available() {
    try {
      return acode.require("linting") != null;
    } catch {
      return false;
    }
  },
  unavailableReason: "No diagnostics-capable linting plugin is installed in this Acode app.",
  async execute() {
    try {
      const linting = acode.require("linting");
      const result = linting?.getDiagnostics?.(editorManager.activeFile?.uri);
      return { ok: true, output: JSON.stringify(result ?? [], null, 2) };
    } catch {
      return { ok: false, output: "Diagnostics are not available in this Acode install." };
    }
  },
};

export const entireWorkspaceContextTool: ToolDefinition = {
  name: "entire_workspace_context",
  description:
    "Aggregate context: all open files (name + content) plus a shallow tree of a given workspace root.",
  parameters: {
    type: "object",
    properties: { path: { type: "string", description: "Optional workspace root to include a file tree for" } },
  },
  risk: "read",
  available: true,
  async execute(args) {
    const files = editorManager.files ?? [];
    const openFilesSection = files
      .map((f) => `### ${f.name} (${f.uri ?? "unsaved"})\n\`\`\`\n${f.session.getValue()}\n\`\`\``)
      .join("\n\n");

    let treeSection = "";
    if (args.path) {
      const tree = await projectTreeTool.execute({ path: args.path }, {});
      treeSection = `\n\n## Project tree\n${tree.output}`;
    }

    return { ok: true, output: `## Open files\n${openFilesSection || "(none)"}${treeSection}` };
  },
};
