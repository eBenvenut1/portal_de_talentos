// app/Controllers/Http/CandidatoController.ts
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Candidato from 'App/Models/Candidato'
import Formacao from 'App/Models/Formacao'
import Habilidade from 'App/Models/Habilidade'
import HabilidadeCandidato from 'App/Models/HabilidadeCandidato'
import Reuniao from 'App/Models/Reuniao'
import Mail from '@ioc:Adonis/Addons/Mail'
import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'

export default class CandidatoController {
  // Função auxiliar para enviar emails de cancelamento de reuniões do candidato
  private async enviarEmailsCancelamentoCandidato(candidatoId: number, motivo: string) {
    try {
      // Buscar reuniões pendentes onde o candidato participa
      const reunioes = await Reuniao.query()
        .where('candidato_id', candidatoId)
        .where('status', 'Pendente')
        .preload('candidato', (candidatoQuery) => {
          candidatoQuery.preload('user')
        })
        .preload('gestor', (gestorQuery) => {
          gestorQuery.preload('user')
        })

      // Enviar emails para cada reunião
      for (const reuniao of reunioes) {
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

  public async index({ response, auth }: HttpContextContract) {
    const user = auth.use('api').user!
    
    const candidatos = await Candidato.query()
      .whereNot('users_id', user.id) // Excluir o candidato do usuário autenticado
      .preload('user')
      .preload('formacoes')

    // Buscar habilidades para todos os candidatos
    const candidatosCompletos = await Promise.all(
      candidatos.map(async (candidato) => {
        // Buscar habilidades deste candidato
        const habilidadesCandidato = await HabilidadeCandidato.query()
          .where('candidatos_id', candidato.id)
          .preload('habilidade')
        const habilidades = habilidadesCandidato.map(hc => hc.habilidade?.nome).filter(Boolean)
        return {
          ...candidato.serialize(),
          user: candidato.user ? {
            nome: candidato.user.nome,
            email: candidato.user.email
          } : null,
          formacoes: candidato.formacoes,
          habilidades
        }
      })
    )

    return response.ok({
      candidatos: candidatosCompletos
    })
  }

  public async editCandidato({ request, response, auth }: HttpContextContract) {
    const user = auth.use('api').user!
    const {
      cep,
      endereco,
      telefone,
      dnasc,
      habilidades, // array de IDs de habilidades
      formacoes // array de objetos de formação
    } = request.only([
      'nome', 'email', 'cep', 'endereco', 'telefone', 'dnasc',
      'habilidades', 'formacoes'
    ])

    const candidato = await Candidato.query()
      .where('users_id', user.id)
      .firstOrFail()

    // Iniciar transação
    const trx = await Database.transaction()

    try {

      // Atualizar dados do candidato
      candidato.cep = cep || candidato.cep
      candidato.endereco = endereco || candidato.endereco
      candidato.telefone = telefone || candidato.telefone
      candidato.dnasc = dnasc ? DateTime.fromISO(dnasc) : candidato.dnasc
      await candidato.save()

      // Atualizar habilidades (se fornecidas)
      if (habilidades !== undefined) {
        // Remover todas as habilidades atuais
        await HabilidadeCandidato.query()
          .where('candidatos_id', candidato.id)
          .delete()

        // Adicionar as novas habilidades
        if (habilidades.length > 0) {
          const habilidadesCandidato = habilidades.map(habilidadeId => ({
            candidatosId: candidato.id,
            habilidadesId: habilidadeId
          }))
          await HabilidadeCandidato.createMany(habilidadesCandidato)
        }
      }

      // Atualizar formações (se fornecidas)
      if (formacoes !== undefined) {
        // Remover todas as formações atuais
        await Formacao.query()
          .where('candidatos_id', candidato.id)
          .delete()

        // Adicionar as novas formações
        if (formacoes.length > 0) {
          const formacoesData = formacoes.map(formacao => ({
            candidatosId: candidato.id,
            curso: formacao.curso,
            instituicao: formacao.instituicao,
            conclusao: formacao.conclusao ? DateTime.fromISO(formacao.conclusao) : null,
            data_inicio: formacao.data_inicio ? DateTime.fromISO(formacao.data_inicio) : null
          }))
          await Formacao.createMany(formacoesData)
        }
      }

      await trx.commit()

      // 5. Retornar dados atualizados
      const candidatoAtualizado = await Candidato.query()
        .where('id', candidato.id)
        .preload('user')
        .preload('formacoes')
        .firstOrFail()

      const habilidadesAtualizadas = await HabilidadeCandidato.query()
        .where('candidatos_id', candidato.id)
        .preload('habilidade')

      return response.ok({
        message: 'Candidato atualizado com sucesso',
        candidato: candidatoAtualizado,
        habilidades: habilidadesAtualizadas.map(h => h.habilidade)
      })

    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const candidato = await Candidato.query()
      .where('id', params.id)
      .preload('user')
      .preload('formacoes')
      .firstOrFail()

    // Buscar habilidades do candidato
    const habilidades = await HabilidadeCandidato.query()
      .where('candidatos_id', candidato.id)
      .preload('habilidade')

    // Inclui nome e email do usuário autenticado diretamente no objeto candidato
    const candidatoJson = candidato.toJSON();
    candidatoJson.nome = candidato.user?.nome;
    candidatoJson.email = candidato.user?.email;

    return response.ok({
      candidato: candidatoJson,
      habilidades: habilidades.map(h => h.habilidade)
    })
  }

  public async addFormacao({ request, response, auth }: HttpContextContract) {
    const user = auth.use('api').user!
    const { curso, instituicao, conclusao } = request.only([
      'curso', 'instituicao', 'conclusao'
    ])

    const candidato = await Candidato.query()
      .where('users_id', user.id)
      .firstOrFail()

    const formacao = await Formacao.create({
      candidatosId: candidato.id,
      curso,
      instituicao,
      conclusao: conclusao ? DateTime.fromISO(conclusao) : null
    })

    return response.created({
      message: 'Formação adicionada com sucesso',
      formacao
    })
  }

  public async updateFormacao({ params, request, response, auth }: HttpContextContract) {
    const user = auth.use('api').user!
    const { curso, instituicao, conclusao } = request.only([
      'curso', 'instituicao', 'conclusao'
    ])

    const candidato = await Candidato.query()
      .where('users_id', user.id)
      .firstOrFail()

    const formacao = await Formacao.query()
      .where('id', params.id)
      .where('candidatos_id', candidato.id)
      .firstOrFail()

    formacao.curso = curso || formacao.curso
    formacao.instituicao = instituicao || formacao.instituicao
    formacao.conclusao = conclusao ? DateTime.fromISO(conclusao) : formacao.conclusao

    await formacao.save()

    return response.ok({
      message: 'Formação atualizada com sucesso',
      formacao
    })
  }

  public async deleteFormacao({ params, response, auth }: HttpContextContract) {
    const user = auth.use('api').user!

    const candidato = await Candidato.query()
      .where('users_id', user.id)
      .firstOrFail()

    const formacao = await Formacao.query()
      .where('id', params.id)
      .where('candidatos_id', candidato.id)
      .firstOrFail()

    await formacao.delete()

    return response.ok({
      message: 'Formação removida com sucesso'
    })
  }

  public async addHabilidade({ request, response, auth }: HttpContextContract) {
    const user = auth.use('api').user!
    const { habilidade_id } = request.only(['habilidade_id'])

    const candidato = await Candidato.query()
      .where('users_id', user.id)
      .firstOrFail()

    // Verificar se a habilidade existe
    const habilidade = await Habilidade.findOrFail(habilidade_id)

    // Verificar se o candidato já possui essa habilidade
    const existingHabilidade = await HabilidadeCandidato.query()
      .where('candidatos_id', candidato.id)
      .where('habilidades_id', habilidade_id)
      .first()

    if (existingHabilidade) {
      return response.badRequest({
        message: 'Candidato já possui essa habilidade'
      })
    }

    await HabilidadeCandidato.create({
      candidatosId: candidato.id,
      habilidadesId: habilidade_id
    })

    return response.created({
      message: 'Habilidade adicionada com sucesso',
      habilidade: habilidade
    })
  }

  public async removeHabilidade({ params, response, auth }: HttpContextContract) {
    const user = auth.use('api').user!

    const candidato = await Candidato.query()
      .where('users_id', user.id)
      .firstOrFail()

    const habilidadeCandidato = await HabilidadeCandidato.query()
      .where('candidatos_id', candidato.id)
      .where('habilidades_id', params.habilidade_id)
      .firstOrFail()

    await habilidadeCandidato.delete()

    return response.ok({
      message: 'Habilidade removida com sucesso'
    })
  }

  public async search({ request, response, auth }: HttpContextContract) {
    const user = auth.use('api').user!
    const q = request.input('q')

    // 1. Buscar candidatos pelo nome do usuário
    const candidatosPorNome = await Candidato.query()
      .whereNot('users_id', user.id) // Excluir o candidato do usuário autenticado
      .preload('user')
      .preload('formacoes')
      .whereHas('user', (userQuery) => {
        userQuery.whereRaw('LOWER(nome) LIKE ?', [`%${q.toLowerCase()}%`])
      })

    // 2. Buscar candidatos por habilidade
    // Primeiro, buscar todos os HabilidadeCandidato que tenham habilidade com nome igual à busca
    const habilidadesRelacionadas = await HabilidadeCandidato.query()
      .preload('habilidade', (h) => h.whereRaw('LOWER(nome) LIKE ?', [`%${q.toLowerCase()}%`]))

    // Filtrar apenas os que realmente têm habilidade correspondente
    const candidatosIdsPorHabilidade = habilidadesRelacionadas
      .filter(hc => hc.habilidade)
      .map(hc => hc.candidatosId)

    // Buscar candidatos por esses IDs
    let candidatosPorHabilidade: Candidato[] = []
    if (candidatosIdsPorHabilidade.length > 0) {
      candidatosPorHabilidade = await Candidato.query()
        .whereNot('users_id', user.id) // Excluir o candidato do usuário autenticado
        .preload('user')
        .preload('formacoes')
        .whereIn('id', candidatosIdsPorHabilidade)
    }

    // 3. Unir os resultados e remover duplicados
    const todosCandidatos = [...candidatosPorNome, ...candidatosPorHabilidade]
    const candidatosUnicos = Array.from(
      new Map(todosCandidatos.map(c => [c.id, c])).values()
    )

    // 4. Preencher habilidades de cada candidato
    const candidatosCompletos = await Promise.all(
      candidatosUnicos.map(async (candidato) => {
        const habilidadesCandidato = await HabilidadeCandidato.query()
          .where('candidatos_id', candidato.id)
          .preload('habilidade')
        const habilidades = habilidadesCandidato.map(hc => hc.habilidade?.nome).filter(Boolean)
        return {
          ...candidato.serialize(),
          user: candidato.user ? {
            nome: candidato.user.nome,
            email: candidato.user.email
          } : null,
          formacoes: candidato.formacoes,
          habilidades
        }
      })
    )

    return response.ok({ candidatos: candidatosCompletos })
  }

  public async criarPerfilCandidato({ request, auth, response }: HttpContextContract) {
    const user = auth.use('api').user!;
    const { cep, endereco, telefone, dnasc, habilidades, formacoes } = request.only([
      'cep', 'endereco', 'telefone', 'dnasc', 'habilidades', 'formacoes'
    ]);

    // Verifica se já existe
    const existe = await Candidato.query().where('users_id', user.id).first();
    if (existe) {
      return response.badRequest({ message: 'Perfil de candidato já existe.' });
    }

    const trx = await Database.transaction();

    try {
      const candidato = await Candidato.create({
        usersId: user.id,
        cep,
        endereco,
        telefone,
        dnasc,
      }, { client: trx });

      // Adicionar habilidades (se fornecidas)
      if (habilidades && habilidades.length > 0) {
        const habilidadesCandidato = habilidades.map(habilidadeId => ({
          candidatosId: candidato.id,
          habilidadesId: habilidadeId
        }));
        await HabilidadeCandidato.createMany(habilidadesCandidato, { client: trx });
      }

      // Adicionar formações (se fornecidas)
      if (formacoes && formacoes.length > 0) {
        const formacoesData = formacoes.map(formacao => ({
          candidatosId: candidato.id,
          curso: formacao.curso,
          instituicao: formacao.instituicao,
          conclusao: formacao.conclusao ? DateTime.fromISO(formacao.conclusao) : null,
          data_inicio: formacao.data_inicio ? DateTime.fromISO(formacao.data_inicio) : null
        }));
        await Formacao.createMany(formacoesData, { client: trx });
      }

      // Atualiza role_atual
      user.role_atual = 'candidato';
      await user.save();

      await trx.commit();

      // Recarregar o candidato com os relacionamentos
      await candidato.preload('formacoes');
      const habilidadesCandidato = await HabilidadeCandidato.query()
        .where('candidatos_id', candidato.id)
        .preload('habilidade');

      return response.ok({ 
        message: 'Perfil de candidato criado com sucesso.', 
        candidato: {
          ...candidato.serialize(),
          habilidades: habilidadesCandidato.map(h => h.habilidade)
        }
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  public async deleteCandidato({ auth, response }: HttpContextContract) {
    const user = auth.use('api').user!
    const trx = await Database.transaction()

    try {
      // Buscar o candidato do usuário
      const candidato = await Candidato.query()
        .where('users_id', user.id)
        .firstOrFail()

      // Enviar emails de cancelamento antes de cancelar as reuniões
      await this.enviarEmailsCancelamentoCandidato(candidato.id, 'perfil de candidato excluído')

      // Cancelar reuniões pendentes onde o candidato participa
      await Database
        .from('reunioes')
        .where('candidato_id', candidato.id)
        .where('status', 'Pendente')
        .update({ status: 'Cancelada' })

      // Excluir habilidades do candidato
      await HabilidadeCandidato.query()
        .where('candidatos_id', candidato.id)
        .delete()

      // Excluir formações do candidato
      await Formacao.query()
        .where('candidatos_id', candidato.id)
        .delete()

      // Excluir o candidato
      await candidato.delete()

      // Resetar role_atual se for candidato
      if (user.role_atual === 'candidato') {
        user.role_atual = ''
        await user.save()
      }

      await trx.commit()

      return response.ok({
        message: 'Perfil de candidato excluído com sucesso'
      })
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}