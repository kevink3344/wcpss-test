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
    await pool.request().query('SELECT 1')
    return res.json({ connected: true, message: 'Connected to Azure SQL Database' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.json({ connected: false, message })
  }
})

// Add your routes here

export default router
