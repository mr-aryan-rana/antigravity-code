import { el } from "../../utils/dom";
import { PROVIDER_DEFINITIONS, getProviderDefinition } from "../../providers/registry";
import { updateConfig, getConfig } from "../../storage/configStore";
import { WcPage } from "../../types/acode";
import { createLogoMark } from "../components/logo";

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

  const modelInput = el("input", { type: "text", placeholder: getProviderDefinition(config.provider).exampleModel, value: config.model });

  const endpointInput = el("input", { type: "text", value: config.endpoint });

  const apiKeyInput = el("input", { type: "password", placeholder: "API Key", value: config.apiKey });
  const toggleKeyBtn = el("button", { className: "ag-ghost" }, ["Show"]);
  toggleKeyBtn.addEventListener("click", () => {
    const showing = apiKeyInput.getAttribute("type") === "text";
    apiKeyInput.setAttribute("type", showing ? "password" : "text");
    toggleKeyBtn.textContent = showing ? "Show" : "Hide";
  });

  const rememberCheckbox = el("input", { type: "checkbox" }) as HTMLInputElement;
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

  const wizard = el("div", { className: "antigravity ag-wizard" }, [
    el("div", { className: "ag-wizard-hero" }, [
      createLogoMark(64),
      el("h1", {}, ["Welcome to Antigravity Code"]),
      el("p", {}, ["Let's connect your AI model."]),
    ]),
    el("div", { className: "ag-wizard-card ag-glass" }, [
      el("div", { className: "ag-field" }, [el("label", {}, ["Provider"]), providerSelect]),
      el("div", { className: "ag-field" }, [el("label", {}, ["Model Name"]), modelInput]),
      el("div", { className: "ag-field" }, [el("label", {}, ["Endpoint"]), endpointInput]),
      el("div", { className: "ag-field" }, [
        el("label", {}, ["API Key"]),
        el("div", { className: "ag-key-row" }, [apiKeyInput, toggleKeyBtn]),
      ]),
      el("div", { className: "ag-checkbox-row" }, [rememberCheckbox, "Remember API Key Securely"]),
      el("div", { className: "ag-wizard-actions" }, [continueBtn, skipBtn, learnMoreBtn]),
    ]),
  ]);

  const link = el("link", { rel: "stylesheet", href: `${baseUrl}media/css/theme.css` });
  const link2 = el("link", { rel: "stylesheet", href: `${baseUrl}media/css/wizard.css` });
  page.appendBody(link, link2, wizard);

  return page;
}
