import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'habilidade_candidatos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
      .integer('habilidades_id')
      .unsigned()
      .references('id')
      .inTable('habilidades')
      .onDelete('CASCADE')

      table
      .integer('candidatos_id')
      .unsigned()
      .references('id')
      .inTable('candidatos')
      .onDelete('CASCADE')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
