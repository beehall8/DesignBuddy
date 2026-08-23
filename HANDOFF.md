# JewelCalc Remake — Handoff Notes

Written 2026-08-23. Use this to pick the project back up in a different
session/model/tool. The full source is in this same folder (and was sent
to you as `jewelcalc-remake.zip`).

## What this project is

A rebuild of the core of [jewelcalc.app](https://jewelcalc.app): upload a
3D jewelry model (STL/glTF), preview it in an interactive 3D viewer, and
get an estimated metal weight and cost from a material density library.
Vite + React + React Three Fiber, no backend.

## Decisions made so far (don't re-litigate these without reason)

- **Scope**: "Core + 3D viewer" only. Explicitly deferred: mesh repair,
  ring size chart, gemstone/band generators, 3D text tool, smart resizer,
  PDF report export, and any real account/billing system.
- **Stack**: Vite + React 18 (not Next.js), `@react-three/fiber` +
  `@react-three/drei` + `three` for the 3D viewer (not raw Three.js).
- **Auth**: placeholder/mock only — `localStorage`-based fake session,
  clearly labeled as such in the UI and in code comments. Real auth
  (Supabase or Firebase suggested) was deliberately left for later.
- **Deploy target**: Hostinger. Project includes both a static-build path
  (`dist/` uploaded to `public_html`) and a Node.js-hosting path
  (`server.js`, an Express static server reading `process.env.PORT`) since
  the user wasn't sure which Hostinger plan they're on.

## Current status: code complete, NOT build-verified, NOT deployed

- All source files exist and are believed complete (see file manifest
  below) — this was a from-scratch build, not an edit of an existing repo.
- **`npm install` was never actually run.** The sandbox this was built in
  has no network access to the npm registry or any CDN (`registry.npmjs.org`
  etc. all return 403 / "host not in allowlist"), so dependencies could
  never be installed there.
- As a substitute, every `.js`/`.jsx` file was syntax-checked with
  TypeScript's compiler in loose JS mode (`tsc --allowJs --checkJs false
  --jsx react-jsx --skipLibCheck`) and came back clean — so there are no
  stray braces/typos, but this does **not** catch: version-mismatch API
  errors, incorrect import paths inside `three`/`@react-three/drei`,
  runtime logic bugs, or React Three Fiber usage mistakes.
- **First thing to do in the next session: `npm install && npm run dev`,
  open it, upload a real STL, and fix whatever breaks.** Treat this as an
  unverified first draft, not a working build.
- Likely trouble spots to check first if something's broken:
  - `src/lib/loadModel.js` — `GLTFLoader.parse()` signature and
    `mergeGeometries` import path from `three/examples/jsm/utils/
    BufferGeometryUtils.js` (renamed from `mergeBufferGeometries` in
    newer three versions — this assumes the newer name, matching the
    pinned `three@^0.169.0` in `package.json`).
  - `src/components/Viewer3D.jsx` — the `<Bounds fit clip observe>` /
    `<Center>` combo from drei, and whether `CameraRig`'s manual camera
    positioning fights with `Bounds`' auto-fit on preset button clicks.
  - `package.json` version pins in general — written from memory, not
    verified against currently-published versions.

## GitHub push: blocked from this sandbox, needs to happen from your machine

The user asked to push this to GitHub so Hostinger's Git-deploy feature
could pull from it. This sandbox's network egress policy allows plain
unauthenticated `git ls-remote`-style reads to github.com, but **blocks
any authenticated request to github.com or api.github.com** (tested with
both a pasted PAT via curl/netrc and via git's credential helper — both
were rejected at the network layer: "no rule allows host" / "builtin
injection failed"). A user-provided PAT was received, tested, found
unusable from here, and then **deleted from this sandbox's disk** (it was
never successfully used for anything). **The user should treat that token
as burned and revoke it** at https://github.com/settings/tokens if they
haven't already.

Net result: the push was never completed. Steps to finish it (from the
user's own machine, or from an environment with normal GitHub access):

```bash
# 1. Create an empty repo on GitHub first (github.com/new) —
#    do NOT initialize it with a README/.gitignore/license.

# 2. From inside the unzipped project folder:
git init
git add .
git commit -m "Initial commit: JewelCalc remake"
git branch -M main
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

If continuing in a *different Claude session* that has normal (non-sandboxed)
network access or a connected GitHub integration, it may be able to do this
part directly — worth just asking it to push before falling back to manual
steps.

## File manifest

```
package.json          deps: react, react-dom, three, @react-three/fiber,
                       @react-three/drei; devDeps: vite, @vitejs/plugin-react,
                       express (for server.js), no test framework set up
vite.config.js
index.html
server.js              optional Node static server for Hostinger Node.js hosting
README.md              user-facing docs: features, running locally, deploying
                       to Hostinger (both paths), Vercel/Netlify, adding real auth
HANDOFF.md             this file
src/
  main.jsx              mounts <AuthProvider><App /></AuthProvider>
  App.jsx                top-level state + layout: sidebar (upload, materials,
                          calc settings, viewer options, history) / 3D viewer /
                          results panel. Owns geometry, volume, weight, material
                          selection, history state.
  index.css              all styling, dark theme, CSS variables in :root,
                          responsive breakpoint at 900px
  components/
    Login.jsx             mock sign-in/sign-up/guest screen
    Viewer3D.jsx           R3F Canvas, Model mesh, CameraRig for view presets,
                           Bounds/Center for auto-framing
    UploadDropzone.jsx     drag-drop + click file input, .stl/.glb/.gltf
    MaterialsPanel.jsx     material <select>, add-custom-material form,
                           restore-defaults button
    ResultsPanel.jsx       volume/weight/cost display + unit conversions
    HistoryPanel.jsx       list of saved past calculations
  lib/
    auth.jsx               mock auth context, localStorage-backed
    loadModel.js            STL/glTF/GLB parsing -> merged BufferGeometry
    volume.js               signed-tetrahedron volume calc, mm3->cm3,
                             weight/troy-oz/pennyweight conversions
    materials.js             ~20 default material densities (g/cm3),
                             load/save/restore via localStorage
    history.js               calculation history load/add/clear via localStorage
```

## Next steps, roughly in priority order

1. `npm install`, fix any dependency/version issues, get `npm run dev`
   actually rendering an uploaded STL correctly.
2. Sanity-check the weight math against a known real-world model (e.g. a
   ring STL with a manufacturer-quoted weight) — the volume math itself
   (signed tetrahedron method) is standard and should be correct, but it's
   never been run against real data.
3. Push to GitHub (see above) and connect Hostinger's Git deploy.
4. Decide on and wire up real auth (Supabase suggested in README) before
   any real users touch it — current login is 100% fake.
5. Revisit which of the deferred original-app features (mesh repair, ring
   size chart, gemstone/band generators, 3D text, smart resizer, PDF
   report export) to build next, if any.
