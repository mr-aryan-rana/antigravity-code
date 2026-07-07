import { el } from "../../utils/dom";

export interface QuickAction {
  id: string;
  label: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  { id: "explain", label: "Explain" },
  { id: "refactor", label: "Refactor" },
  { id: "fix-bug", label: "Fix Bug" },
  { id: "generate-tests", label: "Generate Tests" },
  { id: "document", label: "Document" },
  { id: "review", label: "Review" },
  { id: "optimize", label: "Optimize" },
  { id: "ask-ai", label: "Ask AI" },
  { id: "generate-readme", label: "Generate README" },
  { id: "generate-comments", label: "Generate Comments" },
];

export function createQuickActionsRow(onSelect: (action: QuickAction) => void): HTMLElement {
  return el(
    "div",
    { className: "ag-input-actions" },
    QUICK_ACTIONS.map((action) => el("button", { onclick: () => onSelect(action) }, [action.label])),
  );
}
