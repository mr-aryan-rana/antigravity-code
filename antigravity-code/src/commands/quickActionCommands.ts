import { QUICK_ACTIONS } from "../ui/components/quickActions";

const COMMAND_PREFIX = "antigravity";

export interface CommandCallbacks {
  openChat(): void;
  runQuickAction(actionId: string): void;
}

interface CommandLike {
  addCommand(cmd: { name: string; description?: string; exec: (...args: unknown[]) => void }): void;
  removeCommand(name: string): void;
}

const registeredNames: string[] = [];

/**
 * Real-world Acode plugins (e.g. AcodeX) register commands via
 * `editorManager.editor.commands.addCommand` — Ace's own command manager,
 * which is guaranteed to exist once an editor is loaded. `acode.require("commands")`
 * is a newer, documented wrapper but isn't reliably present on every Acode
 * build, so we register on BOTH when available rather than picking one.
 */
function getCommandTargets(): CommandLike[] {
  const targets: CommandLike[] = [];

  try {
    const aceCommands = editorManager?.editor?.commands;
    if (aceCommands && typeof aceCommands.addCommand === "function") targets.push(aceCommands);
  } catch {
    /* editorManager not ready */
  }

  try {
    const acodeCommands = acode.require("commands");
    if (acodeCommands && typeof acodeCommands.addCommand === "function" && !targets.includes(acodeCommands)) {
      targets.push(acodeCommands);
    }
  } catch {
    /* commands module not available on this Acode build */
  }

  return targets;
}

export function registerCommands(callbacks: CommandCallbacks): void {
  const targets = getCommandTargets();
  if (targets.length === 0) {
    console.error(
      "[Antigravity Code] Neither editorManager.editor.commands nor the commands API is available — " +
        "command palette entries won't be registered. The floating button/sidebar icon still work.",
    );
    return;
  }

  const commandDefs = [
    { name: `${COMMAND_PREFIX}-open-chat`, description: "Antigravity Code: Open Chat", exec: callbacks.openChat },
    ...QUICK_ACTIONS.map((action) => ({
      name: `${COMMAND_PREFIX}-${action.id}`,
      description: `Antigravity Code: ${action.label}`,
      exec: () => callbacks.runQuickAction(action.id),
    })),
  ];

  for (const target of targets) {
    for (const def of commandDefs) {
      target.addCommand(def);
    }
  }
  registeredNames.push(...commandDefs.map((d) => d.name));

  console.log(`[Antigravity Code] Registered ${commandDefs.length} commands on ${targets.length} command target(s).`);
}

export function unregisterCommands(): void {
  const targets = getCommandTargets();
  const names = registeredNames.splice(0);
  for (const target of targets) {
    for (const name of names) {
      target.removeCommand(name);
    }
  }
}
