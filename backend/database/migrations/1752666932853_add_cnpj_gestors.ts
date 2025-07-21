import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'gestores'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string("cnpj")
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('cnpj')
    })
  }
} 