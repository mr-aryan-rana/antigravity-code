# Setup Guide — Antigravity Code

## 1. Prerequisites

- Node.js 18+ and npm installed on your computer.
- The [Acode](https://acode.app) app installed on your Android device.
- Your computer and Android device on the same Wi-Fi network (only needed for live-reload development).

## 2. Install dependencies

```bash
cd antigravity-code
npm install
```

## 3. Build the plugin

**Development (live-reload):**

```bash
npm run dev
```

This starts a local server (default `http://localhost:3000`) and serves `dist.zip`, rebuilding on every file change.

**Production build:**

```bash
npm run build
```

This produces an optimized `dist.zip` in the project root, ready to install or publish.

## 4. Install the plugin in Acode

1. Open Acode on your Android device.
2. Go to **Settings → Plugins**.
3. Tap the **+** icon in the top right.
4. Choose one:
   - **Remote**: enter your computer's local server URL, e.g. `http://192.168.1.10:3000/dist.zip` (only works with `npm run dev`, device and computer on the same network).
   - **Local**: browse to and select the `dist.zip` file (works with either `npm run dev` or `npm run build` output — transfer the file to your device first).
5. Acode installs the plugin. Look for **Antigravity Code** in the sidebar or the command palette.

During development, after each rebuild, use the **Reload** button in the Extensions tab in Acode to pick up changes without reinstalling.

## 5. First launch

The first time you open Antigravity Code (sidebar icon or command palette → "Antigravity Code: Open Chat"), the **setup wizard** appears:

1. Pick a **Provider** (NVIDIA NIM is the default).
2. Enter a **Model Name** (a placeholder example is shown per provider).
3. Confirm or edit the **Endpoint** (auto-filled for most providers; editable for Ollama, LM Studio, and "OpenAI Compatible").
4. Paste your **API Key** (not required for local providers like Ollama/LM Studio).
5. Leave **Remember API Key Securely** checked to persist it on-device, or uncheck it to re-enter each session.
6. Tap **Continue** to save and open the chat, or **Skip** to explore first and configure later from Settings.

You can revisit all of this any time via the settings (gear) icon in the chat top bar.

## 6. Getting an API key

| Provider | Where to get a key |
|---|---|
| NVIDIA NIM | https://build.nvidia.com (free tier available) |
| OpenAI | https://platform.openai.com/api-keys |
| Anthropic | https://console.anthropic.com/settings/keys |
| Gemini | https://aistudio.google.com/apikey |
| OpenRouter | https://openrouter.ai/keys |
| Together AI | https://api.together.ai/settings/api-keys |
| Groq | https://console.groq.com/keys |
| Mistral | https://console.mistral.ai/api-keys |
| DeepSeek | https://platform.deepseek.com/api_keys |
| Ollama / LM Studio | No key needed — run the server locally and point the endpoint at it (e.g. `http://localhost:11434/v1`). On a physical Android device, "localhost" means the device itself, so you'll need to run Ollama/LM Studio somewhere reachable from the phone (e.g. your computer's LAN IP) and edit the endpoint accordingly. |

## 7. Using agent mode safely

Agent Mode is on by default (toggle it off in Settings if you only want plain chat). When the assistant wants to run a tool (read/write a file, search the workspace, run a command, etc.) you'll see an **approval card** before anything happens:

- **Allow Once** — run this specific call, ask again next time.
- **Always Allow** — stop asking for this tool for the rest of the session.
- **Reject** — don't run it; the assistant is told you declined.

File edits always go through a diff preview (Accept/Reject/Replace/Insert Below/Create New File) — nothing is overwritten silently.

## 8. Troubleshooting

- **Plugin fails to load / blank screen**: reopen Acode's Extensions tab and check the console log for errors; re-run `npm run build` and reinstall.
- **"Provider request failed" errors**: double-check the endpoint and API key in Settings, and that the model name matches what the provider expects.
- **Git/Terminal tools report "not available"**: these require a separate terminal-capable plugin installed in Acode — Antigravity Code detects it automatically if present.
- **Streaming stalls**: check your network connection; use the Retry option if shown, or start a New Chat.
