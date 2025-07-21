// commands/MigrationFresh.ts
import { BaseCommand } from '@adonisjs/core/build/standalone'
import Database from '@ioc:Adonis/Lucid/Database'

export default class MigrationFresh extends BaseCommand {
  public static commandName = 'migration:fresh'
  public static description = 'Apaga todas as tabelas e recria todas as migrations'

  public async run() {
    try {
      this.logger.info('🧨 Apagando todas as tabelas...')

      // Desativa foreign keys para evitar erros na exclusão
      await Database.rawQuery(`SET FOREIGN_KEY_CHECKS = 0`)

      // Busca todas as tabelas do banco
      const tables = await Database.rawQuery(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `)

      // Apaga todas as tabelas
      for (const table of tables[0]) {
        await Database.rawQuery(`DROP TABLE IF EXISTS ${table.table_name}`)
        this.logger.info(`🗑️  Tabela ${table.table_name} apagada`)
      }

      // Reativa foreign keys
      await Database.rawQuery(`SET FOREIGN_KEY_CHECKS = 1`)

      this.logger.info('✅ Todas as tabelas foram apagadas com sucesso!')

      // Executa as migrations
      this.logger.info('🔄 Executando migrations...')
      await this.kernel.exec('migration:run', [])

      this.logger.info('🎉 Migrations executadas com sucesso!')

    } catch (error) {
      this.logger.error('❌ Erro ao executar migration:fresh')
      this.logger.error(error.message)
      throw error
    }
  }
}