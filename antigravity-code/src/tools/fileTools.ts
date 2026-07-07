import { ToolDefinition } from "../types/tools";
import { fsAt } from "./fsTool";

function urlArg(args: Record<string, unknown>, key = "path"): string {
  const value = args[key];
  if (typeof value !== "string" || !value) {
    throw new Error(`Missing required "${key}" argument.`);
  }
  return value;
}

export const readFileTool: ToolDefinition = {
  name: "read_file",
  description: "Read the full text content of a file at the given path/URI.",
  parameters: {
    type: "object",
    properties: { path: { type: "string", description: "File path or URI" } },
    required: ["path"],
  },
  risk: "read",
  available: true,
  async execute(args) {
    const handle = await fsAt(urlArg(args));
    const content = await handle.readFile("utf8");
    return { ok: true, output: String(content) };
  },
};

export const writeFileTool: ToolDefinition = {
  name: "write_file",
  description: "Overwrite a file's entire content. Requires user approval before it runs.",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string" },
      content: { type: "string" },
    },
    required: ["path", "content"],
  },
  risk: "write",
  available: true,
  async execute(args) {
    const handle = await fsAt(urlArg(args));
    await handle.writeFile(String(args.content ?? ""));
    return { ok: true, output: `Wrote ${String(args.content ?? "").length} chars to ${args.path}` };
  },
};

export const editFileTool: ToolDefinition = {
  name: "edit_file",
  description: "Replace an exact substring occurrence within a file (find-and-replace of one match).",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string" },
      find: { type: "string" },
      replace: { type: "string" },
    },
    required: ["path", "find", "replace"],
  },
  risk: "write",
  available: true,
  async execute(args) {
    const handle = await fsAt(urlArg(args));
    const current = String(await handle.readFile("utf8"));
    const find = String(args.find ?? "");
    if (!current.includes(find)) {
      return { ok: false, output: "Could not find the target text to replace." };
    }
    const next = current.replace(find, String(args.replace ?? ""));
    await handle.writeFile(next);
    return { ok: true, output: "Edit applied." };
  },
};

export const replaceTextTool: ToolDefinition = {
  name: "replace_text",
  description: "Replace all occurrences of a substring within a file.",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string" },
      find: { type: "string" },
      replace: { type: "string" },
    },
    required: ["path", "find", "replace"],
  },
  risk: "write",
  available: true,
  async execute(args) {
    const handle = await fsAt(urlArg(args));
    const current = String(await handle.readFile("utf8"));
    const find = String(args.find ?? "");
    const count = find ? current.split(find).length - 1 : 0;
    const next = find ? current.split(find).join(String(args.replace ?? "")) : current;
    await handle.writeFile(next);
    return { ok: true, output: `Replaced ${count} occurrence(s).` };
  },
};

export const appendTextTool: ToolDefinition = {
  name: "append_text",
  description: "Append text to the end of a file.",
  parameters: {
    type: "object",
    properties: { path: { type: "string" }, content: { type: "string" } },
    required: ["path", "content"],
  },
  risk: "write",
  available: true,
  async execute(args) {
    const handle = await fsAt(urlArg(args));
    const current = String(await handle.readFile("utf8"));
    await handle.writeFile(current + String(args.content ?? ""));
    return { ok: true, output: "Appended." };
  },
};

export const createFileTool: ToolDefinition = {
  name: "create_file",
  description: "Create a new file with the given name and content inside a parent directory.",
  parameters: {
    type: "object",
    properties: {
      directory: { type: "string" },
      name: { type: "string" },
      content: { type: "string" },
    },
    required: ["directory", "name"],
  },
  risk: "write",
  available: true,
  async execute(args) {
    const handle = await fsAt(urlArg(args, "directory"));
    const url = await handle.createFile(String(args.name), String(args.content ?? ""));
    return { ok: true, output: `Created ${url}`, data: { url } };
  },
};

export const deleteFileTool: ToolDefinition = {
  name: "delete_file",
  description: "Permanently delete a file or folder. Destructive — requires explicit approval.",
  parameters: {
    type: "object",
    properties: { path: { type: "string" } },
    required: ["path"],
  },
  risk: "destructive",
  available: true,
  async execute(args) {
    const handle = await fsAt(urlArg(args));
    await handle.delete();
    return { ok: true, output: `Deleted ${args.path}` };
  },
};

export const renameFileTool: ToolDefinition = {
  name: "rename_file",
  description: "Rename a file or folder in place.",
  parameters: {
    type: "object",
    properties: { path: { type: "string" }, newName: { type: "string" } },
    required: ["path", "newName"],
  },
  risk: "write",
  available: true,
  async execute(args) {
    const handle = await fsAt(urlArg(args));
    const url = await handle.renameTo(String(args.newName));
    return { ok: true, output: `Renamed to ${url}`, data: { url } };
  },
};

