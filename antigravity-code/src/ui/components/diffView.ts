import { el } from "../../utils/dom";
import { buildLineDiff } from "../../services/diffBuilder";

export interface DiffActionHandlers {
  onAccept(): void;
  onReject(): void;
  onCopy(): void;
  onReplace(): void;
  onInsertBelow(): void;
  onCreateNewFile(): void;
}

export function createDiffView(original: string, next: string, handlers: DiffActionHandlers): HTMLElement {
  const lines = buildLineDiff(original, next);

  const diffBody = el(
    "div",
    { className: "ag-diff-view" },
    lines.map((line) =>
      el("div", { className: `ag-diff-line ${line.kind}` }, [
        `${line.kind === "add" ? "+" : line.kind === "del" ? "-" : " "} ${line.text}`,
      ]),
    ),
  );

  const actions = el("div", { className: "ag-approval-actions" }, [
    el("button", { className: "ag-primary", onclick: handlers.onAccept }, ["Accept"]),
    el("button", { className: "ag-danger", onclick: handlers.onReject }, ["Reject"]),
    el("button", { className: "ag-ghost", onclick: handlers.onCopy }, ["Copy"]),
    el("button", { className: "ag-ghost", onclick: handlers.onReplace }, ["Replace"]),
    el("button", { className: "ag-ghost", onclick: handlers.onInsertBelow }, ["Insert Below"]),
    el("button", { className: "ag-ghost", onclick: handlers.onCreateNewFile }, ["Create New File"]),
  ]);

  return el("div", { className: "ag-anim-in" }, [diffBody, actions]);
}
