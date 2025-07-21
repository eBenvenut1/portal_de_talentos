import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Gestor extends BaseModel {
  public static table = 'gestores'
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'users_id' })
  public usersId: number

  @column()
  public cnpj: string

  @column()
  public NomeEmpresa: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'usersId',
  })
  public user: BelongsTo<typeof User>
}