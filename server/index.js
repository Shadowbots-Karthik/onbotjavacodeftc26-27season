import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'
import fs from 'node:fs/promises'

const app = express()
const port = Number(process.env.PORT || 3001)
const here = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(here, '../data')
const dataFile = path.join(dataDir, 'shares.json')
app.use(express.json({ limit: '12mb' }))

async function readShares() {
  try { return JSON.parse(await fs.readFile(dataFile, 'utf8')) }
  catch { return {} }
}
async function writeShares(shares) {
  await fs.mkdir(dataDir, { recursive: true })
  await fs.writeFile(dataFile, JSON.stringify(shares, null, 2))
}
function validFiles(files) {
  return Array.isArray(files) && files.length > 0 && files.length <= 50 && files.every(file =>
    typeof file.name === 'string' && file.name.endsWith('.java') && typeof file.content === 'string' && file.content.length <= 1000000)
}

app.post('/api/shares', async (req, res) => {
  const { files, visibility = 'unlisted', title = 'Untitled FTC project' } = req.body || {}
  if (!validFiles(files)) return res.status(400).json({ error: 'Add 1–50 Java files (up to 1 MB each).' })
  if (!['public', 'unlisted'].includes(visibility)) return res.status(400).json({ error: 'Invalid visibility.' })
  const shares = await readShares()
  const id = randomBytes(6).toString('base64url')
  const share = { id, title: String(title).slice(0, 100), files, visibility, createdAt: new Date().toISOString(), comments: [] }
  shares[id] = share
  await writeShares(shares)
  res.status(201).json({ id, share })
})
app.get('/api/shares/:id', async (req, res) => {
  const share = (await readShares())[req.params.id]
  if (!share) return res.status(404).json({ error: 'This code share could not be found.' })
  res.json(share)
})
app.post('/api/shares/:id/comments', async (req, res) => {
  const { line, file, text, author = 'Mentor' } = req.body || {}
  if (!Number.isInteger(line) || line < 1 || typeof file !== 'string' || typeof text !== 'string' || !text.trim() || text.length > 2000)
    return res.status(400).json({ error: 'Add a line number and a comment of up to 2,000 characters.' })
  const shares = await readShares()
  const share = shares[req.params.id]
  if (!share) return res.status(404).json({ error: 'This code share could not be found.' })
  const comment = { id: randomBytes(8).toString('hex'), line, file, text: text.trim(), author: String(author).slice(0, 40), createdAt: new Date().toISOString() }
  share.comments.push(comment)
  await writeShares(shares)
  res.status(201).json(comment)
})

if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(here, '../dist')
  app.use(express.static(dist))
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}
app.listen(port, () => console.log(`CodeDock API listening on http://localhost:${port}`))
