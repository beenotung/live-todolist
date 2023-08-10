import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

  if (!(await knex.schema.hasTable('todo_list'))) {
    await knex.schema.createTable('todo_list', table => {
      table.increments('id')
      table.text('name').notNullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('todo_item'))) {
    await knex.schema.createTable('todo_item', table => {
      table.increments('id')
      table.integer('todo_list_id').unsigned().notNullable().references('todo_list.id')
      table.text('title').notNullable()
      table.boolean('is_done').notNullable()
      table.timestamps(false, true)
    })
  }
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('todo_item')
  await knex.schema.dropTableIfExists('todo_list')
}
