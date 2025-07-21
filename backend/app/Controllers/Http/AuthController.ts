// app/Controllers/Http/AuthController.ts
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'
import User from 'App/Models/User'
import Candidato from 'App/Models/Candidato'
import Gestor from 'App/Models/Gestor'
import LoginValidator from 'App/Validators/LoginValidator'
import RegisterValidator from 'App/Validators/RegisterValidator'
import Database from '@ioc:Adonis/Lucid/Database'
import HabilidadeCandidato from 'App/Models/HabilidadeCandidato'
import Formacao from 'App/Models/Formacao'
import Reuniao from 'App/Models/Reuniao'
import Mail from '@ioc:Adonis/Addons/Mail'
import axios from 'axios'
import { DateTime } from 'luxon'

export default class AuthController {
  // Função auxiliar para enviar emails de cancelamento de reuniões
  private async enviarEmailsCancelamento(userId: number, motivo: string) {
    try {
      // Buscar reuniões pendentes onde o usuário participa como candidato
      const reunioesCandidato = await Reuniao.query()
        .whereHas('candidato', (query) => {
          query.where('users_id', userId)
        })
        .where('status', 'Pendente')
        .preload('candidato', (candidatoQuery) => {
          candidatoQuery.preload('user')
        })
        .preload('gestor', (gestorQuery) => {
          gestorQuery.preload('user')
        })

      // Buscar reuniões pendentes onde o usuário participa como gestor
      const reunioesGestor = await Reuniao.query()
        .whereHas('gestor', (query) => {
          query.where('users_id', userId)
        })
        .where('status', 'Pendente')
        .preload('candidato', (candidatoQuery) => {
          candidatoQuery.preload('user')
        })
        .preload('gestor', (gestorQuery) => {
          gestorQuery.preload('user')
        })

      // Enviar emails para reuniões onde o usuário é candidato
      for (const reuniao of reunioesCandidato) {
        // Email para o candidato
        await Mail.send((message) => {
          message
            .to(reuniao.candidato.user.email)
            .from('enzo.henrique@quaestum.com.br', 'Portal de Talentos')
            .subject('Reunião Cancelada - Portal de Talentos')
            .html(`
      <h2>Reunião Cancelada</h2>
      <p>Olá, ${reuniao.candidato.user.nome}!</p>
      <p>Infelizmente a reunião agendada foi cancelada devido ao seguinte motivo:</p>
      <p><strong>Motivo:</strong> ${motivo}</p>
      <p><strong>Detalhes da reunião cancelada:</strong></p>
      <ul>
        <li><strong>Data:</strong> ${reuniao.data.toFormat('dd/MM/yyyy HH:mm')}</li>
        <li><strong>Gestor:</strong> ${reuniao.gestor.user.nome}</li>
        <li><strong>Empresa:</strong> ${reuniao.gestor.NomeEmpresa}</li>
      </ul>
      <p>Pedimos desculpas pelo inconveniente. Você pode agendar uma nova reunião através do portal.</p>
      <p>Atenciosamente,<br>Equipe do Portal de Talentos</p>
    `)
        })

        // Email para o gestor
        await Mail.send((message) => {
          message
            .to(reuniao.gestor.user.email)
            .from('enzo.henrique@quaestum.com.br', 'Portal de Talentos')
            .subject('Reunião Cancelada - Portal de Talentos')
            .html(`
      <h2>Reunião Cancelada</h2>
      <p>Olá, ${reuniao.gestor.user.nome}!</p>
      <p>Infelizmente a reunião agendada foi cancelada devido ao seguinte motivo:</p>
      <p><strong>Motivo:</strong> ${motivo}</p>
      <p><strong>Detalhes da reunião cancelada:</strong></p>
      <ul>
        <li><strong>Data:</strong> ${reuniao.data.toFormat('dd/MM/yyyy HH:mm')}</li>
        <li><strong>Candidato:</strong> ${reuniao.candidato.user.nome}</li>
        <li><strong>Empresa:</strong> ${reuniao.gestor.NomeEmpresa}</li>
      </ul>
      <p>Pedimos desculpas pelo inconveniente. Você pode agendar uma nova reunião através do portal.</p>
      <p>Atenciosamente,<br>Equipe do Portal de Talentos</p>
    `)
        })
      }

      // Enviar emails para reuniões onde o usuário é gestor
      for (const reuniao of reunioesGestor) {
        // Email para o candidato
        await Mail.send((message) => {
          message
            .to(reuniao.candidato.user.email)
            .from('enzo.henrique@quaestum.com.br', 'Portal de Talentos')
            .subject('Reunião Cancelada - Portal de Talentos')
            .html(`
      <h2>Reunião Cancelada</h2>
      <p>Olá, ${reuniao.candidato.user.nome}!</p>
      <p>Infelizmente a reunião agendada foi cancelada devido ao seguinte motivo:</p>
      <p><strong>Motivo:</strong> ${motivo}</p>
      <p><strong>Detalhes da reunião cancelada:</strong></p>
      <ul>
        <li><strong>Data:</strong> ${reuniao.data.toFormat('dd/MM/yyyy HH:mm')}</li>
        <li><strong>Gestor:</strong> ${reuniao.gestor.user.nome}</li>
        <li><strong>Empresa:</strong> ${reuniao.gestor.NomeEmpresa}</li>
      </ul>
      <p>Pedimos desculpas pelo inconveniente. Você pode agendar uma nova reunião através do portal.</p>
      <p>Atenciosamente,<br>Equipe do Portal de Talentos</p>
    `)
        })

        // Email para o gestor
        await Mail.send((message) => {
          message
            .to(reuniao.gestor.user.email)
            .from('enzo.henrique@quaestum.com.br', 'Portal de Talentos')
            .subject('Reunião Cancelada - Portal de Talentos')
            .html(`
      <h2>Reunião Cancelada</h2>
      <p>Olá, ${reuniao.gestor.user.nome}!</p>
      <p>Infelizmente a reunião agendada foi cancelada devido ao seguinte motivo:</p>
      <p><strong>Motivo:</strong> ${motivo}</p>
      <p><strong>Detalhes da reunião cancelada:</strong></p>
      <ul>
        <li><strong>Data:</strong> ${reuniao.data.toFormat('dd/MM/yyyy HH:mm')}</li>
        <li><strong>Candidato:</strong> ${reuniao.candidato.user.nome}</li>
        <li><strong>Empresa:</strong> ${reuniao.gestor.NomeEmpresa}</li>
      </ul>
      <p>Pedimos desculpas pelo inconveniente. Você pode agendar uma nova reunião através do portal.</p>
      <p>Atenciosamente,<br>Equipe do Portal de Talentos</p>
    `)
        })
      }
    } catch (emailError) {
      console.error('Erro ao enviar emails de cancelamento:', emailError)
      // Não falha a exclusão se o email falhar
    }
  }

