Antigravity Code — Complete Acode AI Assistant Extension Development Prompt

Objective

Create a production-quality Acode extension named Antigravity Code that transforms Acode into a Claude Code/Codex-style AI coding assistant for Android.

The extension should feel native, modern, fast, and premium while supporting agentic AI workflows using NVIDIA NIM by default and any OpenAI-compatible API.

---

Primary Goals

- Claude Code style interface
- Beautiful dark UI
- Streaming AI responses
- Agentic coding assistant
- Multiple AI providers
- Project-aware coding
- File editing with approval
- Mobile-friendly UI
- Optimized for Android
- Fast performance
- Offline-friendly architecture where possible

---

Extension Name

Antigravity Code

---

Target Platform

Acode Editor (Android)

Use the official Acode Extension API.

---

Theme

Premium dark interface inspired by:

- Claude Code
- Cursor
- VS Code
- Codex

Use:

- Glassmorphism
- Rounded corners
- Blur effects
- Smooth animations
- Material icons
- Modern typography
- Mobile responsive layout

---

First Launch Experience

When the extension is opened for the first time, do not open the chat.

Instead, display a beautiful setup wizard.

Title:

Welcome to Antigravity Code

Subtitle:

"Let's connect your AI model."

Fields:

Provider

Dropdown:

- NVIDIA NIM (Default)
- OpenAI
- Gemini
- Anthropic
- Ollama
- OpenAI Compatible

Model Name

Example:

"meta/llama-3.3-70b-instruct"

API Key

Password field with show/hide button.

Endpoint

Automatically changes depending on provider.

Defaults:

NVIDIA

"https://integrate.api.nvidia.com/v1"

OpenAI

"https://api.openai.com/v1"

Anthropic

Official endpoint

Gemini

Official endpoint

Ollama

"http://localhost:11434/v1"

Custom

Editable field

Checkbox

Remember API Key Securely

Buttons

Continue

Skip

Learn More

---

Configuration

Store

- Provider
- Model
- Endpoint
- Temperature
- Max Tokens
- System Prompt

Store API key securely using the best secure storage available for Acode plugins. Never expose the API key in project files or chat logs.

---

Chat UI

Claude-style layout.

Top Bar

- New Chat
- Chat History
- Current Model
- Settings

Conversation Area

User bubbles

Assistant bubbles

Markdown rendering

Streaming text

Syntax highlighting

Tables

Lists

Links

Images (future ready)

Mermaid support (future ready)

Code blocks

Each code block contains:

- Copy
- Insert
- Replace Selection
- Create File
- Save as File
- Preview Diff

Bottom Input

Prompt textbox

Buttons:

Attach File

Mention File

Mention Folder

Add Current File

Add Selection

Clear Context

Voice (future)

Send

---

Conversation Features

Support

Unlimited conversations

Rename

Delete

Search

Pin

Export

Import

Auto save

Conversation memory

---

Streaming

Never wait for the entire response.

Display tokens as they arrive.

Support streaming for:

- NVIDIA
- OpenAI
- Gemini
- Anthropic
- OpenAI-compatible APIs

---

AI Providers

Support:

NVIDIA NIM

OpenAI

Anthropic

Gemini

Ollama

LM Studio

OpenRouter

Together AI

Groq

Mistral

DeepSeek

Any OpenAI-compatible endpoint

Create a provider interface so new providers can be added without changing the rest of the extension.

---

Agent Mode

Implement Claude Code-like agent behavior.

The AI may request tools.

Never execute tools automatically.

Always request user approval.

Approval card example:

Run Command?

"npm install"

Buttons:

Allow Once

Always Allow

Reject

---

Available Tools

Read File

Write File

Edit File

Replace Text

Append Text

Create File

Delete File

Rename File

Move File

Create Folder

Delete Folder

List Directory

Search Files

Search Text

Workspace Search

Run Terminal Command (only if Acode supports terminal integration)

Git Status

Git Diff

Git Log

Open File

Show Diagnostics (if supported)

Project Tree

Current Cursor Position

Selected Text

Current File

Entire Workspace Context

---

Context Collection

Allow adding:

Current file

Current selection

Multiple files

Entire folder

Workspace

Referenced files

Recently opened files

Conversation history

---

Editing Workflow

AI suggests changes.

Show a diff preview.

Buttons:

Accept

Reject

Copy

Replace

Insert Below

Create New File

Undo

Never overwrite files silently.

---

File Explorer Integration

Right-click or long-press actions:

Explain

Refactor

Fix Bug

Generate Tests

Document

Review

Optimize

Ask AI

Generate README

Generate Comments

---

Mobile Optimizations

Large touch targets

Smooth scrolling

Keyboard-safe layout

Responsive UI

Low memory usage

Lazy loading

Fast startup

---

Markdown

Support:

Headers

Lists

Tables

Blockquotes

Inline code

Code fences

Task lists

Links

Images

Syntax highlighting

---

Syntax Highlighting

Support major languages:

JavaScript

TypeScript

Python

Java

C

C++

Go

Rust

PHP

HTML

CSS

JSON

YAML

SQL

Shell

Markdown

---

Settings Screen

Provider

Model

API Key

Endpoint

Temperature

Top P

Max Tokens

System Prompt

Theme

Streaming

Agent Mode

Auto Save

Chat History

Clear Cache

Reset Extension

---

Security

Never execute commands without permission.

Never edit files without permission.

Never expose API keys.

Validate every tool request.

Display exactly what the AI wants to do.

---

Error Handling

Friendly errors.

Retry button.

Reconnect button.

Offline detection.

Streaming timeout recovery.

Graceful API failures.

---

Performance

Lazy UI rendering

Virtualized chat

Efficient Markdown rendering

Debounced search

Minimal memory usage

Fast startup

---

Architecture

Create a modular codebase.

Suggested structure:

src/

commands/

providers/

agent/

tools/

services/

storage/

ui/

components/

views/

utils/

types/

media/

css/

js/

icons/

---

Code Quality

Use modern JavaScript or TypeScript.

Keep modules small.

Avoid duplicate code.

Use async/await.

Include comments where appropriate.

Follow clean architecture principles.

---

Future Ready

Design the architecture to easily support:

MCP (Model Context Protocol)

Voice chat

Image understanding

PDF analysis

Repository indexing

Vector search

Embeddings

RAG

GitHub integration

Figma integration

Playwright

Docker

Remote agents

Multiple concurrent agents

Local models

Cloud models

---

Deliverables

Produce a complete, production-ready Acode extension that:

- Installs without errors.
- Opens a first-run setup wizard.
- Securely stores API configuration.
- Supports NVIDIA NIM and OpenAI-compatible APIs.
- Provides a Claude Code-like streaming chat experience.
- Implements agentic tools with explicit user approval.
- Supports project-aware AI assistance and safe code application.
- Is modular, maintainable, performant, and optimized for Android.
- Is thoroughly documented and ready for future feature expansion.