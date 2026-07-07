import { resolveProvider } from "../providers";
import { getProviderDefinition } from "../providers/registry";
import { ChatMessage, ToolCallRequest } from "../types/provider";
import { ApprovalDecision } from "../types/tools";
import { ExtensionConfig } from "../types/conversation";
import { toolRegistry } from "../tools/ToolRegistry";

export type AgentEvent =
  | { type: "content-delta"; text: string }
  | { type: "turn-start" }
  | { type: "turn-end" }
  | { type: "tool-requested"; call: ToolCallRequest; risk: string }
  | { type: "tool-result"; call: ToolCallRequest; ok: boolean; output: string }
  | { type: "tool-rejected"; call: ToolCallRequest }
  | { type: "error"; message: string };

export interface AgentSessionOptions {
  config: ExtensionConfig;
  messages: ChatMessage[];
  onEvent(event: AgentEvent): void;
  /** Ask the UI to render an approval card and resolve with the user's decision. */
  requestApproval(call: ToolCallRequest, risk: string): Promise<ApprovalDecision>;
  signal?: AbortSignal;
}

const MAX_TOOL_ROUNDS = 8;

/**
 * Drives one assistant turn: streams a response, and if the model requests
 * tool calls, gates each one behind explicit user approval before executing
 * it and feeding the result back for a follow-up turn. Never executes a tool
 * automatically.
 */
export interface AgentTurnResult {
  messages: ChatMessage[];
  alwaysAllowedTools: string[];
}

export async function runAgentTurn(options: AgentSessionOptions): Promise<AgentTurnResult> {
  const { config, onEvent, requestApproval, signal } = options;
  const messages = [...options.messages];
  const provider = resolveProvider(config.provider);
  const providerDef = getProviderDefinition(config.provider);
  const alwaysAllow = new Set(config.alwaysAllowedTools);

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    onEvent({ type: "turn-start" });

    let assistantText = "";
    let pendingToolCalls: ToolCallRequest[] = [];

    try {
      await provider.streamChat(
        {
          endpoint: config.endpoint || providerDef.defaultEndpoint,
          apiKey: config.apiKey,
          model: config.model,
          temperature: config.temperature,
          topP: config.topP,
          maxTokens: config.maxTokens,
          systemPrompt: config.systemPrompt,
          messages,
          tools: config.agentMode ? toolRegistry.toProviderDefinitions() : undefined,
          signal,
        },
        (delta) => {
          if (delta.contentDelta) {
            assistantText += delta.contentDelta;
            onEvent({ type: "content-delta", text: delta.contentDelta });
          }
          if (delta.toolCallDeltas) {
            pendingToolCalls = pendingToolCalls.concat(delta.toolCallDeltas);
          }
        },
      );
    } catch (err) {
      onEvent({ type: "error", message: err instanceof Error ? err.message : String(err) });
      onEvent({ type: "turn-end" });
      return { messages, alwaysAllowedTools: Array.from(alwaysAllow) };
    }

    messages.push({
      role: "assistant",
      content: assistantText,
      toolCalls: pendingToolCalls.length > 0 ? pendingToolCalls : undefined,
    });

    onEvent({ type: "turn-end" });

    if (pendingToolCalls.length === 0) {
      return { messages, alwaysAllowedTools: Array.from(alwaysAllow) };
    }

    for (const call of pendingToolCalls) {
      const tool = toolRegistry.get(call.name);
      if (!tool || !tool.available) {
        const output = tool
          ? tool.unavailableReason ?? "Tool is not available."
          : `Unknown tool: ${call.name}`;
        messages.push({ role: "tool", content: output, toolCallId: call.id });
        onEvent({ type: "tool-result", call, ok: false, output });
        continue;
      }

      let decision: ApprovalDecision;
      if (alwaysAllow.has(call.name)) {
        decision = "always-allow";
      } else {
        onEvent({ type: "tool-requested", call, risk: tool.risk });
        decision = await requestApproval(call, tool.risk);
      }

      if (decision === "reject") {
        const output = "User rejected this tool call.";
        messages.push({ role: "tool", content: output, toolCallId: call.id });
        onEvent({ type: "tool-rejected", call });
        continue;
      }

      if (decision === "always-allow") alwaysAllow.add(call.name);

      try {
        const result = await tool.execute(call.arguments, {});
        messages.push({ role: "tool", content: result.output, toolCallId: call.id });
        onEvent({ type: "tool-result", call, ok: result.ok, output: result.output });
      } catch (err) {
        const output = err instanceof Error ? err.message : String(err);
        messages.push({ role: "tool", content: `Error: ${output}`, toolCallId: call.id });
        onEvent({ type: "tool-result", call, ok: false, output });
      }
    }
  }

  onEvent({ type: "error", message: "Reached the maximum number of tool-call rounds for this turn." });
  return { messages, alwaysAllowedTools: Array.from(alwaysAllow) };
}
