# Deployment Guide — Antigravity Code

## Can this be deployed on Render?

**Yes.** An Acode plugin is just a static zip file (`dist.zip`) that Acode downloads from a URL — there's no server-side logic to run. That makes it a perfect fit for Render's **Static Site** service (which has a free tier), rather than a Web Service. Render will build the project and host the `build/` folder (which contains `dist.zip`, `plugin.json`, etc.) as plain static files.

This gets you a stable public URL (e.g. `https://antigravity-code.onrender.com/dist.zip`) you can point Acode at directly — no need to keep your computer's dev server running or manually copy the zip to your phone every time you make a change.

## 1. Push the project to a Git repository

Render deploys from GitHub/GitLab. If you haven't already:

```bash
cd antigravity-code
git init
git add .
git commit -m "Initial commit"
```

Create a repo on GitHub and push:

```bash
git remote add origin https://github.com/<your-username>/antigravity-code.git
git branch -M main
git push -u origin main
```

## 2. Create the Static Site on Render

1. Go to https://dashboard.render.com and sign in.
2. Click **New +** → **Static Site**.
3. Connect your GitHub account and select the `antigravity-code` repository.
4. Configure the build:
   | Field | Value |
   |---|---|
   | **Build Command** | `npm install && npm run build` |
   | **Publish Directory** | `build` |
5. Click **Create Static Site**.

Render will run the build and, once done, give you a URL like:

```
https://antigravity-code.onrender.com
```

Your plugin zip is then reachable at:

```
https://antigravity-code.onrender.com/dist.zip
```

## 3. Verify the deployment

```bash
curl -I https://antigravity-code.onrender.com/dist.zip
curl -I https://antigravity-code.onrender.com/plugin.json
```

Both should return `200 OK`. You can also open the `dist.zip` URL in a browser to confirm it downloads.

## 4. Install the deployed plugin inside the Acode app

1. Open **Acode** on your Android device.
2. Go to **Settings → Plugins**.
3. Tap the **+** icon (top right).
4. Choose **Remote**.
5. Enter your Render URL to the zip, e.g.:
   ```
   https://antigravity-code.onrender.com/dist.zip
   ```
6. Tap install/confirm. Acode downloads and installs the plugin.
7. Open it via the sidebar icon or the command palette (search "Antigravity Code: Open Chat").

### Alternative: Local install (no hosting needed)

If you don't want to deploy anywhere, you can install directly from a zip on-device:

1. Run `npm run build` locally — this produces `build/dist.zip`.
2. Transfer `build/dist.zip` to your Android device (USB, cloud storage, email, etc.).
3. In Acode: **Settings → Plugins → + → Local**, then browse to and select the zip file.

## 5. Updating the plugin after changes

Every push to your connected branch triggers a new Render build automatically (auto-deploy is on by default). Once it finishes:

1. In Acode, go to **Settings → Plugins**.
2. Find **Antigravity Code** in your installed plugins list.
3. Use the update/reload action (or remove and reinstall via the same Remote URL) to fetch the latest `dist.zip`.

Because the URL never changes, you only need to enter it once — future updates just require re-fetching from Acode.

### In-app update notifications

The plugin checks `https://antigravity-code.onrender.com/version.json` (built into `build/` alongside `dist.zip`) on every startup and shows an "Update Available" notification if the hosted version is newer than the installed one, plus a **Check for Updates** / **Release Notes** section in Settings → About. Acode has no documented API for a plugin to reinstall itself, so **Update Now** opens the zip download and then tells the user to finish via Acode's own plugin manager (Remote reinstall or Local pick) — it can't silently replace itself in place.

**Every release, bump the version in three places** so the update check and the notification text stay accurate:

1. `package.json` → `"version"` (this is what gets baked into the running plugin via webpack's `DefinePlugin`, i.e. what users are considered to "have").
2. `plugin.json` → `"version"` (what Acode's plugin manager itself tracks).
3. `version.json` → `"version"` + `"changelog"` (what the update checker fetches to decide if a newer release exists, and what's shown in Release Notes).

If these drift out of sync, the update check will compare against the wrong "installed" baseline.

## 6. Notes and caveats

- **Free tier spin-down**: Render's free Static Site tier does not spin down like free Web Services do (static sites are just CDN-served files), so the URL stays responsive without a "cold start" delay.
- **Custom domain (optional)**: Render lets you attach a custom domain to the static site under its dashboard if you'd rather use e.g. `plugin.yourdomain.com/dist.zip`.
- **No secrets involved**: nothing in the built output contains API keys — those are entered by each user on their own device and stored locally (see `readme.md` for details on that model). It's safe for the built `dist.zip` to be publicly hosted.
- **Cache busting**: if Acode or your browser caches the old zip, append a query string when testing, e.g. `https://antigravity-code.onrender.com/dist.zip?v=2`, though Acode's own reinstall/update flow typically fetches fresh.
