import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('APP_CONFIG', (table) => {
    table.increments('id').primary()
    table.string('config_key', 255).notNullable().unique()
    table.text('config_value').nullable()
    table.string('description', 500).nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })

  await knex('APP_CONFIG').insert([
    { config_key: 'APP_NAME',    config_value: 'WCPSS Test',  description: 'Display name of the application' },
    { config_key: 'MAINTENANCE', config_value: 'false',       description: 'Set to true to show maintenance banner' },
  ])
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('APP_CONFIG')
}
