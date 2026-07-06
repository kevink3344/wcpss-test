import sql from 'mssql'

let pool: sql.ConnectionPool | null = null

export async function connectDB(): Promise<sql.ConnectionPool | null> {
  if (pool) return pool
  const connStr = process.env.AZURE_SQL_CONNECTION_STRING
  if (!connStr) {
    console.warn('AZURE_SQL_CONNECTION_STRING is not set — skipping database connection')
    return null
  }
  pool = await sql.connect(connStr)
  console.log('Connected to Azure SQL Database')
  return pool
}

export { sql }
