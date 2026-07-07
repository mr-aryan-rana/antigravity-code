export interface ToolResult {
  ok: boolean;
  output: string;
  data?: unknown;
}

export interface ToolExecutionContext {
  workspaceRoot?: string;
}

export type ToolRiskLevel = "read" | "write" | "destructive" | "execute";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  risk: ToolRiskLevel;
  /** Set false for tools registered but unavailable in this Acode install. */
  available: boolean;
  unavailableReason?: string;
  execute(args: Record<string, unknown>, ctx: ToolExecutionContext): Promise<ToolResult>;
}

export type ApprovalDecision = "allow-once" | "always-allow" | "reject";
