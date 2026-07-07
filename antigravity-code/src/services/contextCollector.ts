import { fsAt } from "../tools/fsTool";

export interface ContextItem {
  id: string;
  label: string;
  content: string;
}

/** Builds the "Add Current File" chip. */
export function collectCurrentFile(): ContextItem | null {
  const file = editorManager.activeFile;
  if (!file) return null;
  return {
    id: `file:${file.uri ?? file.name}`,
    label: file.name,
    content: `File: ${file.name}\n\`\`\`\n${file.session.getValue()}\n\`\`\``,
  };
}

/** Builds the "Add Selection" chip. */
export function collectSelection(): ContextItem | null {
  const file = editorManager.activeFile;
  if (!file) return null;
  const session: any = file.session;
  const text = session?.getTextRange ? session.getTextRange(session.selection?.getRange()) : "";
  if (!text) return null;
  return {
    id: `selection:${file.uri ?? file.name}:${Date.now()}`,
    label: `Selection in ${file.name}`,
    content: `Selected text from ${file.name}:\n\`\`\`\n${text}\n\`\`\``,
  };
}

/** Builds a "Mention File" chip from a file browser pick. */
export async function collectMentionedFile(url: string): Promise<ContextItem> {
  const handle = await fsAt(url);
  const stat = await handle.stat();
  const content = await handle.readFile("utf8");
  return {
    id: `mention-file:${url}`,
    label: stat.name,
    content: `File: ${stat.name}\n\`\`\`\n${content}\n\`\`\``,
  };
}

/** Builds a "Mention Folder" chip — shallow listing only, to stay lightweight. */
export async function collectMentionedFolder(url: string): Promise<ContextItem> {
  const handle = await fsAt(url);
  const stat = await handle.stat();
  const entries = await handle.lsDir();
  const listing = entries.map((e) => `${e.isDirectory ? "[dir] " : ""}${e.name}`).join("\n");
  return {
    id: `mention-folder:${url}`,
    label: stat.name,
    content: `Folder: ${stat.name}\n${listing}`,
  };
}

export function renderContextItemsAsMessage(items: ContextItem[]): string {
  if (items.length === 0) return "";
  return `--- Attached context ---\n${items.map((i) => i.content).join("\n\n")}\n--- End context ---`;
}
