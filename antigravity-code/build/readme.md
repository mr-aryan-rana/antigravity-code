# Antigravity Code

A Claude Code / Cursor style AI coding assistant built into [Acode](https://acode.app) for Android — streaming chat, an agentic tool system with explicit approval, diff-based file editing, and support for NVIDIA NIM plus every major OpenAI-compatible and native LLM API.

## Features

- **First-run setup wizard** — pick a provider, model, and API key in under a minute. NVIDIA NIM is the default.
- **Streaming chat** with Markdown rendering, syntax-highlighted code blocks, and per-block actions (Copy / Insert / Replace Selection / Create File / Save As / Preview Diff).
- **Multi-provider support**: NVIDIA NIM, OpenAI, Anthropic, Gemini, Ollama, LM Studio, OpenRouter, Together AI, Groq, Mistral, DeepSeek, or any OpenAI-compatible endpoint.
- **Agent mode** — the assistant can propose tool calls (read/write files, search the workspace, inspect git, etc.). **Nothing runs without your approval.** Every tool call shows exactly what it will do before it executes.
- **Diff-first editing** — AI-suggested changes are never applied silently. You always see a diff and choose Accept / Reject / Replace / Insert Below / Create New File / Undo.
- **Conversation management** — unlimited conversations, rename, delete, search, pin, export/import, auto-save.
- **Quick actions** — Explain, Refactor, Fix Bug, Generate Tests, Document, Review, Optimize, Ask AI, Generate README, Generate Comments — available from Acode's command palette and from the chat panel's quick-action row, operating on your current file or selection.

## On security & storage

Acode's plugin platform does not expose a hardware-backed secure-storage API (no Android Keystore bridge). API keys are kept in the extension's own namespaced local storage on-device, are never written into project files or chat exports, and never logged. If you need stronger guarantees, avoid the "remember API key" option and re-enter your key each session.

## What's stubbed for now

MCP (Model Context Protocol), voice input, image/PDF understanding, repository indexing/embeddings/RAG, and third-party integrations (GitHub, Figma, Playwright, Docker) are **not implemented**. The codebase has clearly marked extension points (`// TODO(extension-point)`) for wiring these in later — there is no UI that pretends they already work.

## Development

```bash
npm install
npm run dev     # live-reload dev server + dist.zip at http://localhost:3000/dist.zip
npm run build   # production dist.zip
```

Install in Acode via Settings → Plugins → "+" → Remote (dev server URL) or Local (dist.zip).

## Architecture

See `src/` — `providers/` (one adapter per API family behind a shared `ChatProvider` interface), `tools/` + `agent/` (tool registry and approval-gated agent loop), `ui/` (views built on Acode's `page` API and reusable components), `storage/` (pluggable config/conversation persistence).
