import { Router } from 'express'
import db from '../db'

const router = Router()

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Database connection status
router.get('/status', async (_req, res) => {
  try {
    const isMssql = (process.env.DB_CLIENT || 'turso') === 'mssql'
    const rows = isMssql
      ? await db.raw('SELECT DB_NAME() AS name')
      : await db.raw("SELECT 'turso' AS name")
    const name = (rows[0] as Record<string, unknown>)?.name ?? 'unknown'
    return res.json({ connected: true, message: `Connected to Azure SQL Server (${name})` })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.json({ connected: false, message })
  }
})

// APP_CONFIG
router.get('/config', async (_req, res) => {
  try {
    const rows = await db.select('APP_CONFIG', ['config_key', 'config_value'])
    const config = Object.fromEntries(rows.map(r => [r.config_key, r.config_value]))
    return res.json(config)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
})

// Add your routes here

export default router
