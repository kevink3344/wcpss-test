import Knex from 'knex'
import path from 'path'

const client = process.env.DB_CLIENT || 'better-sqlite3'

function buildConfig(): Knex.Knex.Config {
  if (client === 'better-sqlite3') {
    return {
      client: 'better-sqlite3',
      connection: {
        filename: path.join(__dirname, '../../db/local.sqlite'),
      },
      useNullAsDefault: true,
    }
  }

  // MSSQL — parse ADO.NET connection string
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

  return {
    client: 'mssql',
    connection: {
      server: serverHost,
      port: portStr ? parseInt(portStr, 10) : 1433,
      database: parts['database'] || parts['initial catalog'],
      user: parts['user id'] || parts['uid'],
      password: parts['password'] || parts['pwd'],
      options: { encrypt: true, trustServerCertificate: false },
    },
  }
}

const db = Knex(buildConfig())

export default db

