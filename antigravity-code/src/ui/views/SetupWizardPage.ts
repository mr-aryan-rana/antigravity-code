import { el } from "../../utils/dom";
import { PROVIDER_DEFINITIONS, getProviderDefinition } from "../../providers/registry";
import { updateConfig, getConfig } from "../../storage/configStore";
import { WcPage } from "../../types/acode";
import { createLogoMark } from "../components/logo";
import { createEyeToggleButton } from "../components/eyeToggleButton";

export interface SetupWizardCallbacks {
  onDone(): void;
  onSkip(): void;
}

export function openSetupWizard(baseUrl: string, callbacks: SetupWizardCallbacks): WcPage {
  const pageFactory = acode.require("page");
  const page = pageFactory("Welcome to Antigravity Code");
  const config = getConfig();

  const providerSelect = el(
    "select",
    {},
    Object.values(PROVIDER_DEFINITIONS).map((def) => el("option", { value: def.id }, [def.label])),
  );
  providerSelect.value = config.provider;

  const modelInput = el("input", {
    type: "text",
    placeholder: getProviderDefinition(config.provider).exampleModel,
    value: config.model,
  });

  const endpointInput = el("input", { type: "text", value: config.endpoint });

  // Placeholder shows an example key format rather than repeating the field's own "API Key" label above it.
  const apiKeyInput = el("input", { type: "password", placeholder: "sk-...", value: config.apiKey });
  const toggleKeyBtn = createEyeToggleButton(apiKeyInput);

  const rememberCheckbox = el("input", { type: "checkbox", id: "ag-remember-key" }) as HTMLInputElement;
  rememberCheckbox.checked = config.rememberApiKey;

  function syncEndpointForProvider() {
    const def = getProviderDefinition(providerSelect.value);
    if (!def.endpointEditable) {
      endpointInput.value = def.defaultEndpoint;
      endpointInput.setAttribute("readonly", "");
    } else {
      endpointInput.removeAttribute("readonly");
      if (!endpointInput.value) endpointInput.value = def.defaultEndpoint;
    }
    modelInput.setAttribute("placeholder", def.exampleModel);
  }
  providerSelect.addEventListener("change", syncEndpointForProvider);
  syncEndpointForProvider();

  const continueBtn = el("button", { className: "ag-primary" }, ["Continue"]);
  const skipBtn = el("button", { className: "ag-ghost" }, ["Skip"]);
  const learnMoreBtn = el("button", { className: "ag-ghost" }, ["Learn More"]);

  continueBtn.addEventListener("click", () => {
    updateConfig({
      provider: providerSelect.value,
      model: (modelInput as HTMLInputElement).value || getProviderDefinition(providerSelect.value).exampleModel,
      endpoint: (endpointInput as HTMLInputElement).value,
      apiKey: (apiKeyInput as HTMLInputElement).value,
      rememberApiKey: rememberCheckbox.checked,
      onboarded: true,
    });
    page.hide();
    callbacks.onDone();
  });

  skipBtn.addEventListener("click", () => {
    updateConfig({ onboarded: true });
    page.hide();
    callbacks.onSkip();
  });

  learnMoreBtn.addEventListener("click", () => {
    window.open("https://github.com/", "_blank");
  });

  const field = (labelText: string, input: HTMLElement, required = false) =>
    el("div", { className: "ag-field" }, [
      el("label", { className: required ? "ag-required" : undefined }, [labelText]),
      input,
    ]);

  const modalCard = el("div", { className: "ag-modal-card" }, [
    el("div", { className: "ag-wizard-hero" }, [
      createLogoMark(56),
      el("h1", {}, ["Welcome to Antigravity Code"]),
      el("p", {}, ["Let's connect your AI model."]),
    ]),
    el("div", { className: "ag-wizard-card ag-glass" }, [
      field("Provider", providerSelect, true),
      field("Model Name", modelInput, true),
      field("Endpoint", endpointInput),
      field("API Key", el("div", { className: "ag-key-row" }, [apiKeyInput, toggleKeyBtn])),
      el("div", { className: "ag-checkbox-row" }, [
        el("span", { className: "ag-checkbox-hit" }, [rememberCheckbox]),
        el("label", { for: "ag-remember-key" }, ["Remember API Key Securely"]),
      ]),
      el("div", { className: "ag-wizard-actions" }, [continueBtn, skipBtn, learnMoreBtn]),
    ]),
  ]);

  const wizard = el("div", { className: "antigravity ag-modal-overlay" }, [modalCard]);

  const link = el("link", { rel: "stylesheet", href: `${baseUrl}media/css/theme.css` });
  const link2 = el("link", { rel: "stylesheet", href: `${baseUrl}media/css/wizard.css` });
  page.appendBody(link, link2, wizard);

  return page;
}
