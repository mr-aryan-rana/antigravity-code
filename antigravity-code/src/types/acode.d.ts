export interface WcPage extends HTMLElement {
  body: HTMLElement;
  header?: HTMLElement;
  settitle: (title: string) => void;
  appendBody: (...els: (HTMLElement | string)[]) => void;
  hide: () => void;
  show?: () => void;
  on: (event: string, cb: (...args: any[]) => void) => void;
}

export interface AcodeCommands {
  addCommand(cmd: {
    name: string;
    description?: string;
    exec: (...args: any[]) => void;
    bindKey?: { win?: string; mac?: string };
  }): void;
  removeCommand(name: string): void;
}

export interface SidebarApps {
  add(
    icon: string,
    id: string,
    title: string,
    init: (container: HTMLElement) => void,
    prepend?: boolean,
    onSelect?: () => void,
  ): void;
  remove(id: string): void;
}

export interface FileBrowserResult {
  url: string;
  name?: string;
}

export interface FileBrowser {
  (mode: "file" | "folder" | "both", title?: string): Promise<FileBrowserResult>;
}

export interface ActionStack {
  push(entry: { id: string; action: () => void }): void;
  remove(id: string): void;
}

export interface AcodeGlobal {
  require(module: "commands"): AcodeCommands;
  require(module: "sidebarApps"): SidebarApps;
  require(module: "page"): (title: string, opts?: Record<string, unknown>) => WcPage;
  require(module: "fileBrowser"): FileBrowser;
  require(module: "actionStack"): ActionStack;
  require(module: string): any;
  define(name: string, mod: unknown): void;
  exec(command: string, value?: unknown): void;
  setPluginInit(
    id: string,
    init: (baseUrl: string, $page: WcPage, cache: { cacheFileUrl?: string; cacheFile?: unknown }) => void,
    settings?: unknown,
  ): void;
  setPluginUnmount(id: string, unmount: () => void): void;
  toInternalUrl(url: string): Promise<string>;
  pushNotification?(title: string, message: string, options?: Record<string, unknown>): void;
  alert?(title: string, message: string): void;
}

export interface EditorFile {
  id: string;
  name: string;
  uri?: string | null;
  session: {
    getValue(): string;
    setValue(value: string): void;
    selection: {
      getRange(): unknown;
      getCursor(): { row: number; column: number };
    };
  };
  getText?(): string;
}

export interface EditorManagerGlobal {
  editor: any;
  activeFile: EditorFile;
  files: EditorFile[];
  on(event: string, cb: (...args: any[]) => void): void;
  off(event: string, cb: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}

/**
 * Acode's actual app-shell root (not officially documented, but used by
 * real-world plugins like AcodeX to mount UI — appending to plain
 * `document.body` can end up invisible behind Acode's own full-screen shell).
 * `.get('main' | 'header' | 'sidebar' | ...)` returns the named region.
 */
export interface AppShellGlobal {
  get(region: string): HTMLElement | undefined;
}

declare global {
  const acode: AcodeGlobal;
  const editorManager: EditorManagerGlobal;
  const app: AppShellGlobal | undefined;
  interface Window {
    acode: AcodeGlobal;
    editorManager: EditorManagerGlobal;
    app?: AppShellGlobal;
  }
}
