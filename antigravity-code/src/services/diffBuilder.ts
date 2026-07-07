export type DiffLineKind = "add" | "del" | "ctx";

export interface DiffLine {
  kind: DiffLineKind;
  text: string;
}

/**
 * Minimal line-based diff (LCS-based) — enough to render an Accept/Reject
 * preview for AI-suggested file edits. Not intended for huge files.
 */
export function buildLineDiff(original: string, next: string): DiffLine[] {
  const a = original.split("\n");
  const b = next.split("\n");
  const n = a.length;
  const m = b.length;

  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({ kind: "ctx", text: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      result.push({ kind: "del", text: a[i] });
      i++;
    } else {
      result.push({ kind: "add", text: b[j] });
      j++;
    }
  }
  while (i < n) {
    result.push({ kind: "del", text: a[i] });
    i++;
  }
  while (j < m) {
    result.push({ kind: "add", text: b[j] });
    j++;
  }
  return result;
}
