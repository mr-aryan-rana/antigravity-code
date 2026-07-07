import { el } from "../../utils/dom";
import { renderMarkdown, ParsedCodeBlock } from "../../utils/markdown";
import { mountCodeBlockActions, CodeBlockActionHandlers } from "./codeBlockActions";

export type BubbleRole = "user" | "assistant" | "system";

export interface ChatBubbleHandle {
  element: HTMLElement;
  /** Re-renders markdown content as more streamed text arrives. */
  update(fullText: string): void;
  setStreaming(streaming: boolean): void;
}

export function createChatBubble(
  role: BubbleRole,
  initialText: string,
  codeHandlers: CodeBlockActionHandlers,
): ChatBubbleHandle {
  const content = el("div", { className: "ag-bubble-content" });
  const cursor = el("span", { className: "ag-cursor" });
  const bubble = el("div", { className: `ag-bubble ${role} ag-anim-in` }, [content]);

  let streaming = false;

  function render(text: string) {
    const { html, codeBlocks } = renderMarkdown(text);
    content.innerHTML = html;
    if (streaming) content.append(cursor);
    mountCodeBlockActions(content, codeBlocks as ParsedCodeBlock[], codeHandlers);
  }

  render(initialText);

  return {
    element: bubble,
    update(fullText: string) {
      render(fullText);
    },
    setStreaming(next: boolean) {
      streaming = next;
      if (!streaming) cursor.remove();
    },
  };
}
