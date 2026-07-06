import fs from 'fs'
import path from 'path'
import sql from 'mssql'
import 'dotenv/config'

const MIGRATIONS_DIR = path.join(__dirname, '../db/migrations')

function parseConnectionString(connStr: string): sql.config {
  const parts: Record<string, string> = {}
  let bareServer = ''
  connStr.split(';').forEach((seg) => {
    const eq = seg.indexOf('=')
    if (eq === -1) { if (seg.trim()) bareServer = seg.trim(); return }
    parts[seg.slice(0, eq).trim().toLowerCase()] = seg.slice(eq + 1).trim()
  })
  const serverRaw = (parts['server'] || parts['data source'] || bareServer).replace(/^tcp:/i, '')
  const [serverHost, portStr] = serverRaw.split(',')
  return {
    server: serverHost,
    port: portStr ? parseInt(portStr, 10) : 1433,
    database: parts['database'] || parts['initial catalog'],
    user: parts['user id'] || parts['uid'],
    password: parts['password'] || parts['pwd'],
    options: { encrypt: true, trustServerCertificate: false },
  }
}

async function migrate() {
  const connStr = process.env.AZURE_SQL_CONNECTION_STRING
  if (!connStr) {
    console.error('AZURE_SQL_CONNECTION_STRING is not set')
    process.exit(1)
  }

  const pool = await sql.connect(parseConnectionString(connStr))

  // Create migrations tracking table if it doesn't exist
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='_migrations' AND xtype='U')
    CREATE TABLE _migrations (
      id INT IDENTITY(1,1) PRIMARY KEY,
      filename NVARCHAR(255) NOT NULL UNIQUE,
      applied_at DATETIME2 DEFAULT GETDATE()
    )
  `)

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const applied = await pool.request()
      .input('filename', sql.NVarChar, file)
      .query('SELECT 1 FROM _migrations WHERE filename = @filename')

    if (applied.recordset.length > 0) {
      console.log(`Skipping (already applied): ${file}`)
      continue
    }

    console.log(`Applying migration: ${file}`)
    const sqlText = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
    await pool.request().batch(sqlText)
    await pool.request()
      .input('filename', sql.NVarChar, file)
      .query('INSERT INTO _migrations (filename) VALUES (@filename)')
    console.log(`Applied: ${file}`)
  }

  await pool.close()
  console.log('All migrations complete.')
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
