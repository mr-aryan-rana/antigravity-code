# Changelog

## 0.1.2

- Fixed the setup wizard/settings "popup" rendering as a small transparent overlay with editor content bleeding through instead of a proper full-screen modal. It's now an opaque, centered, internally-scrollable card over a dimmed/blurred backdrop at a guaranteed top z-index (same treatment applied to the chat page).
- Fixed a duplicate "API Key" label, replaced the Show/Hide text button with a properly-sized eye-icon toggle matching input height, fixed checkbox alignment/touch-target size, and added required-field indicators.
- Continue/Save is now a full-width primary action on its own row, with secondary actions below; buttons stack vertically on very narrow screens.
- All stylesheets are now preloaded into `<head>` at plugin init instead of injected per-page at open time, removing an unstyled-flash-on-first-open race.

## 0.1.1

- Fixed the plugin having no visible way to open it after install: the sidebar icon used an invalid icon class, UI was mounted to `document.body` instead of Acode's actual app root (invisible behind Acode's own shell), and command registration relied solely on a module that isn't always present.
- Added a guaranteed floating launch button (independent of the sidebar/command palette), a real Material Icons sidebar icon, and command registration via both Ace's editor command manager and the `commands` module.
- Added a proper logo/icon and general UI polish (branding, button/input states, bubble shadows, pill-style input bar).
- Added in-app update checking (Settings → About: Check for Updates / Update Now / Release Notes, plus a startup notification).

## 0.1.0

- Initial release: setup wizard, streaming chat, NVIDIA NIM / OpenAI-compatible / Anthropic / Gemini providers, agent tool system with approval, diff preview, conversation management, quick-action commands.
