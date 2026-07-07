# Start Guide — Antigravity Code

You've installed the plugin. Here's how to start using it.

## 1. Open the plugin

Pick whichever is fastest for you:

- **Sidebar icon**: look for the **Antigravity Code** icon in Acode's left sidebar (the strip of icons along the edge) and tap it, then tap **Open Antigravity Code**.
- **Command palette**: open Acode's command palette and search for **"Antigravity Code: Open Chat"**.

If the sidebar icon isn't visible on your Acode version, the command palette always works.

## 2. First time opening it — the setup wizard

The first tap opens the **setup wizard**, not the chat. Fill in:

1. **Provider** — leave as **NVIDIA NIM (Default)** unless you already have a key for something else (OpenAI, Anthropic, Gemini, Groq, etc.).
2. **Model Name** — a placeholder example is shown per provider (e.g. `meta/llama-3.3-70b-instruct` for NVIDIA NIM). You can use the placeholder as-is or enter a different model the provider supports.
3. **Endpoint** — auto-filled for most providers; only editable for Ollama, LM Studio, and "OpenAI Compatible".
4. **API Key** — paste your key (get one from the provider's website — see the table in `setup.md` for links). Tap **Show/Hide** to check what you typed.
5. **Remember API Key Securely** — leave checked to keep it saved on this device between sessions.
6. Tap **Continue**.

Don't have a key yet? Tap **Skip** — you'll land in the chat UI and can configure everything later from the ⚙ settings icon.

## 3. Send your first message

You're now in the chat screen:

- Type in the message box at the bottom and tap **➤** (or press Enter).
- Responses stream in as they're generated, with syntax-highlighted code blocks.
- Each code block has buttons: **Copy**, **Insert**, **Replace**, **New File**, **Save As**, **Diff** — these act on your currently open editor file.

## 4. Give it context about your code

Above the message box:

- **Add Current File** — attaches the file you have open in the editor.
- **Add Selection** — attaches just the text you've selected.
- **Mention File** / **Mention Folder** — browse and attach any file/folder from your project.
- **Clear Context** — removes everything you've attached before sending the next message.

Attached items show up as small chips above the input box — tap the ✕ on a chip to remove just that one.

## 5. Quick actions

The row of buttons above the input (Explain, Refactor, Fix Bug, Generate Tests, Document, Review, Optimize, Ask AI, Generate README, Generate Comments) auto-attaches your current file and drops in a ready-made prompt — tap one, then tap send.

These same actions are also searchable individually in Acode's command palette (e.g. "Antigravity Code: Explain").

## 6. Agent mode — approving actions

If **Agent Mode** is on (default), the assistant can propose actions like reading/writing a file or searching your project. Before anything runs, you'll see an **approval card** showing exactly what it wants to do:

- **Allow Once** — run just this one time.
- **Always Allow** — stop asking for this specific action type for the rest of the session.
- **Reject** — don't run it.

File edits always show a **diff preview** (Accept / Reject / Replace / Insert Below / Create New File) first — nothing overwrites your files silently.

## 7. Managing conversations

Tap **History** in the top bar to:

- Start a **New Chat**.
- Search past conversations.
- **Pin**, **Rename**, **Export** (copies JSON to clipboard), or **Delete** any conversation.
- **Import** a previously exported conversation by pasting its JSON.

## 8. Changing settings later

Tap the **⚙** icon in the chat top bar any time to change provider, model, API key, endpoint, temperature, top P, max tokens, system prompt, or toggle streaming/agent mode/auto-save — or to **Clear Cache** / **Reset Extension**.

## Troubleshooting

- **Nothing happens when I tap the icon**: check Acode's console/logs for `[Antigravity Code]` messages — plugin init logs each step (`Initializing... / Registering commands... / Loading sidebar... / Done.`) so you can see where it stopped.
- **"Provider request failed" error**: recheck your API key, endpoint, and model name in Settings.
- **Wizard shows again after Skip**: make sure you tapped Continue at least once, or configure a provider from Settings — Skip alone marks onboarding done but doesn't save a real provider config.
