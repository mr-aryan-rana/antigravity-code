import { el } from "../../utils/dom";
import { ParsedCodeBlock } from "../../utils/markdown";

export interface CodeBlockActionHandlers {
  onCopy(block: ParsedCodeBlock): void;
  onInsert(block: ParsedCodeBlock): void;
  onReplaceSelection(block: ParsedCodeBlock): void;
  onCreateFile(block: ParsedCodeBlock): void;
  onSaveAsFile(block: ParsedCodeBlock): void;
  onPreviewDiff(block: ParsedCodeBlock): void;
}

/** Mounts the Copy/Insert/Replace/Create/Save/Diff button row for each code block rendered into `container`. */
export function mountCodeBlockActions(
  container: HTMLElement,
  blocks: ParsedCodeBlock[],
  handlers: CodeBlockActionHandlers,
): void {
  for (const block of blocks) {
    const slot = container.querySelector<HTMLElement>(`[data-actions-for="${block.placeholderId}"]`);
    if (!slot) continue;

    const button = (label: string, onClick: () => void) =>
      el("button", { onclick: onClick }, [label]);

    slot.append(
      button("Copy", () => handlers.onCopy(block)),
      button("Insert", () => handlers.onInsert(block)),
      button("Replace", () => handlers.onReplaceSelection(block)),
      button("New File", () => handlers.onCreateFile(block)),
      button("Save As", () => handlers.onSaveAsFile(block)),
      button("Diff", () => handlers.onPreviewDiff(block)),
    );
  }
}
