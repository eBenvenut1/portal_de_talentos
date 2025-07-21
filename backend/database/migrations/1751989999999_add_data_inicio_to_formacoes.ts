import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'formacoes'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.date('data_inicio').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('data_inicio')
    })
  }
} 