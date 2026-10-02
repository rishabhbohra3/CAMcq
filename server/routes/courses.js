import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const QUESTIONS_DIR = path.join(__dirname, '../../data/questions')

function slugify(filename) {
  return filename.replace(/\.json$/i, '').toLowerCase().replace(/\s+/g, '-')
}

function countQuestions(course) {
  let count = 0
  for (const section of course.sections || []) {
    for (const topic of section.topics || []) {
      for (const subtopic of topic.subtopics || []) {
        count += (subtopic.questions || []).length
        for (const passage of (subtopic.passages || [])) {
          count += (passage.questions || []).length
        }
      }
    }
  }
  return count
}

router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(QUESTIONS_DIR)) fs.mkdirSync(QUESTIONS_DIR, { recursive: true })
    const files = fs.readdirSync(QUESTIONS_DIR).filter(f => f.endsWith('.json'))
    const courses = files.map(filename => {
      try {
        const raw = fs.readFileSync(path.join(QUESTIONS_DIR, filename), 'utf8')
        const data = JSON.parse(raw)
        return {
          slug: slugify(filename),
          title: data.title || filename,
          description: data.description || '',
          totalQuestions: countQuestions(data),
        }
      } catch {
        return null
      }
    }).filter(Boolean)
    res.json(courses)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:slug', (req, res) => {
  try {
    const files = fs.readdirSync(QUESTIONS_DIR).filter(f => f.endsWith('.json'))
    const match = files.find(f => slugify(f) === req.params.slug)
    if (!match) return res.status(404).json({ error: 'Course not found' })
    const raw = fs.readFileSync(path.join(QUESTIONS_DIR, match), 'utf8')
    const data = JSON.parse(raw)
    res.json({ ...data, slug: req.params.slug })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
