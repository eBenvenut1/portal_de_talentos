import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
  BelongsTo,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany
} from '@ioc:Adonis/Lucid/Orm'

import User from './User'
import Formacao from './Formacao'
import Habilidade from './Habilidade'

export default class Candidato extends BaseModel {
  public static table = 'candidatos'

  @column({ isPrimary: true })
  public id: number

  @column()
  public usersId: number

  @column()
  public cep: string | null

  @column()
  public endereco: string | null

  @column.date()
  public dnasc: DateTime | null

  @column()
  public telefone: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  
  @belongsTo(() => User, {
    foreignKey: 'usersId',
  })
  public user: BelongsTo<typeof User>

  // 🔗 Relacionamento com Formações
  @hasMany(() => Formacao, {
    foreignKey: 'candidatosId',
  })
  public formacoes: HasMany<typeof Formacao>

  // 🔗 Relacionamento com Habilidades (many-to-many)
  @manyToMany(() => Habilidade, {
    pivotTable: 'habilidade_candidatos',
    pivotForeignKey: 'candidatos_id',
    pivotRelatedForeignKey: 'habilidades_id',
  })
  public habilidades: ManyToMany<typeof Habilidade>
}
