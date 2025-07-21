// app/Controllers/Http/ProfileController.ts
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'
import Candidato from 'App/Models/Candidato'
import Gestor from 'App/Models/Gestor'
import UpdateProfileValidator from 'App/Validators/UpdateProfileValidator'
import Database from '@ioc:Adonis/Lucid/Database'

export default class ProfileController {
  public async update({ request, response, auth }: HttpContextContract) {
    const user = auth.use('api').user!
    const payload = await request.validate(UpdateProfileValidator)
    
    const trx = await Database.transaction()
    
    try {
      // Atualizar dados do usuário
      if (payload.nome || payload.email) {
        user.useTransaction(trx)
        if (payload.nome) user.nome = payload.nome
        if (payload.email) user.email = payload.email
        await user.save()
      }

      // Verificar se é candidato ou gestor
      const candidato = await Candidato.query().where('users_id', user.id).first()
      const gestor = await Gestor.query().where('users_id', user.id).first()

      if (candidato) {
        // Atualizar dados do candidato
        candidato.useTransaction(trx)
        if (payload.cep !== undefined) candidato.cep = payload.cep
        if (payload.endereco !== undefined) candidato.endereco = payload.endereco
        if (payload.telefone !== undefined) candidato.telefone = payload.telefone
        await candidato.save()
      } else if (gestor && payload.nome_empresa) {
        // Atualizar dados do gestor
        gestor.useTransaction(trx)
        gestor.NomeEmpresa = payload.nome_empresa
        if (payload.cnpj !== undefined) gestor.cnpj = payload.cnpj
        await gestor.save()
      }

      await trx.commit()

      return response.ok({
        message: 'Perfil atualizado com sucesso',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email
        }
      })
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  public async updateRole({ request, response, auth }: HttpContextContract) {
    const user = auth.use('api').user!
    const { role_atual } = request.only(['role_atual'])

    // Validar se o role é válido
    if (!role_atual || !['gestor', 'candidato'].includes(role_atual)) {
      return response.badRequest({
        message: 'Role deve ser "gestor" ou "candidato"'
      })
    }

    // Verificar se o usuário tem o perfil correspondente
    if (role_atual === 'gestor') {
      const gestor = await Gestor.query().where('users_id', user.id).first()
      if (!gestor) {
        return response.badRequest({
          message: 'Você precisa criar um perfil de gestor primeiro'
        })
      }
    } else if (role_atual === 'candidato') {
      const candidato = await Candidato.query().where('users_id', user.id).first()
      if (!candidato) {
        return response.badRequest({
          message: 'Você precisa criar um perfil de candidato primeiro'
        })
      }
    }

    // Atualizar o role_atual
    user.role_atual = role_atual
    await user.save()

    return response.ok({
      message: 'Role atualizado com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role_atual: user.role_atual,
        tipo_usuario: user.role_atual
      }
    })
  }

  public async updatePassword({ request, response, auth }: HttpContextContract) {
    const user = auth.use('api').user!
    const { senha_atual, nova_senha, confirmacao_senha } = request.only([
      'senha_atual', 'nova_senha', 'confirmacao_senha'
    ])

    // Verificar se a senha atual está correta
    if (!(await Hash.verify(user.senha, senha_atual))) {
      return response.badRequest({
        message: 'Senha atual incorreta'
      })
    }

    // Verificar se as senhas coincidem
    if (nova_senha !== confirmacao_senha) {
      return response.badRequest({
        message: 'A confirmação da senha não confere'
      })
    }

    // Atualizar senha
    user.senha = await Hash.make(nova_senha)
    await user.save()

    return response.ok({
      message: 'Senha atualizada com sucesso'
    })
  }
}