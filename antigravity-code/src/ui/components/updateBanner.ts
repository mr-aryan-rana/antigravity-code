import { el } from "../../utils/dom";
import { UpdateCheckResult } from "../../services/updateChecker";

export interface UpdateBannerHandlers {
  onUpdateNow(): void;
  onLater(): void;
}

/** Renders the "Update Available — Current vX / Latest vY" card with Update Now / Later actions. */
export function createUpdateBanner(result: UpdateCheckResult, handlers: UpdateBannerHandlers): HTMLElement {
  return el("div", { className: "ag-wizard-card ag-glass ag-anim-in" }, [
    el("div", { className: "ag-approval-title" }, ["🚀 Update Available"]),
    el("div", { className: "ag-checkbox-row" }, [`Current: v${result.installedVersion}`]),
    el("div", { className: "ag-checkbox-row" }, [`Latest: v${result.remoteVersion}`]),
    ...(result.changelog ? [el("pre", {}, [result.changelog])] : []),
    el("div", { className: "ag-wizard-actions" }, [
      el("button", { className: "ag-primary", onclick: handlers.onUpdateNow }, ["Update Now"]),
      el("button", { className: "ag-ghost", onclick: handlers.onLater }, ["Later"]),
    ]),
  ]);
}
