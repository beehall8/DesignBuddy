# Diamond Design

A rebuild of the core of [jewelcalc.app](https://jewelcalc.app): upload a 3D
jewelry model (STL or glTF/GLB), preview it in an interactive 3D viewer, and
get an estimated metal weight and cost based on a material density library.

## What's included (this pass)

- **3D viewer** — React Three Fiber canvas: orbit/zoom/pan, wireframe toggle,
  grid toggle, background color, view presets (iso/top/front/left).
- **Upload** — drag-and-drop or click-to-browse, `.stl`, `.glb`, `.gltf`
  (embedded-only; a `.gltf` that references separate `.bin`/texture files
  won't resolve them from a single upload).
- **Weight/cost calculator** — computes enclosed mesh volume (signed
  tetrahedron method), converts mm³ → cm³, multiplies by a material density
  (g/cm³) to get weight, and by an optional $/gram price to get an estimated
  cost. Includes a unit-scale correction field and a quantity field.
- **Materials library** — ~20 default jewelry alloys/metals with standard
  reference densities (editable list — add custom materials, restore
  defaults), persisted in the browser via `localStorage`.
- **History** — last 50 calculations saved locally per-browser.
- **Placeholder login** — an email/password screen plus "Continue as guest",
  gating the app. **This is not real authentication** — see below.

**Not included in this pass** (present in the original app, left out per
scoping): mesh repair, ring size chart, gemstone/band generators, 3D text
tool, smart resizer, PDF report export, and any real account system/billing.
Ask for any of these to be added next.

## Running locally

```bash
npm install
npm run dev       # dev server at http://localhost:5173
```

## Building for production

```bash
npm run build      # outputs static files to ./dist
npm run preview    # sanity-check the production build locally
```

`dist/` is a fully static site — plain HTML/CSS/JS. It does not require a
Node.js server to run; any static host works.

## Deploying to Hostinger

Hostinger offers two relevant hosting types — use whichever your plan has:

### Option A — Static / shared hosting (simplest)

1. `npm run build` locally (or in CI).
2. Upload the **contents** of `dist/` (not the folder itself) to
   `public_html/` via Hostinger's File Manager or FTP/SFTP.
3. Done — no Node.js involved at runtime.

### Option B — Hostinger Node.js hosting

If your plan is specifically a Node.js app plan (it wants a startup file and
a port), this project includes `server.js` for that:

1. Upload the whole project (or `git clone` it) to the app directory
   Hostinger gives you.
2. In the Hostinger Node.js app panel, set:
   - **Startup file**: `server.js`
   - **Node version**: 18+ recommended
3. Run `npm install` then `npm run build` (Hostinger's panel usually has an
   "Install"/"Build" step, or SSH in and run them manually).
4. Start/restart the app. `server.js` reads `process.env.PORT` (Hostinger
   sets this) and serves the built `dist/` folder.

Either option works — Option A is simpler if you don't specifically need a
running Node process.

### Deploying elsewhere (Vercel/Netlify)

Also works unmodified — both auto-detect Vite. Build command
`npm run build`, output directory `dist`. No extra config needed.

## Adding real authentication

The current login screen (`src/lib/auth.jsx`, `src/components/Login.jsx`) is
a **mock**: it stores `{ email, mode }` in `localStorage` and never verifies
anything against a server. Before this goes live with real users, swap it
for a real provider. Two good options that fit a static-front-end + Hostinger
setup:

- **Supabase Auth** — hosted, free tier, email/password + OAuth. Install
  `@supabase/supabase-js`, replace the `signIn`/`continueAsGuest` functions in
  `auth.jsx` with `supabase.auth.signInWithPassword(...)` etc. Also gives you
  a hosted Postgres DB if you want to sync materials/history across devices
  instead of per-browser `localStorage`.
- **Firebase Auth** — similar shape, pairs well if you'd rather use Firebase
  Hosting instead of Hostinger.

Either integrates without changing the rest of the app — `useAuth()` is the
only thing other components depend on.

## Project structure

```
src/
  components/
    Login.jsx          placeholder auth screen
    Viewer3D.jsx        R3F canvas + model rendering
    UploadDropzone.jsx  file input
    MaterialsPanel.jsx  material select + add-custom
    ResultsPanel.jsx    volume/weight/cost display
    HistoryPanel.jsx    saved calculation list
  lib/
    auth.jsx            mock auth context (localStorage)
    loadModel.js         STL/glTF parsing → BufferGeometry
    volume.js            mesh volume + unit conversions
    materials.js         default density library + persistence
    history.js            calculation history persistence
  App.jsx
  main.jsx
  index.css
server.js               optional Node static server (Hostinger Node.js hosting)
```

## Notes on accuracy

Like the original app, all weight/cost figures are **estimates**. Actual
cast weight depends on alloy composition, porosity, sprues/gates left on the
model, and finishing loss — and metal spot prices move constantly. The mesh
volume calculation assumes a closed (watertight) mesh; a model with holes or
flipped normals will still produce a number, but it may not be physically
meaningful. Mesh repair/validation was intentionally left out of this pass.
