import { el } from "../../utils/dom";
import { PROVIDER_DEFINITIONS, getProviderDefinition } from "../../providers/registry";
import { getConfig, updateConfig, resetConfig, clearCache } from "../../storage/configStore";
import { WcPage } from "../../types/acode";

export function openSettingsPage(baseUrl: string): WcPage {
  const pageFactory = acode.require("page");
  const page = pageFactory("Antigravity Settings");
  const config = getConfig();

  const field = (labelText: string, input: HTMLElement) => el("div", { className: "ag-field" }, [el("label", {}, [labelText]), input]);

  const providerSelect = el(
    "select",
    {},
    Object.values(PROVIDER_DEFINITIONS).map((def) => el("option", { value: def.id }, [def.label])),
  );
  providerSelect.value = config.provider;

  const modelInput = el("input", { type: "text", value: config.model });
  const endpointInput = el("input", { type: "text", value: config.endpoint });
  const apiKeyInput = el("input", { type: "password", value: config.apiKey });

  providerSelect.addEventListener("change", () => {
    const def = getProviderDefinition(providerSelect.value);
    if (!def.endpointEditable) (endpointInput as HTMLInputElement).value = def.defaultEndpoint;
  });

  const temperatureInput = el("input", { type: "number", value: String(config.temperature) });
  temperatureInput.setAttribute("step", "0.1");
  temperatureInput.setAttribute("min", "0");
  temperatureInput.setAttribute("max", "2");

  const topPInput = el("input", { type: "number", value: String(config.topP) });
  topPInput.setAttribute("step", "0.05");
  topPInput.setAttribute("min", "0");
  topPInput.setAttribute("max", "1");

  const maxTokensInput = el("input", { type: "number", value: String(config.maxTokens) });
  maxTokensInput.setAttribute("min", "1");

  const systemPromptInput = el("textarea", { rows: "4" }, [config.systemPrompt]) as HTMLTextAreaElement;
  systemPromptInput.value = config.systemPrompt;

  const streamingCheckbox = el("input", { type: "checkbox" }) as HTMLInputElement;
  streamingCheckbox.checked = config.streaming;
  const agentModeCheckbox = el("input", { type: "checkbox" }) as HTMLInputElement;
  agentModeCheckbox.checked = config.agentMode;
  const autoSaveCheckbox = el("input", { type: "checkbox" }) as HTMLInputElement;
  autoSaveCheckbox.checked = config.autoSave;

  const checkboxRow = (checkbox: HTMLElement, labelText: string) =>
    el("div", { className: "ag-checkbox-row" }, [checkbox, labelText]);

  const saveBtn = el("button", { className: "ag-primary" }, ["Save"]);
  saveBtn.addEventListener("click", () => {
    updateConfig({
      provider: providerSelect.value,
      model: (modelInput as HTMLInputElement).value,
      endpoint: (endpointInput as HTMLInputElement).value,
      apiKey: (apiKeyInput as HTMLInputElement).value,
      temperature: Number((temperatureInput as HTMLInputElement).value) || 0.7,
      topP: Number((topPInput as HTMLInputElement).value) || 0.95,
      maxTokens: Number((maxTokensInput as HTMLInputElement).value) || 2048,
      systemPrompt: systemPromptInput.value,
      streaming: streamingCheckbox.checked,
      agentMode: agentModeCheckbox.checked,
      autoSave: autoSaveCheckbox.checked,
    });
    if (acode.pushNotification) acode.pushNotification("Antigravity Code", "Settings saved.");
  });

  const clearCacheBtn = el("button", { className: "ag-ghost" }, ["Clear Cache"]);
  clearCacheBtn.addEventListener("click", () => clearCache());

  const resetBtn = el("button", { className: "ag-danger" }, ["Reset Extension"]);
  resetBtn.addEventListener("click", () => {
    resetConfig();
    providerSelect.value = "nvidia";
    (modelInput as HTMLInputElement).value = "";
    (endpointInput as HTMLInputElement).value = getProviderDefinition("nvidia").defaultEndpoint;
    (apiKeyInput as HTMLInputElement).value = "";
  });

  const body = el("div", { className: "antigravity ag-wizard" }, [
    el("div", { className: "ag-wizard-card ag-glass" }, [
      field("Provider", providerSelect),
      field("Model", modelInput),
      field("Endpoint", endpointInput),
      field("API Key", apiKeyInput),
      field("Temperature", temperatureInput),
      field("Top P", topPInput),
      field("Max Tokens", maxTokensInput),
      field("System Prompt", systemPromptInput),
      checkboxRow(streamingCheckbox, "Streaming"),
      checkboxRow(agentModeCheckbox, "Agent Mode"),
      checkboxRow(autoSaveCheckbox, "Auto Save"),
      el("div", { className: "ag-wizard-actions" }, [saveBtn, clearCacheBtn, resetBtn]),
    ]),
  ]);

  page.appendBody(
    el("link", { rel: "stylesheet", href: `${baseUrl}media/css/theme.css` }),
    el("link", { rel: "stylesheet", href: `${baseUrl}media/css/wizard.css` }),
    body,
  );

  return page;
}