export const moveFileTool: ToolDefinition = {
  name: "move_file",
  description: "Move a file or folder to a new parent directory.",
  parameters: {
    type: "object",
    properties: { path: { type: "string" }, destination: { type: "string" } },
    required: ["path", "destination"],
  },
  risk: "write",
  available: true,
  async execute(args) {
    const handle = await fsAt(urlArg(args));
    const url = await handle.moveTo(String(args.destination));
    return { ok: true, output: `Moved to ${url}`, data: { url } };
  },
};

export const createFolderTool: ToolDefinition = {
  name: "create_folder",
  description: "Create a new folder inside a parent directory.",
  parameters: {
    type: "object",
    properties: { directory: { type: "string" }, name: { type: "string" } },
    required: ["directory", "name"],
  },
  risk: "write",
  available: true,
  async execute(args) {
    const handle = await fsAt(urlArg(args, "directory"));
    const url = await handle.createDirectory(String(args.name));
    return { ok: true, output: `Created folder ${url}`, data: { url } };
  },
};

export const deleteFolderTool: ToolDefinition = {
  name: "delete_folder",
  description: "Permanently delete a folder and its contents. Destructive — requires explicit approval.",
  parameters: {
    type: "object",
    properties: { path: { type: "string" } },
    required: ["path"],
  },
  risk: "destructive",
  available: true,
  async execute(args) {
    const handle = await fsAt(urlArg(args));
    await handle.delete();
    return { ok: true, output: `Deleted folder ${args.path}` };
  },
};

export const listDirectoryTool: ToolDefinition = {
  name: "list_directory",
  description: "List the immediate contents (files and folders) of a directory.",
  parameters: {
    type: "object",
    properties: { path: { type: "string" } },
    required: ["path"],
  },
  risk: "read",
  available: true,
  async execute(args) {
    const handle = await fsAt(urlArg(args));
    const entries = await handle.lsDir();
    const lines = entries.map((e) => `${e.isDirectory ? "[dir] " : "      "}${e.name}`);
    return { ok: true, output: lines.join("\n") || "(empty)", data: entries };
  },
};

async function walk(url: string, matches: (name: string) => boolean, out: string[], depth: number): Promise<void> {
  if (depth > 8) return;
  const handle = await fsAt(url);
  const stat = await handle.stat();
  if (!stat.isDirectory) return;
  const entries = await handle.lsDir();
  for (const entry of entries) {
    if (matches(entry.name)) out.push(entry.url);
    if (entry.isDirectory) await walk(entry.url, matches, out, depth + 1);
  }
}

export const searchFilesTool: ToolDefinition = {
  name: "search_files",
  description: "Recursively search a directory tree for files/folders whose name matches a substring.",
  parameters: {
    type: "object",
    properties: { path: { type: "string" }, query: { type: "string" } },
    required: ["path", "query"],
  },
  risk: "read",
  available: true,
  async execute(args) {
    const query = String(args.query ?? "").toLowerCase();
    const results: string[] = [];
    await walk(urlArg(args), (name) => name.toLowerCase().includes(query), results, 0);
    return { ok: true, output: results.join("\n") || "No matches.", data: results };
  },
};

async function walkFiles(url: string, out: Array<{ url: string; name: string }>, depth: number): Promise<void> {
  if (depth > 8) return;
  const handle = await fsAt(url);
  const stat = await handle.stat();
  if (!stat.isDirectory) return;
  const entries = await handle.lsDir();
  for (const entry of entries) {
    if (entry.isDirectory) {
      await walkFiles(entry.url, out, depth + 1);
    } else {
      out.push({ url: entry.url, name: entry.name });
    }
  }
}

const TEXT_EXTENSIONS = /\.(js|jsx|ts|tsx|py|java|c|cpp|h|hpp|go|rs|php|html|css|json|yml|yaml|sql|sh|md|txt)$/i;

export const searchTextTool: ToolDefinition = {
  name: "search_text",
  description: "Recursively search text files under a directory for a literal string, returning matching lines.",
  parameters: {
    type: "object",
    properties: { path: { type: "string" }, query: { type: "string" } },
    required: ["path", "query"],
  },
  risk: "read",
  available: true,
  async execute(args) {
    const query = String(args.query ?? "");
    if (!query) return { ok: false, output: "Empty search query." };
    const files: Array<{ url: string; name: string }> = [];
    await walkFiles(urlArg(args), files, 0);
    const hits: string[] = [];
    for (const file of files) {
      if (!TEXT_EXTENSIONS.test(file.name)) continue;
      try {
        const handle = await fsAt(file.url);
        const content = String(await handle.readFile("utf8"));
        if (!content.includes(query)) continue;
        content.split("\n").forEach((line, i) => {
          if (line.includes(query)) hits.push(`${file.name}:${i + 1}: ${line.trim()}`);
        });
      } catch {
        // unreadable file, skip
      }
      if (hits.length > 200) break;
    }
    return { ok: true, output: hits.join("\n") || "No matches.", data: hits };
  },
};
