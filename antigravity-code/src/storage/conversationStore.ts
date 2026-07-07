import { Conversation } from "../types/conversation";
import { getJSON, setJSON, storageBackend } from "./StorageService";

const INDEX_KEY = "conversations:index";
const conversationKey = (id: string) => `conversations:item:${id}`;

export function listConversations(): Conversation[] {
  const ids = getJSON<string[]>(INDEX_KEY, []);
  return ids
    .map((id) => getJSON<Conversation | null>(conversationKey(id), null))
    .filter((c): c is Conversation => c !== null)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updatedAt - a.updatedAt);
}

export function getConversation(id: string): Conversation | null {
  return getJSON<Conversation | null>(conversationKey(id), null);
}

export function saveConversation(conversation: Conversation): void {
  setJSON(conversationKey(conversation.id), conversation);
  const ids = getJSON<string[]>(INDEX_KEY, []);
  if (!ids.includes(conversation.id)) {
    ids.push(conversation.id);
    setJSON(INDEX_KEY, ids);
  }
}

export function deleteConversation(id: string): void {
  storageBackend.remove(conversationKey(id));
  const ids = getJSON<string[]>(INDEX_KEY, []).filter((existing) => existing !== id);
  setJSON(INDEX_KEY, ids);
}

export function searchConversations(query: string): Conversation[] {
  const q = query.trim().toLowerCase();
  if (!q) return listConversations();
  return listConversations().filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.messages.some((m) => m.content.toLowerCase().includes(q)),
  );
}

export function exportConversation(id: string): string | null {
  const conversation = getConversation(id);
  return conversation ? JSON.stringify(conversation, null, 2) : null;
}

export function importConversation(json: string): Conversation {
  const parsed = JSON.parse(json) as Conversation;
  saveConversation(parsed);
  return parsed;
}

export function createConversation(title = "New Chat"): Conversation {
  const now = Date.now();
  const conversation: Conversation = {
    id: `conv_${now}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    createdAt: now,
    updatedAt: now,
    pinned: false,
    messages: [],
  };
  saveConversation(conversation);
  return conversation;
}
