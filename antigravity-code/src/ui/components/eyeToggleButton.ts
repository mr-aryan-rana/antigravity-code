import { el } from "../../utils/dom";

const EYE_OPEN =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_CLOSED =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.68 19.68 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a19.86 19.86 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

/** A show/hide toggle button (eye icon) for a password-type input, matching the input's height. */
export function createEyeToggleButton(input: HTMLInputElement): HTMLButtonElement {
  const button = el("button", { className: "ag-ghost", type: "button", "aria-label": "Show API key" });
  button.innerHTML = EYE_OPEN;

  button.addEventListener("click", () => {
    const showing = input.getAttribute("type") === "text";
    input.setAttribute("type", showing ? "password" : "text");
    button.innerHTML = showing ? EYE_OPEN : EYE_CLOSED;
    button.setAttribute("aria-label", showing ? "Show API key" : "Hide API key");
  });

  return button;
}
