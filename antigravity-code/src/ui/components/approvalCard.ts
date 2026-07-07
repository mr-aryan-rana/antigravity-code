import { el } from "../../utils/dom";
import { ApprovalDecision } from "../../types/tools";
import { ToolCallRequest } from "../../types/provider";

const RISK_LABEL: Record<string, string> = {
  read: "Read-only",
  write: "Modifies a file",
  destructive: "Destructive",
  execute: "Runs a command",
};

/** Renders the "Run Command? / Allow Once / Always Allow / Reject" style approval card. */
export function createApprovalCard(
  call: ToolCallRequest,
  risk: string,
  onDecision: (decision: ApprovalDecision) => void,
): HTMLElement {
  const argsPre = el("pre", {}, [JSON.stringify(call.arguments, null, 2)]);

  const decide = (decision: ApprovalDecision) => {
    card.querySelectorAll("button").forEach((b) => ((b as HTMLButtonElement).disabled = true));
    card.classList.add(decision === "reject" ? "rejected" : "approved");
    onDecision(decision);
  };

  const card = el("div", { className: "ag-approval-card ag-anim-in" }, [
    el("div", { className: "ag-approval-title" }, [
      `⚠ Run tool: ${call.name}`,
      el("span", { className: "ag-badge" }, [RISK_LABEL[risk] ?? risk]),
    ]),
    argsPre,
    el("div", { className: "ag-approval-actions" }, [
      el("button", { className: "ag-primary", onclick: () => decide("allow-once") }, ["Allow Once"]),
      el("button", { className: "ag-ghost", onclick: () => decide("always-allow") }, ["Always Allow"]),
      el("button", { className: "ag-danger", onclick: () => decide("reject") }, ["Reject"]),
    ]),
  ]);

  return card;
}
