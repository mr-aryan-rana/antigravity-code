import { DEFAULT_CONFIG, ExtensionConfig } from "../types/conversation";
import { getJSON, setJSON, storageBackend } from "./StorageService";

const CONFIG_KEY = "config";

let cached: ExtensionConfig | null = null;

export function getConfig(): ExtensionConfig {
  if (!cached) {
    cached = { ...DEFAULT_CONFIG, ...getJSON<Partial<ExtensionConfig>>(CONFIG_KEY, {}) };
  }
  return cached;
}

export function updateConfig(patch: Partial<ExtensionConfig>): ExtensionConfig {
  const next = { ...getConfig(), ...patch };
  cached = next;
  const toPersist = next.rememberApiKey ? next : { ...next, apiKey: "" };
  setJSON(CONFIG_KEY, toPersist);
  return next;
}

export function resetConfig(): ExtensionConfig {
  cached = { ...DEFAULT_CONFIG };
  storageBackend.remove(CONFIG_KEY);
  return cached;
}

export function clearCache(): void {
  const keys = storageBackend.keys("");
  for (const k of keys) {
    if (k !== CONFIG_KEY) storageBackend.remove(k);
  }
}

const DISMISSED_UPDATE_KEY = "dismissed-update-version";

export function getDismissedUpdateVersion(): string | null {
  return storageBackend.get(DISMISSED_UPDATE_KEY);
}

export function setDismissedUpdateVersion(version: string): void {
  storageBackend.set(DISMISSED_UPDATE_KEY, version);
}
