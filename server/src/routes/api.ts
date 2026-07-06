import { Router } from 'express'

const router = Router()

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Add your routes here
// Example: router.get('/data', async (req, res) => { ... })

export default router
