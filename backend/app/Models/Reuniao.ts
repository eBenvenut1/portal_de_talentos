import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Gestor from './Gestor'
import Candidato from './Candidato'

export default class Reuniao extends BaseModel {
  public static table = 'reunioes'
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'gestor_id' })
  public gestorId: number

  @column({ columnName: 'candidato_id' })
  public candidatoId: number

  @column.dateTime()
  public data: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column()
  public status: string | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Gestor, {
    foreignKey: 'gestorId',
  })
  public gestor: BelongsTo<typeof Gestor>

  @belongsTo(() => Candidato, {
    foreignKey: 'candidatoId',
  })
  public candidato: BelongsTo<typeof Candidato>
}