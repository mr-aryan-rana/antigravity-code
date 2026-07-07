import { ToolDefinition } from "../types/tools";
import { fsAt } from "./fsTool";

/**
 * Acode's core plugin API has no documented git or shell-execution module.
 * Some community setups add a terminal plugin that exposes `acode.require('terminal')`;
 * we feature-detect it and fail loudly (not silently) when absent, per the
 * approval-workflow requirement that the assistant never pretends a tool ran.
 */
function getTerminalModule(): { execute(cmd: string): Promise<string> } | null {
  try {
    const mod = acode.require("terminal");
    return mod && typeof mod.execute === "function" ? mod : null;
  } catch {
    return null;
  }
}

export const runTerminalCommandTool: ToolDefinition = {
  name: "run_terminal_command",
  description: "Run a shell command in the project's terminal, if a terminal plugin is installed.",
  parameters: {
    type: "object",
    properties: { command: { type: "string" }, cwd: { type: "string" } },
    required: ["command"],
  },
  risk: "execute",
  get available() {
    return getTerminalModule() !== null;
  },
  unavailableReason:
    "No terminal integration is installed in this Acode app. Install a terminal-capable plugin to enable command execution.",
  async execute(args) {
    const terminal = getTerminalModule();
    if (!terminal) {
      return { ok: false, output: "Terminal integration is not available in this Acode install." };
    }
    const output = await terminal.execute(String(args.command));
    return { ok: true, output };
  },
};

async function readGitDir(projectPath: string) {
  const gitDirUrl = `${projectPath.replace(/\/$/, "")}/.git`;
  const handle = await fsAt(gitDirUrl);
  if (!(await handle.exists())) return null;
  return handle;
}

export const gitStatusTool: ToolDefinition = {
  name: "git_status",
  description:
    "Best-effort git status by reading .git metadata directly (no git binary is available in Acode's sandbox). Falls back to the terminal tool if installed.",
  parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
  risk: "read",
  available: true,
  async execute(args) {
    const terminal = getTerminalModule();
    if (terminal) {
      const output = await terminal.execute(`git -C "${args.path}" status --porcelain -b`);
      return { ok: true, output };
    }
    const gitDir = await readGitDir(String(args.path ?? ""));
    if (!gitDir) return { ok: false, output: "Not a git repository (no .git directory found)." };
    try {
      const headHandle = await fsAt(`${gitDir}/HEAD`);
      const head = String(await headHandle.readFile("utf8")).trim();
      return {
        ok: true,
        output: `HEAD: ${head}\n(Install a terminal plugin for full status/diff/log output.)`,
      };
    } catch {
      return { ok: false, output: "Found .git but could not read HEAD." };
    }
  },
};

export const gitDiffTool: ToolDefinition = {
  name: "git_diff",
  description: "Show git diff. Requires an installed terminal-capable plugin.",
  parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
  risk: "read",
  get available() {
    return getTerminalModule() !== null;
  },
  unavailableReason: "git diff requires a terminal plugin — none is installed.",
  async execute(args) {
    const terminal = getTerminalModule();
    if (!terminal) return { ok: false, output: "Terminal integration is not available in this Acode install." };
    const output = await terminal.execute(`git -C "${args.path}" diff`);
    return { ok: true, output };
  },
};

export const gitLogTool: ToolDefinition = {
  name: "git_log",
  description: "Show recent git commit log. Requires an installed terminal-capable plugin.",
  parameters: {
    type: "object",
    properties: { path: { type: "string" }, count: { type: "number" } },
    required: ["path"],
  },
  risk: "read",
  get available() {
    return getTerminalModule() !== null;
  },
  unavailableReason: "git log requires a terminal plugin — none is installed.",
  async execute(args) {
    const terminal = getTerminalModule();
    if (!terminal) return { ok: false, output: "Terminal integration is not available in this Acode install." };
    const count = Number(args.count ?? 10);
    const output = await terminal.execute(`git -C "${args.path}" log -n ${count} --oneline`);
    return { ok: true, output };
  },
};
