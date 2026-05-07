# EMMA Academy — Project Notes

Static web app for the EMMA 2026 judges' training program (Position / Focus /
Sound Stage scoring simulators + Tonal Accuracy module). All logic lives in a
single self-contained HTML file plus JSON data and WAV audio.

## Repository

- Remote: `https://github.com/AUDIOXPLUS/emma-academy`
- Default branch: `master`
- The `master` branch is the production branch (every push deploys live, see below).

## Architecture

Pure client-side, no backend:

| File | Role |
|---|---|
| `emma_academy.html` | Single-page application (everything: UI, audio engine, scoring logic, calibration tools) |
| `index.html` | Tiny redirect to `emma_academy.html` so the bare URL works |
| `emma_data_position.json` | Position simulator data (tracks 02–06) |
| `emma_data_focus.json` | Focus simulator data (tracks 07–11) |
| `emma_data_stage.json` | Sound Stage data (track 12) |
| `audio/` | 11 WAV stems (~67 MB total). Required at runtime |
| `tap-presets/` | Tonal Accuracy preset projects (auto-loaded on entry) |
| `emma_logo.webp` | Shared logo asset |
| `Rulebooks/` | Reference PDFs / docs (not used by the app) |

Login gate: password `emma2026` on the landing page (added in commit `ecad727`).

## Live deployment — Firebase Hosting (auto-deploy)

**The site is auto-deployed to Firebase Hosting on every push to `master`.**

- Firebase project ID: `emma-academy`
- Live URLs:
  - `https://emma-academy.web.app`
  - `https://emma-academy.firebaseapp.com`

### How the auto-deploy is wired

1. **Workflow**: [.github/workflows/firebase-hosting.yml](.github/workflows/firebase-hosting.yml)
   triggers on `push: branches: [master]` (also `workflow_dispatch` for manual runs).
2. It uses the official `FirebaseExtended/action-hosting-deploy@v0` action with
   `channelId: live` (production channel).
3. **Required GitHub secret**: `FIREBASE_SERVICE_ACCOUNT_EMMA_ACADEMY` — JSON
   service-account key for the `emma-academy` Firebase project. Stored at
   GitHub repo → Settings → Secrets and variables → Actions.
4. **Hosting config**: [firebase.json](firebase.json)
   - `public: "."` — serves repo root.
   - `ignore` excludes dev/build artefacts (`.bat`, extractor scripts, `README.txt`,
     `CLAUDE.md`, dotfiles, `node_modules/`).
   - `cleanUrls: true` strips `.html` extensions.
   - 1-hour `Cache-Control` on common static asset types.
5. **Project alias**: [.firebaserc](.firebaserc) sets default project to
   `emma-academy` so `firebase deploy` from a local clone targets the right project.

### Manual deploy (only if GitHub Actions is unavailable)

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```

### Things that DO NOT trigger a redeploy

- Pushes to non-`master` branches (e.g. the `claude/*` topic branches).
- Edits via PR until the PR is merged into `master`.

## Local development

The app cannot be opened with `file://` — it needs an HTTP origin to load JSON
and WAV files. Two options:

- **Windows, double-click**: [Start EMMA Academy.bat](Start EMMA Academy.bat).
  It auto-installs Node.js if missing, then serves on localhost and opens the
  browser.
- **Cross-platform**: `python -m http.server 8080` from the project root, then
  `http://localhost:8080/emma_academy.html`.

## Self-hosted distribution (legacy, alternative)

[README.txt](README.txt) documents how to deploy this app to *any* generic
static web server (Apache / Nginx / IIS) by uploading the folder. That path
predates the Firebase setup and is still valid for clients who want to host
the bundle on their own infrastructure (the `EMMA_ACADEMY_DEPLOY.rar` archive
is the packaged distribution for that case).

## Useful conventions in the codebase

- The HTML carries a `build:<short-sha>` tag in each module's topbar. Several
  commits are "Bump build tag to <sha>" — these are pure metadata bumps, not
  functional changes.
- `*_bak.html` files are .gitignored (`*_bak.*` rule) — the canonical file is
  always `emma_academy.html`.
- `create_slim_json.js` and `extract_emma_data.js` are one-off data prep
  scripts, not part of the runtime. They are excluded from hosting.
