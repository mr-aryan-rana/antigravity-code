import { getConfig } from "./storage/configStore";
import { openSetupWizard } from "./ui/views/SetupWizardPage";
import { openChatPage } from "./ui/views/ChatPage";
import { openSettingsPage } from "./ui/views/SettingsPage";
import { registerCommands, unregisterCommands } from "./commands/quickActionCommands";

const PLUGIN_ID = "com.antigravity.code";
const SIDEBAR_ICON_CLASS = "icon antigravity-icon";

acode.setPluginInit(PLUGIN_ID, (baseUrl: string) => {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  function openChat() {
    const page = openChatPage(normalizedBaseUrl, openSettings);
    const actionStack = acode.require("actionStack");
    actionStack.push({ id: "antigravity-chat", action: page.hide });
    document.body.append(page);
  }

  function openSettings() {
    const page = openSettingsPage(normalizedBaseUrl);
    const actionStack = acode.require("actionStack");
    actionStack.push({ id: "antigravity-settings", action: page.hide });
    document.body.append(page);
  }

  function openWizard() {
    const page = openSetupWizard(normalizedBaseUrl, {
      onDone: openChat,
      onSkip: openChat,
    });
    const actionStack = acode.require("actionStack");
    actionStack.push({ id: "antigravity-wizard", action: page.hide });
    document.body.append(page);
  }

  function openMain() {
    const config = getConfig();
    if (!config.onboarded) {
      openWizard();
    } else {
      openChat();
    }
  }

  registerCommands({
    openChat: openMain,
    runQuickAction: () => openMain(),
  });

  try {
    const sidebarApps = acode.require("sidebarApps");
    sidebarApps.add(SIDEBAR_ICON_CLASS, PLUGIN_ID, "Antigravity Code", (container: HTMLElement) => {
      const openBtn = document.createElement("button");
      openBtn.textContent = "Open Antigravity Code";
      openBtn.className = "antigravity-sidebar-launch";
      openBtn.addEventListener("click", openMain);
      container.append(openBtn);
    });
  } catch {
    // Sidebar API unavailable in this Acode version — command palette still works.
  }
});

acode.setPluginUnmount(PLUGIN_ID, () => {
  unregisterCommands();
  try {
    acode.require("sidebarApps").remove(PLUGIN_ID);
  } catch {
    // no-op
  }
});
