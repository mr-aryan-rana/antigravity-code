import { getConfig, getDismissedUpdateVersion } from "./storage/configStore";
import { openSetupWizard } from "./ui/views/SetupWizardPage";
import { openChatPage } from "./ui/views/ChatPage";
import { openSettingsPage } from "./ui/views/SettingsPage";
import { registerCommands, unregisterCommands } from "./commands/quickActionCommands";
import { checkForUpdate } from "./services/updateChecker";
import { createFloatingButton } from "./ui/components/floatingButton";

const PLUGIN_ID = "com.antigravity.code";
/**
 * Acode's sidebar icon slot renders Google Material Icons via a
 * "material-icons <name>" class — a made-up class name renders as a blank,
 * invisible slot with no error (the plugin still "works", it just has no
 * visible entry point). "smart_toy" is a real Material Icons glyph name.
 */
const SIDEBAR_ICON_CLASS = "material-icons smart_toy";
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

/**
 * Finds the actual visible mount point for plugin UI. `window.app` is an
 * undocumented but real global exposed by Acode's own app shell (confirmed
 * via the AcodeX terminal plugin's source, which mounts into `app.get("main")`
 * rather than `document.body`) — appending straight to `document.body` can
 * render behind/outside Acode's full-screen app root and never be seen.
 */
function getMountRoot(): HTMLElement {
  try {
    const main = window.app?.get("main");
    if (main instanceof HTMLElement) return main;
  } catch {
    /* window.app not available on this Acode build */
  }
  return document.body;
}

/** Appends a page to the DOM, only if it's actually a DOM node. */
function mountPage(page: unknown): void {
  if (page instanceof HTMLElement) {
    getMountRoot().append(page);
  } else {
    console.error(`${LOG_PREFIX} Expected a page element but got`, page);
  }
}

/** Injects the shared theme stylesheet into <head> once, so it applies globally — including to UI mounted outside any page's own DOM subtree. */
function ensureGlobalStylesheet(baseUrl: string): void {
  const existing = document.head.querySelector(`link[data-antigravity-theme]`);
  if (existing) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${baseUrl}media/css/theme.css`;
  link.setAttribute("data-antigravity-theme", "1");
  document.head.append(link);
}

acode.setPluginInit(PLUGIN_ID, (baseUrl: string) => {
  try {
    console.log(`${LOG_PREFIX} Initializing...`);
    const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    ensureGlobalStylesheet(normalizedBaseUrl);

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

    console.log(`${LOG_PREFIX} Adding floating launch button...`);
    getMountRoot().append(createFloatingButton(openMain));

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
      console.error(`${LOG_PREFIX} sidebarApps API not available — the floating button and command palette still work.`);
    }

    console.log(`${LOG_PREFIX} Done.`);

    // Non-blocking: never delays plugin init, never throws (checkForUpdate swallows its own errors).
    checkForUpdate().then((result) => {
      if (!result || !result.hasUpdate) return;
      if (getDismissedUpdateVersion() === result.remoteVersion) return;
      acode.pushNotification?.(
        "Antigravity Code",
        `🚀 v${result.remoteVersion} is available (you have v${result.installedVersion}). Open Settings to update.`,
        { onClick: openSettings },
      );
    });
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
