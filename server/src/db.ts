import Knex from 'knex'
import { createClient, type Client as LibsqlClient, type InStatement, type InArgs } from '@libsql/client'

export type Row = Record<string, unknown>

export interface DbClient {
  raw(sql: string): Promise<Row[]>
  select(table: string, columns?: string[]): Promise<Row[]>
  insert(table: string, rows: Row[]): Promise<void>
  execute(sql: string, args?: InArgs): Promise<Row[]>
  destroy(): Promise<void>
}

// ── Turso / libsql ────────────────────────────────────────────────────────────
class TursoClient implements DbClient {
  private client: LibsqlClient

  constructor() {
    this.client = createClient({
      url: process.env.TURSO_DB_URL!,
      authToken: process.env.TURSO_DB_AUTH_TOKEN,
    })
  }

  async raw(sql: string): Promise<Row[]> {
    const result = await this.client.execute(sql)
    return result.rows as Row[]
  }

  async select(table: string, columns: string[] = ['*']): Promise<Row[]> {
    const result = await this.client.execute(`SELECT ${columns.join(', ')} FROM ${table}`)
    return result.rows as Row[]
  }

  async insert(table: string, rows: Row[]): Promise<void> {
    const stmts: InStatement[] = rows.map((row) => {
      const keys = Object.keys(row)
      return {
        sql: `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
        args: Object.values(row) as InArgs,
      }
    })
    await this.client.batch(stmts, 'write')
  }

  async execute(sql: string, args: InArgs = []): Promise<Row[]> {
    const result = await this.client.execute({ sql, args })
    return result.rows as Row[]
  }

  async destroy(): Promise<void> {
    this.client.close()
  }
}

// ── MSSQL via Knex ────────────────────────────────────────────────────────────
function parseMssqlConnStr(connStr: string): Knex.Knex.Config {
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

class MssqlClient implements DbClient {
  private knex: Knex.Knex

  constructor() {
    this.knex = Knex(parseMssqlConnStr(process.env.AZURE_SQL_CONNECTION_STRING || ''))
  }

  async raw(sql: string): Promise<Row[]> {
    const result = await this.knex.raw(sql)
    return result?.[0] ?? result?.rows ?? []
  }

  async select(table: string, columns: string[] = ['*']): Promise<Row[]> {
    return this.knex(table).select(...columns)
  }

  async insert(table: string, rows: Row[]): Promise<void> {
    await this.knex(table).insert(rows)
  }

  async execute(sql: string, args: unknown[] = []): Promise<Row[]> {
    const result = await this.knex.raw(sql, args)
    return result?.[0] ?? result?.rows ?? []
  }

  async destroy(): Promise<void> {
    await this.knex.destroy()
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────
function createDb(): DbClient {
  const client = process.env.DB_CLIENT || 'turso'
  if (client === 'mssql') return new MssqlClient()
  return new TursoClient()
}

const db = createDb()
export default db


