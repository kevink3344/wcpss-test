import 'dotenv/config'
import express from 'express'
import path from 'path'
import fs from 'fs'
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

async function runStartupMigrations() {
  if ((process.env.DB_CLIENT || 'turso') !== 'mssql') return
  // migrations live at <repo>/db/ in dev, or server/db/ in production deploy
  const migrationsDir = fs.existsSync(path.join(__dirname, '../../db/migrations/mssql'))
    ? path.join(__dirname, '../../db/migrations/mssql')
    : path.join(__dirname, '../db/migrations/mssql')
  if (!fs.existsSync(migrationsDir)) return

  // Ensure migrations tracking table exists
  await db.execute(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='_migrations' AND xtype='U')
    CREATE TABLE _migrations (
      id INT IDENTITY(1,1) PRIMARY KEY,
      filename NVARCHAR(255) NOT NULL UNIQUE,
      applied_at DATETIME2 DEFAULT GETDATE()
    )
  `)

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
  for (const file of files) {
    const rows = await db.execute(
      'SELECT 1 AS found FROM _migrations WHERE filename = ?',
      [file] as import('@libsql/client').InArgs
    )
    if (rows.length > 0) { console.log(`Migration already applied: ${file}`); continue }
    console.log(`Applying migration: ${file}`)
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    await db.execute(sql)
    await db.execute(
      'INSERT INTO _migrations (filename) VALUES (?)',
      [file] as import('@libsql/client').InArgs
    )
    console.log(`Applied: ${file}`)
  }
}

async function start() {
  try {
    await db.raw('SELECT 1')
    console.log('Database connected')
    await runStartupMigrations()
  } catch (err) {
    console.error('Database connection failed on startup — server will start without DB:', err)
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
