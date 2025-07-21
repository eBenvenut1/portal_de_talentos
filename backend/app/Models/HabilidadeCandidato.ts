import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Habilidade from './Habilidade'
import Candidato from './Candidato'

export default class HabilidadeCandidato extends BaseModel {
  public static table = 'habilidade_candidatos'
  @column({ isPrimary: true })
  public id: number

  @column()
  public habilidadesId: number

  @column()
  public candidatosId: number

  @belongsTo(() => Habilidade, {
    foreignKey: 'habilidadesId',
  })
  public habilidade: BelongsTo<typeof Habilidade>

  @belongsTo(() => Candidato, {
    foreignKey: 'candidatosId',
  })
  public candidato: BelongsTo<typeof Candidato>
}