export type ProviderId =
  | "nvidia"
  | "openai"
  | "anthropic"
  | "gemini"
  | "ollama"
  | "lmstudio"
  | "openrouter"
  | "together"
  | "groq"
  | "mistral"
  | "deepseek"
  | "openai-compatible";

export interface ProviderDefinition {
  id: ProviderId;
  label: string;
  defaultEndpoint: string;
  endpointEditable: boolean;
  /** Which adapter implementation handles this provider's wire format. */
  adapter: "openai" | "anthropic" | "gemini";
  needsApiKey: boolean;
  exampleModel: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolCallId?: string;
  toolCalls?: ToolCallRequest[];
}

export interface ToolCallRequest {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface StreamDelta {
  contentDelta?: string;
  toolCallDeltas?: ToolCallRequest[];
  done?: boolean;
  finishReason?: string;
}

export interface ChatRequestOptions {
  endpoint: string;
  apiKey: string;
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt?: string;
  messages: ChatMessage[];
  tools?: ToolDefinitionForProvider[];
  signal?: AbortSignal;
}

export interface ToolDefinitionForProvider {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

/**
 * Shared interface every provider adapter implements. Adding a new provider
 * means adding one file here — nothing else in the extension needs to change.
 */
export interface ChatProvider {
  id: ProviderId;
  streamChat(
    options: ChatRequestOptions,
    onDelta: (delta: StreamDelta) => void,
  ): Promise<void>;
}
