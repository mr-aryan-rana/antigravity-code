import { el } from "../../utils/dom";
import { getProviderDefinition } from "../../providers/registry";

export function createModelBadge(provider: string, model: string): HTMLElement {
  const label = getProviderDefinition(provider).label;
  return el("span", { className: "ag-badge" }, [el("span", { className: "ag-dot" }), `${label} · ${model}`]);
}
