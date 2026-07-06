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

// Add your routes here

export default router
