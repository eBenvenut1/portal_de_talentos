import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Candidato from './Candidato'

export default class Formacao extends BaseModel {
  public static table = 'formacoes'
  @column({ isPrimary: true })
  public id: number

  @column()
  public candidatosId: number

  @column()
  public curso: string | null

  @column()
  public instituicao: string | null

  @column.date({ columnName: 'conclusao' })
  public conclusao: DateTime | null

  @column.date({ columnName: 'data_inicio' })
  public dataInicio: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Candidato, {
    foreignKey: 'candidatosId',
  })
  public candidato: BelongsTo<typeof Candidato>
}
