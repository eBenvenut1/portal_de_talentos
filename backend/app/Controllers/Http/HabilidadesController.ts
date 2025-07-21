// app/Controllers/Http/HabilidadeController.ts
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Habilidade from 'App/Models/Habilidade'

export default class HabilidadeController {
  public async index({ response }: HttpContextContract) {
    const habilidades = await Habilidade.all()

    return response.ok({
      habilidades
    })
  }

  public async store({ request, response }: HttpContextContract) {
    const { nome } = request.only(['nome'])

    const habilidade = await Habilidade.create({
      nome
    })

    return response.created({
      message: 'Habilidade criada com sucesso',
      habilidade
    })
  }

  public async show({ params, response }: HttpContextContract) {
    const habilidade = await Habilidade.findOrFail(params.id)

    return response.ok({
      habilidade
    })
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { nome } = request.only(['nome'])
    const habilidade = await Habilidade.findOrFail(params.id)

    habilidade.nome = nome
    await habilidade.save()

    return response.ok({
      message: 'Habilidade atualizada com sucesso',
      habilidade
    })
  }

  public async destroy({ params, response }: HttpContextContract) {
    const habilidade = await Habilidade.findOrFail(params.id)
    await habilidade.delete()

    return response.ok({
      message: 'Habilidade removida com sucesso'
    })
  }
}