  public async register({ request, response, auth }: HttpContextContract) {
    const trx = await Database.transaction()

    try {
      const payload = await request.validate(RegisterValidator)

      let endereco = payload.endereco

      if (!endereco && payload.cep) {
        try {
          const viaCepResponse = await axios.get(`https://viacep.com.br/ws/${payload.cep}/json/`)
          if (viaCepResponse.data && !viaCepResponse.data.erro) {
            // Monte o endereço como preferir, exemplo:
            endereco = `${viaCepResponse.data.logradouro}, ${viaCepResponse.data.bairro}, ${viaCepResponse.data.localidade} - ${viaCepResponse.data.uf}`
          }
        } catch (e) {
          // Se der erro, pode manter o endereço vazio ou lançar erro
          endereco = ''
        }
      }

      // Criar usuário
      const user = await User.create({
        nome: payload.nome,
        email: payload.email,
        senha: await Hash.make(payload.senha),
        role_atual: payload.tipo_usuario // Definir role_atual automaticamente
      }, { client: trx })

      // Criar perfil específico baseado no tipo de usuário
      if (payload.tipo_usuario === 'candidato') {
        const candidato = await Candidato.create({
          usersId: user.id,
          cep: payload.cep!,
          endereco: endereco,
          telefone: payload.telefone!,
          dnasc: payload.dnasc!
        }, { client: trx })

        if (payload.formacoes && payload.formacoes.length > 0) {
          for (const formacao of payload.formacoes) {
            await Formacao.create({
              candidatosId: candidato.id,
              curso: formacao.curso,
              instituicao: formacao.instituicao,
              conclusao: formacao.conclusao // Certifique-se do formato da data
            }, { client: trx })
          }
        }

        for (const habilidadeId of payload.habilidades!) {
          await HabilidadeCandidato.create({
            habilidadesId: habilidadeId,
            candidatosId: candidato.id
          }, { client: trx })
        }

      } else {
        await Gestor.create({
          usersId: user.id,
          NomeEmpresa: payload.nome_empresa!,
          cnpj: payload.cnpj!
        }, { client: trx })
      }

      await trx.commit()

      // Fazer login automaticamente
      const token = await auth.use('api').generate(user)

      await Database
        .from('api_tokens')
        .where('token', token.token)
        .update({ expires_at: DateTime.now().plus({ days: 7 }).toSQL() })

      return response.created({
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo_usuario: payload.tipo_usuario,
          role_atual: user.role_atual
        },
        token
      })
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  public async login({ request, response, auth }: HttpContextContract) {
    try {
      const { email, senha } = await request.validate(LoginValidator)

      // Verificar se o usuário existe
      const user = await User.findBy('email', email)
      if (!user) {
        return response.badRequest({
          message: 'Credenciais inválidas'
        })
      }

      // Verificar a senha
      const isValid = await Hash.verify(user.senha, senha)
      if (!isValid) {
        return response.badRequest({
          message: 'Credenciais inválidas'
        })
      }

      // Gerar token
      const token = await auth.use('api').generate(user)
      await Database
        .from('api_tokens')
        .where('token', token.token)
        .update({ expires_at: DateTime.now().plus({ days: 7 }).toSQL() })

      // Verificar tipo de usuário
      const candidato = await Candidato.query().where('users_id', user.id).first()
      const tipoUsuario = candidato ? 'candidato' : 'gestor'

      return response.ok({
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo_usuario: tipoUsuario,
          role_atual: user.role_atual
        },
        token
      })
    } catch (error) {
      console.error('Erro no login:', error)
      return response.badRequest({
        message: 'Credenciais inválidas'
      })
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('api').logout()
    return response.ok({
      message: 'Logout realizado com sucesso'
    })
  }

  public async me({ auth, response }: HttpContextContract) {
    const user = auth.use('api').user!

    // Verificar tipo de usuário e carregar dados específicos
    const candidato = await Candidato.query()
      .where('users_id', user.id)
      .preload('habilidades')
      .preload('formacoes')
      .first()
    const gestor = await Gestor.query().where('users_id', user.id).first()

    let userData: any = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role_atual: user.role_atual,
      tipo_usuario: candidato ? 'candidato' : 'gestor'
    }

    // Sempre incluir os perfis disponíveis, mesmo que vazios
    userData.candidato = candidato ? {
      id: candidato.id,
      cep: candidato.cep,
      endereco: candidato.endereco,
      dnasc: candidato.dnasc,
      telefone: candidato.telefone,
      habilidades: candidato.habilidades || [],
      formacoes: candidato.formacoes || []
    } : null

    userData.gestor = gestor ? {
      id: gestor.id,
      nome_empresa: gestor.NomeEmpresa,
      cnpj: gestor.cnpj
    } : null

    return response.ok({
      user: userData
    })
  }

