import { el, clear } from "../../utils/dom";
import { PROVIDER_DEFINITIONS, getProviderDefinition } from "../../providers/registry";
import { getConfig, updateConfig, resetConfig, clearCache, setDismissedUpdateVersion } from "../../storage/configStore";
import { WcPage } from "../../types/acode";
import { INSTALLED_VERSION } from "../../version";
import { checkForUpdate, UpdateCheckResult } from "../../services/updateChecker";
import { createUpdateBanner } from "../components/updateBanner";
import { createEyeToggleButton } from "../components/eyeToggleButton";

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
  const apiKeyToggleBtn = createEyeToggleButton(apiKeyInput);

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

  const systemPromptInput = el("textarea", { rows: "4" }) as HTMLTextAreaElement;
  systemPromptInput.value = config.systemPrompt;

  const streamingCheckbox = el("input", { type: "checkbox", id: "ag-streaming" }) as HTMLInputElement;
  streamingCheckbox.checked = config.streaming;
  const agentModeCheckbox = el("input", { type: "checkbox", id: "ag-agent-mode" }) as HTMLInputElement;
  agentModeCheckbox.checked = config.agentMode;
  const autoSaveCheckbox = el("input", { type: "checkbox", id: "ag-auto-save" }) as HTMLInputElement;
  autoSaveCheckbox.checked = config.autoSave;

  const checkboxRow = (checkbox: HTMLInputElement, labelText: string) =>
    el("div", { className: "ag-checkbox-row" }, [
      el("span", { className: "ag-checkbox-hit" }, [checkbox]),
      el("label", { for: checkbox.id }, [labelText]),
    ]);

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

  const updateSlot = el("div", {});
  let lastCheckResult: UpdateCheckResult | null = null;

  function renderUpdateSlot() {
    clear(updateSlot);
    if (!lastCheckResult || !lastCheckResult.hasUpdate) return;
    updateSlot.append(
      createUpdateBanner(lastCheckResult, {
        onUpdateNow: () => {
          if (!lastCheckResult) return;
          window.open(lastCheckResult.downloadUrl, "_blank");
          acode.alert?.(
            "Finish the update",
            "The download has started in your browser. Acode plugins can't reinstall themselves automatically: " +
              "once it's downloaded, go to Settings → Plugins → Antigravity Code, and reinstall using the same " +
              "Remote URL (or pick the downloaded dist.zip via Local install) to complete the update.",
          );
        },
        onLater: () => {
          if (lastCheckResult) setDismissedUpdateVersion(lastCheckResult.remoteVersion);
          renderUpdateSlot();
        },
      }),
    );
  }

  const checkUpdatesBtn = el("button", { className: "ag-ghost" }, ["Check for Updates"]);
  checkUpdatesBtn.addEventListener("click", async () => {
    checkUpdatesBtn.textContent = "Checking...";
    lastCheckResult = await checkForUpdate();
    checkUpdatesBtn.textContent = "Check for Updates";
    if (!lastCheckResult) {
      acode.pushNotification?.("Antigravity Code", "Could not reach the update server. Try again later.");
      return;
    }
    if (!lastCheckResult.hasUpdate) {
      acode.pushNotification?.("Antigravity Code", `You're on the latest version (v${INSTALLED_VERSION}).`);
    }
    renderUpdateSlot();
  });

  const releaseNotesBtn = el("button", { className: "ag-ghost" }, ["Release Notes"]);
  releaseNotesBtn.addEventListener("click", async () => {
    const result = lastCheckResult ?? (await checkForUpdate());
    acode.alert?.(
      `Release Notes${result ? ` — v${result.remoteVersion}` : ""}`,
      result?.changelog || "No release notes available right now.",
    );
  });

  const aboutSection = el("div", { className: "ag-wizard-card ag-glass" }, [
    el("div", { className: "ag-approval-title" }, ["Antigravity Code"]),
    el("div", { className: "ag-checkbox-row" }, [`Version: ${INSTALLED_VERSION}`]),
    el("div", { className: "ag-wizard-actions" }, [checkUpdatesBtn, releaseNotesBtn]),
    updateSlot,
  ]);

  const modalCard = el("div", { className: "ag-modal-card" }, [
    el("div", { className: "ag-wizard-card ag-glass" }, [
      field("Provider", providerSelect),
      field("Model", modelInput),
      field("Endpoint", endpointInput),
      field("API Key", el("div", { className: "ag-key-row" }, [apiKeyInput, apiKeyToggleBtn])),
      field("Temperature", temperatureInput),
      field("Top P", topPInput),
      field("Max Tokens", maxTokensInput),
      field("System Prompt", systemPromptInput),
      checkboxRow(streamingCheckbox, "Streaming"),
      checkboxRow(agentModeCheckbox, "Agent Mode"),
      checkboxRow(autoSaveCheckbox, "Auto Save"),
      el("div", { className: "ag-wizard-actions" }, [saveBtn, clearCacheBtn, resetBtn]),
    ]),
    aboutSection,
  ]);

  const body = el("div", { className: "antigravity ag-modal-overlay" }, [modalCard]);

  page.appendBody(
    el("link", { rel: "stylesheet", href: `${baseUrl}media/css/theme.css` }),
    el("link", { rel: "stylesheet", href: `${baseUrl}media/css/wizard.css` }),
    body,
  );

  return page;
}
