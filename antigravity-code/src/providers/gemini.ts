import { readSSE } from "../services/sse";
import { ChatProvider, ChatRequestOptions, StreamDelta, ToolCallRequest } from "../types/provider";

/** Google Gemini generateContent streaming (SSE) adapter. */
export const geminiProvider: ChatProvider = {
  id: "gemini",
  async streamChat(options: ChatRequestOptions, onDelta: (delta: StreamDelta) => void): Promise<void> {
    const contents = options.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: m.toolCallId
          ? [{ functionResponse: { name: m.role, response: { content: m.content } } }]
          : [{ text: m.content }],
      }));

    const body: Record<string, unknown> = {
      contents,
      systemInstruction: options.systemPrompt ? { parts: [{ text: options.systemPrompt }] } : undefined,
      generationConfig: {
        temperature: options.temperature,
        topP: options.topP,
        maxOutputTokens: options.maxTokens,
      },
    };

    if (options.tools && options.tools.length > 0) {
      body.tools = [
        {
          functionDeclarations: options.tools.map((t) => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          })),
        },
      ];
    }

    const url = `${options.endpoint.replace(/\/$/, "")}/models/${options.model}:streamGenerateContent?alt=sse&key=${options.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: options.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Gemini request failed (${response.status}): ${text || response.statusText}`);
    }

    await readSSE(
      response,
      (payload) => {
        let json: any;
        try {
          json = JSON.parse(payload);
        } catch {
          return;
        }
        const candidate = json.candidates?.[0];
        if (!candidate) return;

        const parts = candidate.content?.parts ?? [];
        const textDelta = parts
          .filter((p: any) => typeof p.text === "string")
          .map((p: any) => p.text)
          .join("");
        if (textDelta) onDelta({ contentDelta: textDelta });

        const functionCalls = parts.filter((p: any) => p.functionCall);
        if (functionCalls.length > 0) {
          const calls: ToolCallRequest[] = functionCalls.map((p: any) => ({
            id: `call_${Math.random().toString(36).slice(2, 8)}`,
            name: p.functionCall.name,
            arguments: p.functionCall.args ?? {},
          }));
          onDelta({ toolCallDeltas: calls });
        }

        if (candidate.finishReason) onDelta({ finishReason: candidate.finishReason });
      },
      options.signal,
    );

    onDelta({ done: true });
  },
};
