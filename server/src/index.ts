import 'dotenv/config'
import express from 'express'
import path from 'path'
import { connectDB } from './db'
import apiRouter from './routes/api'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

// API routes
app.use('/api', apiRouter)

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '..', 'public')
  app.use(express.static(publicPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'))
  })
}

async function start() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
