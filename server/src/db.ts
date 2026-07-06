import sql from 'mssql'

const config: sql.config = {
  connectionString: process.env.AZURE_SQL_CONNECTION_STRING,
}

let pool: sql.ConnectionPool | null = null

export async function connectDB(): Promise<sql.ConnectionPool | null> {
  if (pool) return pool
  if (!process.env.AZURE_SQL_CONNECTION_STRING) {
    console.warn('AZURE_SQL_CONNECTION_STRING is not set — skipping database connection')
    return null
  }
  pool = await sql.connect(config)
  console.log('Connected to Azure SQL Database')
  return pool
}

export { sql }
