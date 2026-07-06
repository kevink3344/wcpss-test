import 'dotenv/config'
import path from 'path'
import db from './db'

async function migrate() {
  console.log(`Running migrations (client: ${process.env.DB_CLIENT || 'better-sqlite3'})...`)
  await db.migrate.latest({
    directory: path.join(__dirname, '../../db/knex-migrations'),
    extension: 'ts',
    loadExtensions: ['.ts'],
  })
  console.log('Migrations complete.')
  await db.destroy()
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
