import sql from 'mssql'

const config: sql.config = {
  connectionString: process.env.AZURE_SQL_CONNECTION_STRING,
}

let pool: sql.ConnectionPool | null = null

export async function connectDB(): Promise<sql.ConnectionPool> {
  if (pool) return pool
  pool = await sql.connect(config)
  console.log('Connected to Azure SQL Database')
  return pool
}

export { sql }
