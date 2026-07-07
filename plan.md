Based on everything you've shared (Render logs, plugin.json, webpack.config.js, main.ts, and the runtime error), here's a consolidated checklist of likely issues and fixes.


---

1. Runtime Error: Cannot read properties of undefined (reading 'addCommand')

Cause

This is not caused by Render or Webpack. It's most likely coming from:

src/commands/quickActionCommands.ts

where you're calling something like:

const commands = acode.require("commands");
commands.addCommand(...);

If commands is undefined, addCommand throws exactly this error.

Fix

Check what acode.require(...) returns before using it.

Guard against missing APIs:


const commands = acode.require("commands");

if (!commands || typeof commands.addCommand !== "function") {
  console.error("Commands API not available");
  return;
}

commands.addCommand(...);


---

2. Acode Version Compatibility

Your plugin requires:

"minVersionCode": 292

Fix

Verify your installed Acode version meets or exceeds 292.

If you want to support older versions, lower minVersionCode only after confirming the APIs you use are available there.



---

3. acode.require() Safety

Current code:

const sidebarApps = acode.require("sidebarApps");

If the module doesn't exist, it may return undefined.

Fix

Always guard it:

const sidebarApps = acode.require("sidebarApps");

if (sidebarApps) {
   // use it
}

Do this for:

sidebarApps

actionStack

commands

editorManager

fileBrowser

any other required module



---

4. Plugin Initialization

Current:

acode.setPluginInit(...)

If anything throws inside initialization, the plugin fails to load.

Fix

Wrap the whole initialization:

acode.setPluginInit(id, (baseUrl) => {
   try {
      // initialization
   } catch (err) {
      console.error(err);
      acode.alert("Plugin Error", String(err));
   }
});


---

5. Webpack Output

Current:

build/dist/main.js

Current plugin.json:

"main": "dist/main.js"

Status

✅ Correct.

No change needed.


---

6. Render Configuration

Correct values:

Root Directory

antigravity-code

Build Command

npm install && npm run build

Publish Directory

build

No changes needed.


---

7. Plugin ZIP Structure

Your ZIP should contain:

dist.zip
│
├── plugin.json
├── icon.png
├── readme.md
├── changelogs.md
└── dist/
    ├── main.js
    └── media/

If not, update your ZIP configuration.


---

8. Command Registration

Never assume APIs exist.

Bad:

commands.addCommand(...)

Good:

if (commands?.addCommand) {
    commands.addCommand(...)
}


---

9. Sidebar Registration

Instead of:

sidebarApps.add(...)

Use:

if (sidebarApps?.add) {
    sidebarApps.add(...)
}


---

10. Action Stack

Instead of:

actionStack.push(...)

Use:

if (actionStack?.push) {
    actionStack.push(...)
}


---

11. DOM Safety

Before:

document.body.append(page);

Check:

if (page instanceof HTMLElement) {
    document.body.append(page);
}


---

12. API Storage

Don't save API keys in plain local storage.

Store:

Provider

Model

Endpoint


Securely store:

API Key



---

13. Logging

Add logs around every initialization step:

console.log("Initializing...");
console.log("Registering commands...");
console.log("Loading sidebar...");
console.log("Done");

This makes it much easier to pinpoint failures.


---

14. Main Suspect

The error you're seeing:

Cannot read properties of undefined (reading 'addCommand')

is most likely in:

src/commands/quickActionCommands.ts

That is the first place I'd inspect.


---

15. Final Checklist

Verify quickActionCommands.ts uses the Acode command API correctly.

Add null checks for every acode.require(...).

Wrap setPluginInit() in try/catch.

Log each initialization step.

Confirm the ZIP contains dist/main.js matching plugin.json.

Keep Render settings as:

Root Directory: antigravity-code

Build Command: npm install && npm run build

Publish Directory: build




---

Recommendation

The next step is to inspect and fix src/commands/quickActionCommands.ts. Based on the runtime error, that's the most probable source of the crash. Once that file is corrected, the plugin should load successfully.