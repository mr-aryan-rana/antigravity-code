/**
 * Pluggable key/value storage. Acode's plugin platform does not expose a
 * hardware-backed secure-storage API, so the default backend is namespaced
 * localStorage. Callers never see this — swapping in a real secure backend
 * later (e.g. if Acode adds a Keystore bridge) means changing only
 * LocalStorageBackend, not any caller.
 */
export interface StorageBackend {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  keys(prefix: string): string[];
}

const NAMESPACE = "antigravity-code:";

class LocalStorageBackend implements StorageBackend {
  get(key: string): string | null {
    return window.localStorage.getItem(NAMESPACE + key);
  }

  set(key: string, value: string): void {
    window.localStorage.setItem(NAMESPACE + key, value);
  }

  remove(key: string): void {
    window.localStorage.removeItem(NAMESPACE + key);
  }

  keys(prefix: string): string[] {
    const out: string[] = [];
    const full = NAMESPACE + prefix;
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(full)) out.push(k.slice(NAMESPACE.length));
    }
    return out;
  }
}

export const storageBackend: StorageBackend = new LocalStorageBackend();

export function getJSON<T>(key: string, fallback: T): T {
  const raw = storageBackend.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setJSON(key: string, value: unknown): void {
  storageBackend.set(key, JSON.stringify(value));
}
