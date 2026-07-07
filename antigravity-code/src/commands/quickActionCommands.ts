import { QUICK_ACTIONS } from "../ui/components/quickActions";

const COMMAND_PREFIX = "antigravity";

export interface CommandCallbacks {
  openChat(): void;
  runQuickAction(actionId: string): void;
}

const registeredNames: string[] = [];

/**
 * `acode.require("commands")` can resolve to undefined on older/customized
 * Acode builds where the module isn't registered yet at plugin-init time.
 * Never assume it exists — an unguarded `.addCommand` call there is what
 * crashes plugin init with "Cannot read properties of undefined".
 */
export function registerCommands(callbacks: CommandCallbacks): void {
  const commands = acode.require("commands");
  if (!commands || typeof commands.addCommand !== "function") {
    console.error("[Antigravity Code] commands API not available — skipping command registration.");
    return;
  }

  commands.addCommand({
    name: `${COMMAND_PREFIX}-open-chat`,
    description: "Antigravity Code: Open Chat",
    exec: callbacks.openChat,
  });
  registeredNames.push(`${COMMAND_PREFIX}-open-chat`);

  for (const action of QUICK_ACTIONS) {
    const name = `${COMMAND_PREFIX}-${action.id}`;
    commands.addCommand({
      name,
      description: `Antigravity Code: ${action.label}`,
      exec: () => callbacks.runQuickAction(action.id),
    });
    registeredNames.push(name);
  }

  console.log(`[Antigravity Code] Registered ${registeredNames.length} commands.`);
}

export function unregisterCommands(): void {
  const commands = acode.require("commands");
  const names = registeredNames.splice(0);
  if (!commands || typeof commands.removeCommand !== "function") return;
  for (const name of names) {
    commands.removeCommand(name);
  }
}
