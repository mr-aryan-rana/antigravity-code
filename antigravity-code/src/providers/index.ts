import { getProviderDefinition } from "./registry";
import { openaiCompatibleProvider } from "./openaiCompatible";
import { anthropicProvider } from "./anthropic";
import { geminiProvider } from "./gemini";
import { ChatProvider } from "../types/provider";

export { PROVIDER_DEFINITIONS, getProviderDefinition } from "./registry";

const ADAPTERS: Record<string, ChatProvider> = {
  openai: openaiCompatibleProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
};

/** Resolve the concrete adapter for a configured provider id. */
export function resolveProvider(providerId: string): ChatProvider {
  const def = getProviderDefinition(providerId);
  return ADAPTERS[def.adapter];
}
