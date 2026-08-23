// Minimal static file server for Node.js hosting environments (e.g. Hostinger's
// Node.js hosting) that expect an app entry point rather than a plain static
// site. Serves the Vite production build from ./dist.
//
// Usage:
//   npm run build   (produces ./dist)
//   npm start        (or: node server.js)
//
// Hostinger's Node.js hosting panel lets you set the "startup file" — point
// it at server.js. It sets process.env.PORT for you; this falls back to
// 3000 for local use.
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, 'dist')
const port = process.env.PORT || 3000

const app = express()
app.use(express.static(distDir))

// SPA fallback: any non-file route serves index.html so client-side
// routing (if added later) keeps working.
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(port, () => {
  console.log(`Diamond Design listening on port ${port}`)
})
