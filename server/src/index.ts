import 'dotenv/config'
import express from 'express'
import path from 'path'
import db from './db'
import apiRouter from './routes/api'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

// API routes
app.use('/api', apiRouter)

// Serve React build
const publicPath = path.join(__dirname, '..', 'public')
app.use(express.static(publicPath))
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'))
})

async function start() {
  try {
    await db.raw('SELECT 1')
    console.log('Database connected')
  } catch (err) {
    console.error('Database connection failed on startup — server will start without DB:', err)
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
