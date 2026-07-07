import { readSSE } from "../services/sse";
import { ChatMessage, ChatProvider, ChatRequestOptions, StreamDelta, ToolCallRequest } from "../types/provider";

/**
 * Handles the OpenAI chat-completions wire format, shared by NVIDIA NIM,
 * OpenAI, Groq, Together AI, Mistral, DeepSeek, OpenRouter, LM Studio,
 * Ollama, and any other "OpenAI compatible" endpoint.
 */
export const openaiCompatibleProvider: ChatProvider = {
  id: "openai-compatible",
  async streamChat(options: ChatRequestOptions, onDelta: (delta: StreamDelta) => void): Promise<void> {
    const messages: ChatMessage[] = options.systemPrompt
      ? [{ role: "system", content: options.systemPrompt }, ...options.messages]
      : options.messages;

    const body: Record<string, unknown> = {
      model: options.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.toolCallId ? { tool_call_id: m.toolCallId } : {}),
        ...(m.toolCalls
          ? {
              tool_calls: m.toolCalls.map((tc) => ({
                id: tc.id,
                type: "function",
                function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
              })),
            }
          : {}),
      })),
      temperature: options.temperature,
      top_p: options.topP,
      max_tokens: options.maxTokens,
      stream: true,
    };

    if (options.tools && options.tools.length > 0) {
      body.tools = options.tools.map((t) => ({
        type: "function",
        function: { name: t.name, description: t.description, parameters: t.parameters },
      }));
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (options.apiKey) headers.Authorization = `Bearer ${options.apiKey}`;

    const response = await fetch(`${options.endpoint.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: options.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Provider request failed (${response.status}): ${text || response.statusText}`);
    }

    const toolCallAccum = new Map<number, { id: string; name: string; args: string }>();

    await readSSE(
      response,
      (payload) => {
        let json: any;
        try {
          json = JSON.parse(payload);
        } catch {
          return;
        }
        const choice = json.choices?.[0];
        if (!choice) return;

        const contentDelta: string | undefined = choice.delta?.content;
        const toolCallsDelta = choice.delta?.tool_calls as
          | Array<{ index: number; id?: string; function?: { name?: string; arguments?: string } }>
          | undefined;

        if (toolCallsDelta) {
          for (const tc of toolCallsDelta) {
            const existing = toolCallAccum.get(tc.index) ?? { id: "", name: "", args: "" };
            if (tc.id) existing.id = tc.id;
            if (tc.function?.name) existing.name += tc.function.name;
            if (tc.function?.arguments) existing.args += tc.function.arguments;
            toolCallAccum.set(tc.index, existing);
          }
        }

        const finishReason: string | undefined = choice.finish_reason ?? undefined;

        if (contentDelta || finishReason) {
          onDelta({ contentDelta, finishReason, done: false });
        }

        if (finishReason === "tool_calls" && toolCallAccum.size > 0) {
          const calls: ToolCallRequest[] = Array.from(toolCallAccum.values()).map((tc) => {
            let args: Record<string, unknown> = {};
            try {
              args = JSON.parse(tc.args || "{}");
            } catch {
              args = {};
            }
            return { id: tc.id || `call_${Math.random().toString(36).slice(2, 8)}`, name: tc.name, arguments: args };
          });
          onDelta({ toolCallDeltas: calls, done: false });
        }
      },
      options.signal,
    );

    onDelta({ done: true });
  },
};
