import { ChatMessage } from "./provider";

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  messages: ChatMessage[];
}

export interface ExtensionConfig {
  provider: string;
  model: string;
  endpoint: string;
  apiKey: string;
  rememberApiKey: boolean;
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
  theme: "dark";
  streaming: boolean;
  agentMode: boolean;
  autoSave: boolean;
  onboarded: boolean;
  alwaysAllowedTools: string[];
}

export const DEFAULT_CONFIG: ExtensionConfig = {
  provider: "nvidia",
  model: "meta/llama-3.3-70b-instruct",
  endpoint: "https://integrate.api.nvidia.com/v1",
  apiKey: "",
  rememberApiKey: true,
  temperature: 0.7,
  topP: 0.95,
  maxTokens: 2048,
  systemPrompt:
    "You are Antigravity Code, an expert pair-programming assistant running inside the Acode Android editor. Be concise and precise.",
  theme: "dark",
  streaming: true,
  agentMode: true,
  autoSave: true,
  onboarded: false,
  alwaysAllowedTools: [],
};
