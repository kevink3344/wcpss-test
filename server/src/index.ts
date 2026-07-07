import 'dotenv/config'
import express from 'express'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import db from './db'
import apiRouter from './routes/api'
import { swaggerSpec } from './swagger'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

// API routes
app.use('/api', apiRouter)

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec))

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
