import { readSSE } from "../services/sse";
import { ChatProvider, ChatRequestOptions, StreamDelta, ToolCallRequest } from "../types/provider";

/** Anthropic Messages API (SSE) adapter. */
export const anthropicProvider: ChatProvider = {
  id: "anthropic",
  async streamChat(options: ChatRequestOptions, onDelta: (delta: StreamDelta) => void): Promise<void> {
    const messages = options.messages
      .filter((m) => m.role !== "system")
      .map((m) => {
        if (m.role === "tool") {
          return {
            role: "user",
            content: [{ type: "tool_result", tool_use_id: m.toolCallId, content: m.content }],
          };
        }
        if (m.toolCalls && m.toolCalls.length > 0) {
          return {
            role: "assistant",
            content: [
              ...(m.content ? [{ type: "text", text: m.content }] : []),
              ...m.toolCalls.map((tc) => ({ type: "tool_use", id: tc.id, name: tc.name, input: tc.arguments })),
            ],
          };
        }
        return { role: m.role, content: m.content };
      });

    const body: Record<string, unknown> = {
      model: options.model,
      system: options.systemPrompt,
      messages,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      top_p: options.topP,
      stream: true,
    };

    if (options.tools && options.tools.length > 0) {
      body.tools = options.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters,
      }));
    }

    const response = await fetch(`${options.endpoint.replace(/\/$/, "")}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": options.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
      signal: options.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Anthropic request failed (${response.status}): ${text || response.statusText}`);
    }

    const toolBlocks = new Map<number, { id: string; name: string; argsJson: string }>();

    await readSSE(
      response,
      (payload) => {
        let json: any;
        try {
          json = JSON.parse(payload);
        } catch {
          return;
        }

        switch (json.type) {
          case "content_block_start":
            if (json.content_block?.type === "tool_use") {
              toolBlocks.set(json.index, {
                id: json.content_block.id,
                name: json.content_block.name,
                argsJson: "",
              });
            }
            break;
          case "content_block_delta":
            if (json.delta?.type === "text_delta") {
              onDelta({ contentDelta: json.delta.text });
            } else if (json.delta?.type === "input_json_delta") {
              const block = toolBlocks.get(json.index);
              if (block) block.argsJson += json.delta.partial_json ?? "";
            }
            break;
          case "message_delta":
            if (json.delta?.stop_reason === "tool_use" && toolBlocks.size > 0) {
              const calls: ToolCallRequest[] = Array.from(toolBlocks.values()).map((b) => {
                let args: Record<string, unknown> = {};
                try {
                  args = JSON.parse(b.argsJson || "{}");
                } catch {
                  args = {};
                }
                return { id: b.id, name: b.name, arguments: args };
              });
              onDelta({ toolCallDeltas: calls });
            }
            if (json.delta?.stop_reason) {
              onDelta({ finishReason: json.delta.stop_reason });
            }
            break;
          default:
            break;
        }
      },
      options.signal,
    );

    onDelta({ done: true });
  },
};