  public async deleteUser({ auth, response }: HttpContextContract) {
    const user = auth.use('api').user!
    const trx = await Database.transaction()

    try {
      // Enviar emails de cancelamento antes de excluir os perfis
      await this.enviarEmailsCancelamento(user.id, 'conta de usuário excluída')

      // Cancelar reuniões pendentes antes de excluir os perfis
      const candidato = await Candidato.query().where('users_id', user.id).first()
      const gestor = await Gestor.query().where('users_id', user.id).first()

      // Cancelar reuniões onde o usuário é candidato
      if (candidato) {
        await Database
          .from('reunioes')
          .where('candidato_id', candidato.id)
          .where('status', 'Pendente')
          .update({ status: 'Cancelada' })
      }

      // Cancelar reuniões onde o usuário é gestor
      if (gestor) {
        await Database
          .from('reunioes')
          .where('gestor_id', gestor.id)
          .where('status', 'Pendente')
          .update({ status: 'Cancelada' })
      }

      // Excluir perfil de candidato se existir
      if (candidato) {
        await candidato.delete()
      }

      // Excluir perfil de gestor se existir
      if (gestor) {
        await gestor.delete()
      }

      // Excluir tokens de API
      await Database
        .from('api_tokens')
        .where('user_id', user.id)
        .delete()

      // Excluir o usuário
      await user.delete()

      await trx.commit()

      return response.ok({
        message: 'Usuário excluído com sucesso'
      })
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}