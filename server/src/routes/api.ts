import { Router } from 'express'
import { connectDB, sql } from '../db'

const router = Router()

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Database connection status
router.get('/status', async (_req, res) => {
  try {
    const pool = await connectDB()
    if (!pool) {
      return res.json({ connected: false, message: 'No connection string configured' })
    }
    const dbResult = await pool.request().query<{ name: string }>('SELECT DB_NAME() AS name')
    const dbName = dbResult.recordset[0]?.name ?? 'unknown'
    return res.json({ connected: true, message: `Connected to Azure SQL Server (${dbName})` })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.json({ connected: false, message })
  }
})

// APP_CONFIG
router.get('/config', async (_req, res) => {
  try {
    const pool = await connectDB()
    if (!pool) return res.status(503).json({ error: 'Database not connected' })
    const result = await pool.request().query('SELECT config_key, config_value FROM APP_CONFIG')
    const config = Object.fromEntries(result.recordset.map(r => [r.config_key, r.config_value]))
    return res.json(config)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
})

// Add your routes here

export default router
