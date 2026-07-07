/**
 * Reads a fetch Response body as newline-delimited SSE ("data: {...}") frames,
 * calling onEvent for each non-empty payload. Handles chunk boundaries that
 * split a frame across two reads.
 */
export async function readSSE(
  response: Response,
  onEvent: (data: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (!response.body) throw new Error("Response has no readable body for streaming.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    if (signal?.aborted) {
      await reader.cancel();
      return;
    }
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      onEvent(payload);
    }
  }
}
