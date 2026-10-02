import express from 'express'
import cors from 'cors'
import coursesRouter from './routes/courses.js'
import progressRouter from './routes/progress.js'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.use('/api/courses', coursesRouter)
app.use('/api/progress', progressRouter)

app.listen(PORT, () => {
  console.log(`CAMcq API running at http://localhost:${PORT}`)
})
