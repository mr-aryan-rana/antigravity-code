import { el, clear } from "../../utils/dom";
import { WcPage } from "../../types/acode";
import { getConfig, updateConfig } from "../../storage/configStore";
import {
  createConversation,
  listConversations,
  saveConversation,
  deleteConversation,
  searchConversations,
  exportConversation,
  importConversation,
} from "../../storage/conversationStore";
import { Conversation } from "../../types/conversation";
import { ChatMessage, ToolCallRequest } from "../../types/provider";
import { ApprovalDecision } from "../../types/tools";
import { runAgentTurn } from "../../agent/AgentSession";
import { createChatBubble, ChatBubbleHandle } from "../components/chatBubble";
import { createApprovalCard } from "../components/approvalCard";
import { createDiffView } from "../components/diffView";
import { createModelBadge } from "../components/modelBadge";
import { createLogoMark } from "../components/logo";
import { createQuickActionsRow } from "../components/quickActions";
import { ParsedCodeBlock } from "../../utils/markdown";
import {
  ContextItem,
  collectCurrentFile,
  collectSelection,
  collectMentionedFile,
  collectMentionedFolder,
  renderContextItemsAsMessage,
} from "../../services/contextCollector";
import { fsAt } from "../../tools/fsTool";

export function openChatPage(baseUrl: string, openSettings: () => void): WcPage {
  const pageFactory = acode.require("page");
  const page = pageFactory("Antigravity Code");

  let conversation: Conversation = listConversations()[0] ?? createConversation();
  let contextItems: ContextItem[] = [];
  let abortController: AbortController | null = null;

  const chatBody = el("div", { className: "ag-chat-body ag-scroll" });
  const historyPanel = el("div", { className: "ag-chat-body ag-scroll", style: "display:none" });
  const modelBadgeSlot = el("span", {});
  const contextChipsRow = el("div", { className: "ag-context-chips" });
  const textarea = el("textarea", { rows: "1", placeholder: "Message Antigravity Code..." }) as HTMLTextAreaElement;

  function refreshModelBadge() {
    clear(modelBadgeSlot);
    const cfg = getConfig();
    modelBadgeSlot.append(createModelBadge(cfg.provider, cfg.model));
  }

  function renderContextChips() {
    clear(contextChipsRow);
    for (const item of contextItems) {
      const chip = el("span", { className: "ag-chip" }, [
        item.label,
        el(
          "span",
          {
            className: "ag-chip-x",
            onclick: () => {
              contextItems = contextItems.filter((c) => c.id !== item.id);
              renderContextChips();
            },
          },
          ["✕"],
        ),
      ]);
      contextChipsRow.append(chip);
    }
  }

  function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function bubbleForMessage(message: ChatMessage): ChatBubbleHandle | null {
    if (message.role === "user" || message.role === "assistant") {
      const bubble = createChatBubble(message.role, message.content, codeBlockHandlers);
      chatBody.append(bubble.element);
      return bubble;
    }
    return null;
  }

  function renderConversation() {
    clear(chatBody);
    if (conversation.messages.length === 0) {
      chatBody.append(
        el("div", { className: "ag-empty-state" }, [
          "Start a conversation. Try attaching your current file with \"Add Current File\" below.",
        ]),
      );
    }
    for (const message of conversation.messages) bubbleForMessage(message);
    scrollToBottom();
  }

  const codeBlockHandlers = {
    onCopy(block: ParsedCodeBlock) {
      navigator.clipboard?.writeText(block.code).catch(() => undefined);
    },
    onInsert(block: ParsedCodeBlock) {
      try {
        const file = editorManager.activeFile;
        const session: any = file.session;
        const cursor = session.selection.getCursor();
        session.insert(cursor, block.code);
      } catch {
        acode.pushNotification?.("Antigravity Code", "No active editor to insert into.");
      }
    },
    onReplaceSelection(block: ParsedCodeBlock) {
      try {
        const file = editorManager.activeFile;
        const session: any = file.session;
        session.replace(session.selection.getRange(), block.code);
      } catch {
        acode.pushNotification?.("Antigravity Code", "No active selection to replace.");
      }
    },
    async onCreateFile(block: ParsedCodeBlock) {
      try {
        const fileBrowser = acode.require("fileBrowser");
        const folder = await fileBrowser("folder", "Choose a folder for the new file");
        const name = window.prompt("File name", "untitled.txt");
        if (!name) return;
        const handle = await fsAt(folder.url);
        await handle.createFile(name, block.code);
        acode.pushNotification?.("Antigravity Code", `Created ${name}`);
      } catch {
        acode.pushNotification?.("Antigravity Code", "File creation cancelled or unavailable.");
      }
    },
    async onSaveAsFile(block: ParsedCodeBlock) {
      return codeBlockHandlers.onCreateFile(block);
    },
    onPreviewDiff(block: ParsedCodeBlock) {
      try {
        const file = editorManager.activeFile;
        const original = file.session.getValue();
        const diffContainer = el("div", { className: "ag-bubble assistant" });
        const view = createDiffView(original, block.code, {
          onAccept: () => {
            file.session.setValue(block.code);
            (file as any).save?.();
            diffContainer.remove();
          },
          onReject: () => diffContainer.remove(),
          onCopy: () => navigator.clipboard?.writeText(block.code).catch(() => undefined),
          onReplace: () => {
            file.session.setValue(block.code);
            (file as any).save?.();
            diffContainer.remove();
          },
          onInsertBelow: () => {
            const cursor = (file.session as any).selection.getCursor();
            (file.session as any).insert(cursor, `\n${block.code}`);
            diffContainer.remove();
          },
          onCreateNewFile: () => codeBlockHandlers.onCreateFile(block),
        });
        diffContainer.append(view);
        chatBody.append(diffContainer);
        scrollToBottom();
      } catch {
        acode.pushNotification?.("Antigravity Code", "No active file to diff against.");
      }
    },
  };

  function requestApproval(call: ToolCallRequest, risk: string): Promise<ApprovalDecision> {
    return new Promise((resolve) => {
      const wrapper = el("div", { className: "ag-anim-in" });
      wrapper.append(createApprovalCard(call, risk, (decision) => resolve(decision)));
      chatBody.append(wrapper);
      scrollToBottom();
    });
  }

  async function sendMessage(rawText: string) {
    const text = rawText.trim();
    if (!text) return;

    const contextPrefix = renderContextItemsAsMessage(contextItems);
    const effectiveContent = contextPrefix ? `${contextPrefix}\n\n${text}` : text;

    conversation.messages.push({ role: "user", content: text });
    bubbleForMessage({ role: "user", content: text });
    scrollToBottom();

    contextItems = [];
    renderContextChips();

    const providerMessages: ChatMessage[] = conversation.messages
      .slice(0, -1)
      .concat([{ role: "user", content: effectiveContent }]);

    const assistantBubble = createChatBubble("assistant", "", codeBlockHandlers);
    assistantBubble.setStreaming(true);
    chatBody.append(assistantBubble.element);
    let assistantText = "";

    abortController = new AbortController();
    const config = getConfig();

    const baseMessageCount = providerMessages.length;

    const result = await runAgentTurn({
      config,
      messages: providerMessages,
      signal: abortController.signal,
      onEvent(evt) {
        if (evt.type === "content-delta") {
          assistantText += evt.text;
          assistantBubble.update(assistantText);
          scrollToBottom();
        } else if (evt.type === "turn-end") {
          assistantBubble.setStreaming(false);
        } else if (evt.type === "error") {
          assistantBubble.setStreaming(false);
          const errorBubble = createChatBubble("system", `Error: ${evt.message}`, codeBlockHandlers);
          chatBody.append(errorBubble.element);
        } else if (evt.type === "tool-result") {
          const label = evt.ok ? "✓" : "✗";
          const toolBubble = createChatBubble(
            "system",
            `${label} ${evt.call.name}\n\`\`\`\n${evt.output.slice(0, 2000)}\n\`\`\``,
            codeBlockHandlers,
          );
          chatBody.append(toolBubble.element);
          scrollToBottom();
        } else if (evt.type === "tool-rejected") {
          const toolBubble = createChatBubble("system", `Rejected: ${evt.call.name}`, codeBlockHandlers);
          chatBody.append(toolBubble.element);
        }
      },
      requestApproval,
    });

    conversation.messages.push(...result.messages.slice(baseMessageCount));
    if (result.alwaysAllowedTools.length !== config.alwaysAllowedTools.length) {
      updateConfig({ alwaysAllowedTools: result.alwaysAllowedTools });
    }
    conversation.updatedAt = Date.now();
    if (conversation.title === "New Chat" && text.length > 0) {
      conversation.title = text.slice(0, 48);
    }
    if (getConfig().autoSave) saveConversation(conversation);
  }

  function renderHistoryPanel() {
    clear(historyPanel);
    const searchInput = el("input", { type: "text", placeholder: "Search conversations..." });
    const importBtn = el("button", { className: "ag-ghost" }, ["Import"]);
    const list = el("div", { style: "display:flex;flex-direction:column;gap:8px;margin-top:10px" });

    function renderList(items: Conversation[]) {
      clear(list);
      for (const item of items) {
        const openBtn = el("div", { className: "ag-history-item" }, [
          el("div", { className: "ag-history-title" }, [item.pinned ? `📌 ${item.title}` : item.title]),
          el("div", { className: "ag-history-meta" }, [
            `${item.messages.length} messages`,
            new Date(item.updatedAt).toLocaleString(),
          ]),
        ]);
        openBtn.addEventListener("click", () => {
          conversation = item;
          renderConversation();
          historyPanel.style.display = "none";
          chatBody.style.display = "flex";
        });

        const pinBtn = el("button", { className: "ag-ghost" }, [item.pinned ? "Unpin" : "Pin"]);
        pinBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          item.pinned = !item.pinned;
          saveConversation(item);
          renderList(listConversations());
        });

        const renameBtn = el("button", { className: "ag-ghost" }, ["Rename"]);
        renameBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const next = window.prompt("Rename conversation", item.title);
          if (next) {
            item.title = next;
            saveConversation(item);
            renderList(listConversations());
          }
        });

        const exportBtn = el("button", { className: "ag-ghost" }, ["Export"]);
        exportBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const json = exportConversation(item.id);
          if (json) navigator.clipboard?.writeText(json).catch(() => undefined);
          acode.pushNotification?.("Antigravity Code", "Conversation JSON copied to clipboard.");
        });

        const deleteBtn = el("button", { className: "ag-danger" }, ["Delete"]);
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          deleteConversation(item.id);
          renderList(listConversations());
        });

        const actions = el("div", { style: "display:flex;gap:6px;margin-top:6px;flex-wrap:wrap" }, [
          pinBtn,
          renameBtn,
          exportBtn,
          deleteBtn,
        ]);
        openBtn.append(actions);
        list.append(openBtn);
      }
    }

    searchInput.addEventListener("input", () => {
      renderList(searchConversations((searchInput as HTMLInputElement).value));
    });
    importBtn.addEventListener("click", () => {
      const json = window.prompt("Paste exported conversation JSON");
      if (!json) return;
      try {
        importConversation(json);
        renderList(listConversations());
      } catch {
        acode.pushNotification?.("Antigravity Code", "Invalid conversation JSON.");
      }
    });

    historyPanel.append(el("div", { style: "display:flex;gap:8px" }, [searchInput, importBtn]), list);
    renderList(listConversations());
  }

  function toggleHistory() {
    const showingHistory = historyPanel.style.display !== "none";
    if (showingHistory) {
      historyPanel.style.display = "none";
      chatBody.style.display = "flex";
    } else {
      renderHistoryPanel();
      historyPanel.style.display = "flex";
      chatBody.style.display = "none";
    }
  }

  const newChatBtn = el("button", { className: "ag-ghost" }, ["New Chat"]);
  newChatBtn.addEventListener("click", () => {
    conversation = createConversation();
    saveConversation(conversation);
    renderConversation();
  });

  const historyBtn = el("button", { className: "ag-ghost" }, ["History"]);
  historyBtn.addEventListener("click", toggleHistory);

  const settingsBtn = el("button", { className: "ag-ghost" }, ["⚙"]);
  settingsBtn.addEventListener("click", openSettings);

  const topBar = el("div", { className: "ag-chat-topbar" }, [
    el("div", { className: "ag-brand" }, [createLogoMark(24), el("span", { className: "ag-brand-title" }, ["Antigravity"])]),
    newChatBtn,
    historyBtn,
    el("span", { className: "ag-spacer" }),
    modelBadgeSlot,
    settingsBtn,
  ]);

  const attachBtn = el("button", {}, ["Attach"]);
  attachBtn.addEventListener("click", async () => {
    try {
      const fileBrowser = acode.require("fileBrowser");
      const file = await fileBrowser("file", "Attach a file");
      contextItems.push(await collectMentionedFile(file.url));
      renderContextChips();
    } catch {
      /* user cancelled */
    }
  });

  const mentionFileBtn = el("button", {}, ["Mention File"]);
  mentionFileBtn.addEventListener("click", () => attachBtn.click());

  const mentionFolderBtn = el("button", {}, ["Mention Folder"]);
  mentionFolderBtn.addEventListener("click", async () => {
    try {
      const fileBrowser = acode.require("fileBrowser");
      const folder = await fileBrowser("folder", "Mention a folder");
      contextItems.push(await collectMentionedFolder(folder.url));
      renderContextChips();
    } catch {
      /* user cancelled */
    }
  });

  const addCurrentFileBtn = el("button", {}, ["Add Current File"]);
  addCurrentFileBtn.addEventListener("click", () => {
    const item = collectCurrentFile();
    if (item) {
      contextItems.push(item);
      renderContextChips();
    } else {
      acode.pushNotification?.("Antigravity Code", "No file is currently open.");
    }
  });

  const addSelectionBtn = el("button", {}, ["Add Selection"]);
  addSelectionBtn.addEventListener("click", () => {
    const item = collectSelection();
    if (item) {
      contextItems.push(item);
      renderContextChips();
    } else {
      acode.pushNotification?.("Antigravity Code", "No text is selected.");
    }
  });

  const clearContextBtn = el("button", {}, ["Clear Context"]);
  clearContextBtn.addEventListener("click", () => {
    contextItems = [];
    renderContextChips();
  });

  const quickActionsRow = createQuickActionsRow((action) => {
    const prompts: Record<string, string> = {
      explain: "Explain what the attached code/current file does.",
      refactor: "Refactor the attached code/current file for clarity and maintainability.",
      "fix-bug": "Find and fix bugs in the attached code/current file.",
      "generate-tests": "Generate unit tests for the attached code/current file.",
      document: "Add documentation comments to the attached code/current file.",
      review: "Review the attached code/current file and list issues.",
      optimize: "Optimize the attached code/current file for performance.",
      "ask-ai": "",
      "generate-readme": "Generate a README for this project based on the attached context.",
      "generate-comments": "Add helpful inline comments to the attached code/current file.",
    };
    const item = collectCurrentFile();
    if (item && !contextItems.some((c) => c.id === item.id)) contextItems.push(item);
    renderContextChips();
    const promptText = prompts[action.id];
    if (promptText) {
      textarea.value = promptText;
      textarea.focus();
    } else {
      textarea.focus();
    }
  });

  const sendBtn = el("button", { className: "ag-primary ag-send-btn" }, ["➤"]);
  sendBtn.addEventListener("click", async () => {
    const value = textarea.value;
    textarea.value = "";
    await sendMessage(value);
  });
  textarea.addEventListener("keydown", (e) => {
    const evt = e as KeyboardEvent;
    if (evt.key === "Enter" && !evt.shiftKey) {
      evt.preventDefault();
      sendBtn.click();
    }
  });

  const inputBar = el("div", { className: "ag-input-bar" }, [
    quickActionsRow,
    el("div", { className: "ag-input-actions" }, [
      attachBtn,
      mentionFileBtn,
      mentionFolderBtn,
      addCurrentFileBtn,
      addSelectionBtn,
      clearContextBtn,
    ]),
    contextChipsRow,
    el("div", { className: "ag-input-row" }, [textarea, sendBtn]),
  ]);

  const root = el("div", { className: "antigravity ag-chat" }, [topBar, chatBody, historyPanel, inputBar]);

  page.appendBody(el("link", { rel: "stylesheet", href: `${baseUrl}media/css/theme.css` }), el("link", { rel: "stylesheet", href: `${baseUrl}media/css/chat.css` }), root);

  refreshModelBadge();
  renderConversation();
  renderContextChips();

  page.on("show", refreshModelBadge);

  return page;
}
