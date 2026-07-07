import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import { createClient } from '@libsql/client'
import Knex from 'knex'

const client = process.env.DB_CLIENT || 'turso'

// ── Turso migration runner ────────────────────────────────────────────────────
async function migrateTurso() {
  const turso = createClient({
    url: process.env.TURSO_DB_URL!,
    authToken: process.env.TURSO_DB_AUTH_TOKEN,
  })

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `)

  // Run SQLite-compatible .sql files from db/migrations/sqlite/
  const dir = path.join(__dirname, '../../db/migrations/sqlite')
  if (!fs.existsSync(dir)) {
    console.log('No sqlite migrations directory found, skipping.')
    turso.close()
    return
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort()
  for (const file of files) {
    const applied = await turso.execute({ sql: 'SELECT 1 FROM _migrations WHERE filename = ?', args: [file] })
    if (applied.rows.length > 0) { console.log(`Skipping: ${file}`); continue }
    console.log(`Applying: ${file}`)
    const sql = fs.readFileSync(path.join(dir, file), 'utf8')
    await turso.executeMultiple(sql)
    await turso.execute({ sql: 'INSERT INTO _migrations (filename) VALUES (?)', args: [file] })
    console.log(`Applied: ${file}`)
  }

  turso.close()
}

// ── MSSQL / Knex migration runner ─────────────────────────────────────────────
async function migrateKnex() {
  const connStr = process.env.AZURE_SQL_CONNECTION_STRING || ''
  const parts: Record<string, string> = {}
  let bareServer = ''
  connStr.split(';').forEach((seg) => {
    const eq = seg.indexOf('=')
    if (eq === -1) { if (seg.trim()) bareServer = seg.trim(); return }
    parts[seg.slice(0, eq).trim().toLowerCase()] = seg.slice(eq + 1).trim()
  })
  const serverRaw = (parts['server'] || parts['data source'] || bareServer).replace(/^tcp:/i, '')
  const [serverHost, portStr] = serverRaw.split(',')

  const knex = Knex({
    client: 'mssql',
    connection: {
      server: serverHost,
      port: portStr ? parseInt(portStr, 10) : 1433,
      database: parts['database'] || parts['initial catalog'],
      user: parts['user id'] || parts['uid'],
      password: parts['password'] || parts['pwd'],
      options: { encrypt: true, trustServerCertificate: false },
    },
  })

  await knex.migrate.latest({
    directory: path.join(__dirname, '../../db/knex-migrations'),
    extension: 'ts',
    loadExtensions: ['.ts'],
  })

  await knex.destroy()
}

async function migrate() {
  console.log(`Running migrations (client: ${client})...`)
  if (client === 'mssql') {
    await migrateKnex()
  } else {
    await migrateTurso()
  }
  console.log('Migrations complete.')
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
