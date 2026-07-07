import { INSTALLED_VERSION } from "../version";

/**
 * Where the plugin is hosted (see deployment.md). Acode has no documented
 * API for a plugin to reinstall itself from an arbitrary URL — "Update Now"
 * can only open the download and tell the user how to finish the reinstall
 * via Acode's own plugin manager.
 */
export const VERSION_MANIFEST_URL = "https://antigravity-code.onrender.com/version.json";

export interface VersionManifest {
  version: string;
  download: string;
  changelog?: string;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  installedVersion: string;
  remoteVersion: string;
  downloadUrl: string;
  changelog: string;
}

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** Fetches version.json from the hosted deployment and compares it to the built-in version. Never throws — returns null on any failure (offline, 404, bad JSON). */
export async function checkForUpdate(): Promise<UpdateCheckResult | null> {
  try {
    const response = await fetch(`${VERSION_MANIFEST_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return null;
    const manifest = (await response.json()) as VersionManifest;
    if (!manifest?.version || !manifest?.download) return null;

    return {
      hasUpdate: compareVersions(manifest.version, INSTALLED_VERSION) > 0,
      installedVersion: INSTALLED_VERSION,
      remoteVersion: manifest.version,
      downloadUrl: manifest.download,
      changelog: manifest.changelog ?? "",
    };
  } catch {
    return null;
  }
}
