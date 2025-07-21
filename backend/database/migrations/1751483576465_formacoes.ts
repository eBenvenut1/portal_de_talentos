import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'formacoes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
      .integer('candidatos_id')
      .unsigned()
      .references('id')
      .inTable('candidatos')
      .onDelete('CASCADE')
      table.string('curso').nullable()
      table.string('instituicao').nullable()
      table.date('conclusao').nullable()
      table.date('data_inicio').nullable()
      
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
