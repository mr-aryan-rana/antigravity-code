import { el } from "../../utils/dom";
import { createLogoMark } from "./logo";

/**
 * A guaranteed, always-visible entry point. Sidebar icons and command
 * palette entries depend on Acode modules (`sidebarApps`, `commands`) that
 * aren't reliably present on every Acode build — a plain fixed-position
 * button appended to the DOM has no such dependency.
 */
export function createFloatingButton(onClick: () => void): HTMLButtonElement {
  const button = el("button", { className: "ag-fab", onclick: onClick }, [createLogoMark(28)]);
  return button;
}
