import { getConfig } from "./storage/configStore";
import { openSetupWizard } from "./ui/views/SetupWizardPage";
import { openChatPage } from "./ui/views/ChatPage";
import { openSettingsPage } from "./ui/views/SettingsPage";
import { registerCommands, unregisterCommands } from "./commands/quickActionCommands";

const PLUGIN_ID = "com.antigravity.code";
const SIDEBAR_ICON_CLASS = "icon antigravity-icon";
const LOG_PREFIX = "[Antigravity Code]";

/** Pushes a back-action onto Acode's action stack, if that module is available. */
function pushAction(id: string, action: () => void): void {
  let actionStack: ReturnType<typeof acode.require> | undefined;
  try {
    actionStack = acode.require("actionStack");
  } catch {
    actionStack = undefined;
  }
  if (actionStack && typeof actionStack.push === "function") {
    actionStack.push({ id, action });
  } else {
    console.error(`${LOG_PREFIX} actionStack API not available — back button won't close this page.`);
  }
}

/** Appends a page to the DOM, only if it's actually a DOM node. */
function mountPage(page: unknown): void {
  if (page instanceof HTMLElement) {
    document.body.append(page);
  } else {
    console.error(`${LOG_PREFIX} Expected a page element but got`, page);
  }
}

acode.setPluginInit(PLUGIN_ID, (baseUrl: string) => {
  try {
    console.log(`${LOG_PREFIX} Initializing...`);
    const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

    function openChat() {
      const page = openChatPage(normalizedBaseUrl, openSettings);
      pushAction("antigravity-chat", () => page.hide());
      mountPage(page);
    }

    function openSettings() {
      const page = openSettingsPage(normalizedBaseUrl);
      pushAction("antigravity-settings", () => page.hide());
      mountPage(page);
    }

    function openWizard() {
      const page = openSetupWizard(normalizedBaseUrl, {
        onDone: openChat,
        onSkip: openChat,
      });
      pushAction("antigravity-wizard", () => page.hide());
      mountPage(page);
    }

    function openMain() {
      const config = getConfig();
      if (!config.onboarded) {
        openWizard();
      } else {
        openChat();
      }
    }

    console.log(`${LOG_PREFIX} Registering commands...`);
    registerCommands({
      openChat: openMain,
      runQuickAction: () => openMain(),
    });

    console.log(`${LOG_PREFIX} Loading sidebar...`);
    let sidebarApps: ReturnType<typeof acode.require> | undefined;
    try {
      sidebarApps = acode.require("sidebarApps");
    } catch {
      sidebarApps = undefined;
    }
    if (sidebarApps && typeof sidebarApps.add === "function") {
      sidebarApps.add(SIDEBAR_ICON_CLASS, PLUGIN_ID, "Antigravity Code", (container: HTMLElement) => {
        const openBtn = document.createElement("button");
        openBtn.textContent = "Open Antigravity Code";
        openBtn.className = "antigravity-sidebar-launch";
        openBtn.addEventListener("click", openMain);
        container.append(openBtn);
      });
    } else {
      console.error(`${LOG_PREFIX} sidebarApps API not available — use the command palette instead.`);
    }

    console.log(`${LOG_PREFIX} Done.`);
  } catch (err) {
    console.error(`${LOG_PREFIX} Initialization failed:`, err);
    acode.alert?.("Antigravity Code — Plugin Error", String(err instanceof Error ? err.message : err));
  }
});

acode.setPluginUnmount(PLUGIN_ID, () => {
  try {
    unregisterCommands();
    const sidebarApps = acode.require("sidebarApps");
    if (sidebarApps && typeof sidebarApps.remove === "function") {
      sidebarApps.remove(PLUGIN_ID);
    }
  } catch (err) {
    console.error(`${LOG_PREFIX} Unmount failed:`, err);
  }
});
