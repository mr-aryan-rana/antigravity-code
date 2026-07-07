import { QUICK_ACTIONS } from "../ui/components/quickActions";

const COMMAND_PREFIX = "antigravity";

export interface CommandCallbacks {
  openChat(): void;
  runQuickAction(actionId: string): void;
}

const registeredNames: string[] = [];

export function registerCommands(callbacks: CommandCallbacks): void {
  const commands = acode.require("commands");

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
}

export function unregisterCommands(): void {
  const commands = acode.require("commands");
  for (const name of registeredNames.splice(0)) {
    commands.removeCommand(name);
  }
}
