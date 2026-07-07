/** Thin, typed wrapper around Acode's `fs`/`fsOperation` module (docs.acode.app/docs/utilities/fs). */
export interface FsEntry {
  name: string;
  url: string;
  isDirectory: boolean;
}

export interface FsStat {
  name: string;
  url: string;
  isFile: boolean;
  isDirectory: boolean;
  size: number;
  modifiedDate: number;
  canRead: boolean;
  canWrite: boolean;
}

export interface FsHandle {
  lsDir(): Promise<FsEntry[]>;
  readFile(encoding?: string): Promise<string | ArrayBuffer>;
  writeFile(content: string): Promise<void>;
  createFile(name: string, content: string): Promise<string>;
  createDirectory(name: string): Promise<string>;
  delete(): Promise<void>;
  copyTo(destination: string): Promise<string>;
  moveTo(destination: string): Promise<string>;
  renameTo(newName: string): Promise<string>;
  exists(): Promise<boolean>;
  stat(): Promise<FsStat>;
}

export function fsAt(url: string): Promise<FsHandle> {
  const fs = acode.require("fs") as (url: string) => Promise<FsHandle>;
  return fs(url);
}
