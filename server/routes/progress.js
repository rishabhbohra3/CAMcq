import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROGRESS_DIR = path.join(__dirname, '../../data/progress')

function progressFile(slug) {
  return path.join(PROGRESS_DIR, `${slug}.json`)
}

router.get('/:slug', (req, res) => {
  try {
    if (!fs.existsSync(PROGRESS_DIR)) fs.mkdirSync(PROGRESS_DIR, { recursive: true })
    const file = progressFile(req.params.slug)
    if (!fs.existsSync(file)) return res.json(null)
    res.json(JSON.parse(fs.readFileSync(file, 'utf8')))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:slug', (req, res) => {
  try {
    const file = progressFile(req.params.slug)
    if (fs.existsSync(file)) fs.unlinkSync(file)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/:slug', (req, res) => {
  try {
    if (!fs.existsSync(PROGRESS_DIR)) fs.mkdirSync(PROGRESS_DIR, { recursive: true })
    fs.writeFileSync(progressFile(req.params.slug), JSON.stringify(req.body, null, 2))
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
