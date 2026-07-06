import sql from 'mssql'

let pool: sql.ConnectionPool | null = null

function parseConnectionString(connStr: string): sql.config {
  const parts: Record<string, string> = {}
  let bareServer = ''

  connStr.split(';').forEach((segment) => {
    const eq = segment.indexOf('=')
    if (eq === -1) {
      // Bare segment (e.g. "tcp:host,port") — treat as server
      if (segment.trim()) bareServer = segment.trim()
      return
    }
    const key = segment.slice(0, eq).trim().toLowerCase()
    const val = segment.slice(eq + 1).trim()
    parts[key] = val
  })

  const serverRaw = (parts['server'] || parts['data source'] || bareServer).replace(/^tcp:/i, '')
  const [serverHost, portStr] = serverRaw.split(',')
  const port = portStr ? parseInt(portStr, 10) : 1433

  return {
    server: serverHost,
    port,
    database: parts['database'] || parts['initial catalog'],
    user: parts['user id'] || parts['uid'],
    password: parts['password'] || parts['pwd'],
    options: {
      encrypt: (parts['encrypt'] || 'true').toLowerCase() !== 'false',
      trustServerCertificate: (parts['trustservercertificate'] || '').toLowerCase() === 'true',
    },
  }
}

export async function connectDB(): Promise<sql.ConnectionPool | null> {
  if (pool) return pool
  const connStr = process.env.AZURE_SQL_CONNECTION_STRING
  if (!connStr) {
    console.warn('AZURE_SQL_CONNECTION_STRING is not set — skipping database connection')
    return null
  }
  const config = parseConnectionString(connStr)
  pool = await sql.connect(config)
  console.log('Connected to Azure SQL Database')
  return pool
}

export { sql }
