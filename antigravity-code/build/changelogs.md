# Changelog

## 0.1.1

- Fixed the plugin having no visible way to open it after install: the sidebar icon used an invalid icon class, UI was mounted to `document.body` instead of Acode's actual app root (invisible behind Acode's own shell), and command registration relied solely on a module that isn't always present.
- Added a guaranteed floating launch button (independent of the sidebar/command palette), a real Material Icons sidebar icon, and command registration via both Ace's editor command manager and the `commands` module.
- Added a proper logo/icon and general UI polish (branding, button/input states, bubble shadows, pill-style input bar).
- Added in-app update checking (Settings → About: Check for Updates / Update Now / Release Notes, plus a startup notification).

## 0.1.0

- Initial release: setup wizard, streaming chat, NVIDIA NIM / OpenAI-compatible / Anthropic / Gemini providers, agent tool system with approval, diff preview, conversation management, quick-action commands.
