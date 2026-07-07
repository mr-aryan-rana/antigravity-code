declare const __ANTIGRAVITY_VERSION__: string;

/** Injected at build time (webpack DefinePlugin) from package.json — keep package.json, plugin.json, and version.json in sync at release time. */
export const INSTALLED_VERSION: string =
  typeof __ANTIGRAVITY_VERSION__ !== "undefined" ? __ANTIGRAVITY_VERSION__ : "0.0.0";
