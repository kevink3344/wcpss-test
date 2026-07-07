import { Router } from 'express'
import type { InArgs } from '@libsql/client'
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

// APP_SETTINGS
router.get('/settings', async (_req, res) => {
  try {
    const rows = await db.select('APP_SETTINGS', ['setting_key', 'setting_value', 'label', 'description'])
    return res.json(rows)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
})

router.put('/settings/:key', async (req, res) => {
  try {
    const { key } = req.params
    const { value } = req.body as { value: string }
    if (value === undefined) return res.status(400).json({ error: 'value is required' })
    const client = process.env.DB_CLIENT || 'turso'
    if (client === 'mssql') {
      await db.execute(
        'UPDATE APP_SETTINGS SET setting_value = ?, updated_at = GETDATE() WHERE setting_key = ?',
        [value, key] as InArgs
      )
    } else {
      await db.execute(
        "UPDATE APP_SETTINGS SET setting_value = ?, updated_at = datetime('now') WHERE setting_key = ?",
        [value, key] as InArgs
      )
    }
    return res.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
})

// Add your routes here

export default router
