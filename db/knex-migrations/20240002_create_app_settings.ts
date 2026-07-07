import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('APP_SETTINGS', (table) => {
    table.increments('id').primary()
    table.string('setting_key', 255).notNullable().unique()
    table.text('setting_value').nullable()
    table.string('label', 255).notNullable()
    table.string('description', 500).nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })

  await knex('APP_SETTINGS').insert([
    {
      setting_key: 'APP_TITLE',
      setting_value: 'WCPSS Test App',
      label: 'App Title',
      description: 'The title displayed in the application header',
    },
  ])
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('APP_SETTINGS')
}
